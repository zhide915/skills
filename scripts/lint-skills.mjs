#!/usr/bin/env node
// Checks each skill folder at plugins/*/skills/* against these rules:
// - The folder holds SKILL.md. Its frontmatter opens on line 1, and its `name` is the folder name.
// - A model-invoked description says what the skill is, then "Use when" with the triggers. A user-invoked description
//   (`disable-model-invocation: true`) is one line for a person, with no "Use when". A description that holds ": " is
//   quoted, because CRLF breaks the frontmatter parse.
// - The body opens with one paragraph, and each term in bold there is used again below it.
// - Each step reads `N. **Verb**:`, the steps count from 1, and each step ends on a line of its own: one "Done when"
//   sentence.
// - `## Report` is the last section, except in the `report-style` skill, which defines the report.
// - SKILL.md has at most 600 words, and each other Markdown file at most 300.
// - Each `<plugin>:<skill>` reference names a skill of the plugin. Each ALLCAPS.md name outside a code block, and each
//   `scripts/<name>` path, resolves inside the skill folder. Each script is `scripts/<name>.mjs`, and SKILL.md shows how to run it.
// - Each Status and Evidence table cell starts with a value from the Evidence section of the `report-style` skill.
// - A sentence has at most 20 words in a procedure, and at most 25 in other text.
// - No Markdown file holds an em dash.
// Prints one line for each failure as `path:line: rule`, from the repository root, and exits 1 if it printed a line.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (file, line, rule) => failures.push(`${relative(root, file).replaceAll('\\', '/')}:${line}: ${rule}`);
const subfolders = (dir) => (existsSync(dir) ? readdirSync(dir).filter((n) => statSync(join(dir, n)).isDirectory()) : []);
const read = (file) => readFileSync(file, 'utf8').split(/\r?\n/);
const words = (lines) => lines.join(' ').split(/\s+/).filter(Boolean).length;
const lineOf = (lines, needle) => lines.findIndex((l) => l.includes(needle)) + 1 || 1;

function frontmatter(lines, file) {
  if (lines[0] !== '---') return fail(file, 1, 'frontmatter must open on line 1'), { end: 0, fields: {} };
  const end = lines.indexOf('---', 1);
  const fields = {};
  for (let i = 1; i < end; i++) {
    const m = lines[i].match(/^([\w-]+):\s*(.*)$/);
    if (m) fields[m[1]] = { value: m[2], line: i + 1 };
  }
  return { end, fields };
}

// True for each line inside a fenced code block, so that the headings of an example report are not sections.
const fenced = (lines) => {
  let open = false;
  return lines.map((l) => (/^s*```/.test(l) ? ((open = !open), true) : open));
};
const headings = (lines, from) => {
  const inFence = fenced(lines);
  return lines.flatMap((l, i) => (i > from && !inFence[i] && /^## /.test(l) ? [{ title: l.slice(3).trim(), i }] : []));
};

// The allowed values of each table column, read from the Evidence section of the report-style skill, so that it stays the
// single source. A top bullet `- **Status**: **Pass**, ...` gives its bold values; nested `1. **Ran**` items add theirs.
function readValues(skillsDir) {
  const file = join(skillsDir, 'report-style', 'SKILL.md');
  if (!existsSync(file)) return {};
  const lines = read(file);
  const hs = headings(lines, 0);
  const k = hs.findIndex((h) => h.title === 'Evidence');
  if (k < 0) return fail(file, 1, 'report-style must have an Evidence section'), {};
  const values = {};
  let entry = null;
  for (let i = hs[k].i + 1; i < (hs[k + 1]?.i ?? lines.length); i++) {
    const top = lines[i].match(/^- \*\*([^*]+)\*\*:(.*)$/);
    const nested = lines[i].match(/^\s+(?:\d+\.|-) \*\*([^*]+)\*\*/);
    if (top) entry = values[top[1]] = [...top[2].matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1]);
    else if (nested && entry) entry.push(nested[1]);
  }
  return values;
}

const COLUMN = { Status: 'Status', Evidence: 'Evidence label' };

function checkTables(lines, file, values) {
  const cells = (l) => l.split('|').slice(1, -1).map((c) => c.trim());
  for (let i = 0; i + 1 < lines.length; i++) {
    if (!/^\s*\|/.test(lines[i]) || !/^\s*\|[-| :]+\|$/.test(lines[i + 1])) continue;
    const header = cells(lines[i]);
    for (let r = i + 2; r < lines.length && /^\s*\|/.test(lines[r]); r++) {
      cells(lines[r]).forEach((cell, c) => {
        const allowed = values[COLUMN[header[c]]];
        if (!allowed || cell === '' || cell.startsWith('<')) return;
        if (!allowed.some((v) => cell === v || cell.startsWith(`${v}:`) || cell.startsWith(`${v} at `))) {
          fail(file, r + 1, `${header[c]} "${cell}" must start with one of: ${allowed.join(', ')}`);
        }
      });
    }
  }
}

// A step is a top-level `N. **Verb**:` item. Its block runs to the next top-level item or heading.
function checkSteps(lines, file, hs) {
  const k = hs.findIndex((h) => h.title === 'Steps');
  if (k < 0) return;
  const end = hs[k + 1]?.i ?? lines.length;
  let n = 0;
  for (let i = hs[k].i + 1; i < end; i++) {
    if (!/^\d+\./.test(lines[i])) continue;
    n++;
    if (!/^\d+\. \*\*[^*]+\*\*:/.test(lines[i])) fail(file, i + 1, 'step must open with "N. **Verb**:"');
    else if (Number(lines[i].match(/^\d+/)[0]) !== n) fail(file, i + 1, `step number must be ${n}`);
    let j = i + 1;
    while (j < end && !/^(\d+\.|#)/.test(lines[j])) j++;
    const last = lines.slice(i, j).reverse().find((l) => l.trim() !== '') ?? '';
    if (!/^\s+Done when [^.]*\.$/.test(last.replace(/`[^`]*`/g, 'X'))) fail(file, i + 1, 'step must end on a line of its own: one "Done when" sentence');
  }
}

