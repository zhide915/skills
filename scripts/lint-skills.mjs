#!/usr/bin/env node
// Checks each skill folder at plugins/*/skills/* and each agent file at plugins/*/agents/*.md against these rules:
// - A skill folder holds SKILL.md. The frontmatter opens on line 1, and its `name` is the folder name or the file name.
// - A model-invoked description says what the skill or agent is, then "Use when" with the triggers. A user-invoked
//   description (`disable-model-invocation: true`) is one line for a person, with no "Use when". A description that
//   holds ": " is quoted, because CRLF breaks the frontmatter parse.
// - The body opens with one paragraph, and each term in bold there is used again below it.
// - Each step reads `N. **Verb**:`, the steps count from 1, and each step ends on a line of its own: one "Done when"
//   sentence.
// - SKILL.md and an agent file have at most 600 words, and each other Markdown file at most 300.
// - Each `<plugin>:<name>` reference names a skill or an agent of the plugin. Each ALLCAPS.md name outside a code block,
//   and each `scripts/<name>` path, resolves inside the skill folder. Each script is `scripts/<name>.mjs`, and SKILL.md
//   shows how to run it.
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

function checkReferences(lines, file, dir, plugin, names) {
  const text = lines.join('\n');
  for (const [ref, owner, name] of text.matchAll(/\b([\w-]+):([a-z][\w-]*)\b/g)) {
    if (owner === plugin && !names.includes(name)) fail(file, lineOf(lines, ref), `"${ref}" names no skill or agent of ${plugin}`);
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

// The checks that a SKILL.md and an agent file share. `name` is the folder name of a skill, or the file name of an agent.
function checkEntry(file, lines, name, kind) {
  const { end, fields } = frontmatter(lines, file);

  if (fields.name?.value !== name) fail(file, fields.name?.line ?? 1, `frontmatter name must equal the ${kind} name "${name}"`);
  const desc = fields.description;
  if (!desc?.value) fail(file, 1, 'frontmatter must have a description');
  else if (fields['disable-model-invocation']?.value === 'true') {
    if (/\bUse when\b/.test(desc.value)) fail(file, desc.line, 'a user-invoked description is one line for a person, with no "Use when"');
  } else if (!/\. Use when /.test(desc.value)) fail(file, desc.line, `a model-invoked description says what the ${kind} is, then "Use when" with its triggers`);
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
  checkSteps(lines, file, hs);
  return end;
}

function checkMarkdown(path, lines, dir, plugin, names, limit, from) {
  if (words(lines) > limit) fail(path, 1, `${words(lines)} words, over the limit of ${limit}`);
  lines.forEach((l, i) => l.includes('—') && fail(path, i + 1, 'no em dash'));
  checkReferences(lines, path, dir, plugin, names);
  checkSentences(lines, path, from);
}

function checkSkill(skillsDir, plugin, name, names) {
  const dir = join(skillsDir, name);
  const file = join(dir, 'SKILL.md');
  if (!existsSync(file)) return fail(dir, 1, 'skill folder must hold SKILL.md');
  const lines = read(file);
  const end = checkEntry(file, lines, name, 'skill');

  for (const md of readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.md'))) {
    const path = join(dir, md);
    if (path === file) checkMarkdown(path, lines, dir, plugin, names, 600, end + 1);
    else checkMarkdown(path, read(path), dir, plugin, names, 300, 0);
  }

  const scripts = join(dir, 'scripts');
  for (const s of existsSync(scripts) ? readdirSync(scripts) : []) {
    if (!s.endsWith('.mjs')) fail(join(scripts, s), 1, 'a script is scripts/<name>.mjs');
    else if (!lines.join('\n').includes(`scripts/${s}`)) fail(join(scripts, s), 1, 'SKILL.md must show how to run each script');
  }
}

function checkAgent(agentsDir, plugin, file, names) {
  const path = join(agentsDir, file);
  const lines = read(path);
  const end = checkEntry(path, lines, file.slice(0, -3), 'agent');
  checkMarkdown(path, lines, agentsDir, plugin, names, 600, end + 1);
}

for (const plugin of subfolders(join(root, 'plugins'))) {
  const skillsDir = join(root, 'plugins', plugin, 'skills');
  const agentsDir = join(root, 'plugins', plugin, 'agents');
  const skills = subfolders(skillsDir);
  const agents = existsSync(agentsDir) ? readdirSync(agentsDir).filter((f) => f.endsWith('.md')) : [];
  const names = [...skills, ...agents.map((f) => f.slice(0, -3))];
  for (const name of skills) checkSkill(skillsDir, plugin, name, names);
  for (const file of agents) checkAgent(agentsDir, plugin, file, names);
}
for (const f of failures) console.log(f);
process.exitCode = failures.length ? 1 : 0;
