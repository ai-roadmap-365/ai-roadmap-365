#!/usr/bin/env node
/**
 * Link validation (requirements §5.5, §6): every relative markdown link in
 * content/ and labs/ resolves to a real file, and every generated URL in
 * daily lab READMEs matches the central link helpers exactly.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { allDays, loadConfig, repoRoot, makeReporter } from '../lib/course.mjs';
import { generatedLinkBlock } from '../update-links.mjs';

const r = makeReporter('validate:links');
const config = loadConfig();

/**
 * Directories that sit inside a lab while you work but are not lab content.
 *
 * A lab that needs a third-party package documents a lab-local `.venv`, which
 * is gitignored — but this walk reads from DISK, not from git. Without this
 * list the validator reported NumPy's own bundled LICENSE files as "lab files
 * containing absolute repository URLs", which is true of the files and says
 * nothing about the lab.
 */
const NOT_LAB_CONTENT = new Set([
  '.venv',
  'venv',
  '__pycache__',
  '.pytest_cache',
  '.mypy_cache',
  '.ruff_cache',
  'node_modules',
  '.git',
  'out',
]);

function* walkMarkdown(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (NOT_LAB_CONTENT.has(entry)) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* walkMarkdown(full);
    else if (/\.(md|mdx)$/.test(entry)) yield full;
  }
}

// Relative links and images resolve on disk.
for (const dir of ['content', 'labs', 'instructor']) {
  for (const file of walkMarkdown(path.join(repoRoot, dir))) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/!?\[[^\]]*\]\(([^)#\s]+)(#[^)\s]*)?\)/g)) {
      const target = m[1];
      if (/^(https?:|mailto:)/.test(target)) continue;
      const resolved = path.resolve(path.dirname(file), target);
      if (!existsSync(resolved))
        r.fail(`${path.relative(repoRoot, file)}: broken relative link → ${target}`);
    }
  }
}

// Daily lab READMEs: the generated block must exactly match the generator
// output (README links are generated, never hand-maintained), and lab files
// must contain NO absolute repository URLs at all — relative-only, so the
// same files work in any repository without revealing another one exists.
const START = '<!-- generated-links:start';
const END = '<!-- generated-links:end -->';
for (const d of allDays().filter((x) => x.hasLab)) {
  const readme = readFileSync(path.join(d.labDir, 'README.md'), 'utf8');
  const si = readme.indexOf(START);
  const ei = readme.indexOf(END);
  if (si === -1 || ei === -1) {
    r.fail(`day ${d.number} lab README: missing generated-links block`);
  } else {
    const actual = readme.slice(si, ei + END.length);
    if (actual !== generatedLinkBlock(config, d))
      r.fail(
        `day ${d.number} lab README: generated-links block is stale — run npm run update:links`,
      );
  }
}
for (const dir of ['labs']) {
  for (const file of walkMarkdown(path.join(repoRoot, dir))) {
    const text = readFileSync(file, 'utf8');
    if (/github\.com\//.test(text))
      r.fail(
        `${path.relative(repoRoot, file)}: lab files must not contain absolute repository URLs`,
      );
  }
}

r.finish('all relative links resolve; generated blocks exact; no repository URLs in labs.');