function checkReferences(lines, file, dir, plugin, skills) {
  const text = lines.join('\n');
  for (const [ref, owner, name] of text.matchAll(/\b([\w-]+):([a-z][\w-]*)\b/g)) {
    if (owner === plugin && !skills.includes(name)) fail(file, lineOf(lines, ref), `"${ref}" names no skill of ${plugin}`);
  }
  const inFence = fenced(lines);
  const prose = lines.filter((_, i) => !inFence[i]).join('\n');
  for (const [, name] of prose.matchAll(/`([A-Z][A-Z-]*\.md)`/g)) {
    if (!existsSync(join(dir, name))) fail(file, lineOf(lines, name), `"${name}" must exist in the skill folder`);
  }
  for (const [, path] of text.matchAll(/\bscripts\/([\w.-]+)/g)) {
    if (!existsSync(join(dir, 'scripts', path))) fail(file, lineOf(lines, path), `"scripts/${path}" must exist in the skill folder`);
  }
}

// ASD-STE100 limits a sentence to 20 words in a procedure and 25 in a description. A numbered or indented line is
// procedure. Code blocks, headings, and tables are skipped, and each code span counts as one word.
function checkSentences(lines, file, from) {
  const inFence = fenced(lines);
  lines.forEach((l, i) => {
    if (i < from || inFence[i] || /^\s*(#|\||$)/.test(l)) return;
    const limit = /^(\d+\.|\s+\S)/.test(l) ? 20 : 25;
    const text = l.replace(/^\s*\d+\. \*\*[^*]+\*\*:\s*/, '').replace(/`[^`]*`/g, 'X').replaceAll('**', '').replace(/^\s*(\d+\.|-)\s+/, '');
    for (const s of text.split(/(?<=[.?!])\s+/)) {
      const n = s.split(/\s+/).filter(Boolean).length;
      if (n > limit) fail(file, i + 1, `sentence of ${n} words, over ${limit}: "${s.slice(0, 40)}..."`);
    }
  });
}

function checkSkill(skillsDir, plugin, name, skills, values) {
  const dir = join(skillsDir, name);
  const file = join(dir, 'SKILL.md');
  if (!existsSync(file)) return fail(dir, 1, 'skill folder must hold SKILL.md');
  const lines = read(file);
  const { end, fields } = frontmatter(lines, file);

  if (fields.name?.value !== name) fail(file, fields.name?.line ?? 1, `frontmatter name must equal the folder name "${name}"`);
  const desc = fields.description;
  if (!desc?.value) fail(file, 1, 'frontmatter must have a description');
  else if (fields['disable-model-invocation']?.value === 'true') {
    if (/\bUse when\b/.test(desc.value)) fail(file, desc.line, 'a user-invoked description is one line for a person, with no "Use when"');
  } else if (!/\. Use when /.test(desc.value)) fail(file, desc.line, 'a model-invoked description says what the skill is, then "Use when" with its triggers');
  if (desc?.value.includes(': ') && !/^["']/.test(desc.value)) fail(file, desc.line, 'a description that holds ": " must be quoted');

  const hs = headings(lines, end);
  const opening = lines.slice(end + 1, hs[0]?.i ?? lines.length).map((l, k) => ({ l, i: end + 1 + k })).filter((x) => x.l.trim() !== '');
  if (opening.length !== 1 || /^[#\-\d]/.test(opening[0].l)) fail(file, end + 2, 'body must open with one paragraph');
  else {
    const after = lines.slice(opening[0].i + 1).join('\n');
    for (const [, term] of opening[0].l.matchAll(/\*\*([^*]+)\*\*/g)) {
      const re = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|es)?\\b`, 'i');
      if (!re.test(after)) fail(file, opening[0].i + 1, `bold term "${term}" must be used below the opening paragraph`);
    }
  }

  if (name !== 'report-style' && hs.at(-1)?.title !== 'Report') fail(file, hs.at(-1)?.i + 1 || 1, 'the last section must be Report');
  checkSteps(lines, file, hs);

  for (const md of readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.md'))) {
    const path = join(dir, md);
    const ml = path === file ? lines : read(path);
    const limit = path === file ? 600 : 300;
    if (words(ml) > limit) fail(path, 1, `${words(ml)} words, over the limit of ${limit}`);
    ml.forEach((l, i) => l.includes('\u2014') && fail(path, i + 1, 'no em dash'));
    checkReferences(ml, path, dir, plugin, skills);
    checkTables(ml, path, values);
    checkSentences(ml, path, path === file ? end + 1 : 0);
  }

  const scripts = join(dir, 'scripts');
  for (const s of existsSync(scripts) ? readdirSync(scripts) : []) {
    if (!s.endsWith('.mjs')) fail(join(scripts, s), 1, 'a script is scripts/<name>.mjs');
    else if (!lines.join('\n').includes(`scripts/${s}`)) fail(join(scripts, s), 1, 'SKILL.md must show how to run each script');
  }
}

for (const plugin of subfolders(join(root, 'plugins'))) {
  const skillsDir = join(root, 'plugins', plugin, 'skills');
  const skills = subfolders(skillsDir);
  const values = readValues(skillsDir);
  for (const name of skills) checkSkill(skillsDir, plugin, name, skills, values);
}
for (const f of failures) console.log(f);
process.exitCode = failures.length ? 1 : 0;
