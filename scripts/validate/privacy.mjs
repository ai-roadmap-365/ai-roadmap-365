#!/usr/bin/env node
/**
 * Privacy validation. One public repository (A31), so the source is the
 * published payload: no file may leak the authoring machine's paths or the
 * author's email, and learner-facing lesson content must not point readers at
 * the instructor answer keys.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { repoRoot, makeReporter } from '../lib/course.mjs';

const r = makeReporter('validate:privacy');

function* walk(dir, exts) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full, exts);
    else if (exts.test(entry)) yield full;
  }
}

// The authoring machine's real home/repo path must never appear in any
// source file (it leaks through exports and captured output). Caught here
// pre-commit, not just at release time.
const realHome = process.env.HOME || '';
for (const dir of ['content', 'labs']) {
  for (const file of walk(path.join(repoRoot, dir), /\.(md|mdx|yml|txt|sh|html|json)$/)) {
    const text = readFileSync(file, 'utf8');
    const rel = path.relative(repoRoot, file);
    if (text.includes(repoRoot)) r.fail(`${rel}: contains the real repo path (sanitize to <repo>)`);
    else if (
      realHome &&
      new RegExp(realHome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z0-9_-])').test(text)
    )
      r.fail(`${rel}: contains the authoring machine's home path (sanitize to <home>)`);
  }
}

// Lesson content must never reference instructor material (it would leak on export).
for (const file of walk(path.join(repoRoot, 'content'), /\.(md|mdx|yml)$/)) {
  const text = readFileSync(file, 'utf8');
  const rel = path.relative(repoRoot, file);
  // The daily lesson README's "Related directories" section may point
  // maintainers at the instructor tree; exports exclude READMEs, so only
  // flag instructor references in learner-facing files.
  if (!rel.endsWith('README.md') && text.includes('instructor/'))
    r.fail(`${rel}: learner-facing content references instructor/`);
}

// The author's personal email must not appear anywhere in the course. With a
// single public repository (A31) the source IS the published payload, so this
// is checked over content and labs directly rather than over an export folder.
// localhost is deliberately NOT checked here: lessons legitimately teach
// 127.0.0.1 and localhost ports, and the built site is checked separately by
// scripts/release/site.mjs immediately before it is pushed.
const AUTHOR_EMAIL = /sandeep[a-z0-9._%+-]*@[a-z0-9.-]+\.[a-z]+/i;
for (const dir of ['content', 'labs']) {
  for (const file of walk(path.join(repoRoot, dir), /\.(md|mdx|yml|txt|sh|html|json)$/)) {
    const text = readFileSync(file, 'utf8');
    if (AUTHOR_EMAIL.test(text))
      r.fail(`${path.relative(repoRoot, file)}: contains the author's email address`);
  }
}

r.finish(
  'no instructor leakage in lesson or lab content; no authoring paths, emails or admin routes in published content.',
);
