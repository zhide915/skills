#!/usr/bin/env node
// Sweeps changes for secrets before they reach history or a remote.
//   --staged          The staged changes.
//   --range <range>   Each commit in a revision range, such as origin/main..HEAD, with merge commits as combined diffs.
// It scans each added line for known secret patterns, flags each added or changed file with a credential name, and lists
// each added or changed binary. A hit whose fingerprint is in .gitleaksignore is ignored. Exits 1 if a hit
// remains, 2 if the sweep could not run, and 0 otherwise.
import { spawn, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const die = (msg) => {
  console.error(`scan-secrets: ${msg}`);
  process.exit(2);
};

// Rule IDs match the gitleaks IDs where one exists, so that a .gitleaksignore line also works for gitleaks.
const RULES = [
  ['private-key', /-----BEGIN[ A-Z0-9_-]*PRIVATE KEY( BLOCK)?-----/],
  ['aws-access-token', /\b(?:A3T[A-Z0-9]|AKIA|ASIA|ABIA|ACCA)[A-Z0-9]{16}\b/],
  ['github-pat', /\bgh[pousr]_[0-9a-zA-Z]{36}\b/],
  ['github-fine-grained-pat', /\bgithub_pat_\w{82}\b/],
  ['gitlab-pat', /\bglpat-[\w-]{20}\b/],
  ['slack-token', /\bxox[baprs]-[0-9A-Za-z-]{10,}/],
  ['gcp-api-key', /\bAIza[\w-]{35}\b/],
  ['stripe-access-token', /\b(?:sk|rk)_(?:test|live|prod)_[0-9a-zA-Z]{10,99}\b/],
  ['anthropic-api-key', /\bsk-ant-[\w-]{20,}/],
  ['jwt', /\beyJ[\w-]{10,}\.eyJ[\w-]{10,}\.[\w-]{10,}/],
  ['generic-api-key', /(?:api[_-]?key|secret|token|passw(?:or)?d|pwd|access[_-]?key)["']?\s*[:=]\s*["'](?=[^"'\s]*\d)(?=[^"'\s]*[A-Za-z])([^"'\s$%{}<>]{8,})["']/i],
];
const CREDENTIAL_NAME = /\.(pem|key|p12|pfx|jks|keystore)$|^id_[^.]*$/i;

const args = process.argv.slice(2);
const staged = args[0] === '--staged';
const range = args[0] === '--range' ? args[1] : undefined;
if (!staged && !range) die('usage: scan-secrets.mjs --staged | --range <revision range>');

const topRun = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
if (topRun.status !== 0) die((topRun.stderr || 'not in a git repository').trim());
const top = topRun.stdout.trim();

const ignorePath = join(top, '.gitleaksignore');
const ignored = new Set(
  existsSync(ignorePath) ? readFileSync(ignorePath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#')) : [],
);

const findings = new Map();
const binaries = [];
let ignoredCount = 0;
const redact = (s) => (s.length > 8 ? `${s.slice(0, 4)}...` : '...');
function record(f) {
  const key = `${f.file}:${f.rule}:${f.line}`;
  if (ignored.has(key) || (f.commit && ignored.has(`${f.commit}:${key}`))) return ignoredCount++;
  findings.set(`${f.commit ?? ''}:${key}`, { ...f, fingerprint: key });
}

// Reads `git diff` or `git log -p --cc` output line by line. A hunk header has one @ more than the number of parents,
// and each content line has one prefix column per parent: a line with a + and no - in its prefix is added.
async function scanDiff(gitArgs) {
  const child = spawn('git', gitArgs, { cwd: top });
  let stderr = '';
  child.stderr.on('data', (d) => (stderr += d));
  const exit = new Promise((res) => child.on('close', res));
  let commit, file, width = 0, line = 0, inHunk = false;
  const endFile = () => {
    if (!file || file.deleted) return;
    if (CREDENTIAL_NAME.test(basename(file.path))) record({ commit, file: file.path, line: 1, rule: 'credential-file', match: basename(file.path) });
    if (file.binary) binaries.push({ commit, path: file.path });
  };
  for await (const l of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
    let m;
    if ((m = l.match(/^commit ([0-9a-f]{40,64})$/))) {
      endFile();
      [commit, file, inHunk] = [m[1], undefined, false];
    } else if ((m = l.match(/^diff --git (.*)$/)) || (m = l.match(/^diff --(?:cc|combined) (.*)$/))) {
      endFile();
      const p = l.startsWith('diff --git') ? m[1].slice(m[1].lastIndexOf(' b/') + 3) : m[1];
      [file, inHunk] = [{ path: p.replace(/^"|"$/g, '') }, false];
    } else if (!file) {
      continue;
    } else if ((m = l.match(/^(@{2,}) .*?\+(\d+)(?:,\d+)? @{2,}/))) {
      [width, line, inHunk] = [m[1].length - 1, Number(m[2]), true];
    } else if (!inHunk) {
      if (/^deleted file mode/.test(l)) file.deleted = true;
      if (/^(Binary files|GIT binary patch)/.test(l) && !/ and \/dev\/null differ$/.test(l)) file.binary = true;
    } else if (!l.startsWith('\\')) {
      const prefix = l.slice(0, width);
      if (prefix.includes('-')) continue;
      if (prefix.includes('+')) {
        const text = l.slice(width);
        for (const [rule, re] of RULES) {
          const hit = text.match(re);
          if (hit) record({ commit, file: file.path, line, rule, match: redact(hit[1] ?? hit[0]) });
        }
      }
      line++;
    }
  }
  endFile();
  if ((await exit) !== 0) die(`git ${gitArgs[0]} failed: ${stderr.trim()}`);
}

const common = ['--no-color', '--no-ext-diff', '--no-textconv', '--src-prefix=a/', '--dst-prefix=b/'];
await scanDiff(staged ? ['diff', '--cached', ...common] : ['log', '-p', '--cc', '--format=commit %H', ...common, range, '--']);

console.log(`Hits: ${findings.size}${ignoredCount ? ` (${ignoredCount} more ignored by .gitleaksignore)` : ''}`);
for (const f of findings.values()) {
  console.log(`  ${f.commit ? f.commit.slice(0, 7) : 'staged'}  ${f.file}:${f.line}  ${f.rule}  ${f.match}`);
  console.log(`    fingerprint: ${f.fingerprint}`);
}
console.log(`Binaries added or changed: ${binaries.length}`);
for (const b of binaries) console.log(`  ${b.commit ? b.commit.slice(0, 7) : 'staged'}  ${b.path}`);
process.exitCode = findings.size ? 1 : 0;
