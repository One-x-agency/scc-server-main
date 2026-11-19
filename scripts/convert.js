#!/usr/bin/env node

/**
 * Recursively walks src directory and
 * appends .js to relative imports without extension
 */

import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(process.cwd(), 'src');

const VALID_EXTENSIONS = [
  '.js',
  '.ts',
  '.json',
  '.jsx',
  '.tsx',
  '.mjs',
  '.cjs',
];

function hasExtension(importPath) {
  return VALID_EXTENSIONS.some(
    (ext) => importPath.toLowerCase().endsWith(ext),
  );
}

function shouldTransform(importPath) {
  return (
    (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/'))
    && !hasExtension(importPath)
  );
}

function transformImports(content) {
  return content.replace(
    /(import\s+[^'"]+['"])([^'"]+)(['"])/g,
    (match, start, importPath, end) => {
      if (!shouldTransform(importPath)) return match;

      return `${start}${importPath}.js${end}`;
    },
  );
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = transformImports(original);

  if (original !== updated) {
    fs.writeFileSync(filePath, updated);
    console.log('✔ Updated:', filePath);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (
      entry.isFile()
      && (fullPath.endsWith('.ts') || fullPath.endsWith('.js'))
    ) {
      processFile(fullPath);
    }
  });
}

console.log('🔍 Scanning:', SRC_DIR);
walk(SRC_DIR);
console.log('✅ Done!');
