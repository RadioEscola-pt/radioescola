#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const NOTES_DIR = path.join(ROOT, 'content', 'notes');
const CATEGORIES = ['1', '2', '3'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function normalizeNote(raw) {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return trimmed
    .replace(/\r\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '  \n')
    .replace(/&nbsp;/gi, ' ');
}

function main() {
  const notesIndex = Object.fromEntries(CATEGORIES.map((cat) => [cat, []]));

  for (const cat of CATEGORIES) {
    const dataPath = path.join(DATA_DIR, `cat${cat}.json`);
    if (!fs.existsSync(dataPath)) {
      console.warn(`Skipping missing dataset: cat${cat}.json`);
      continue;
    }

    const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    if (!Array.isArray(raw.questions)) {
      console.warn(`Dataset cat${cat}.json is missing questions array`);
      continue;
    }

    let updated = false;
    const notesDir = path.join(NOTES_DIR, `cat${cat}`);
    ensureDir(notesDir);

    for (const question of raw.questions) {
      const noteContent = normalizeNote(question.notes);
      if (!noteContent) {
        question.notes = null;
        continue;
      }
      const id = question.uniqueID ?? question.id;
      if (typeof id !== 'number') {
        console.warn(`Question missing numeric uniqueID in cat${cat}`, question);
        continue;
      }
      const filename = `${id}.mdx`;
      const targetPath = path.join(notesDir, filename);
      fs.writeFileSync(targetPath, `${noteContent}\n`, 'utf8');
      notesIndex[cat].push(id);
      question.notes = null;
      updated = true;
    }

    if (updated) {
      // Sort IDs for determinism before persisting notes index
      notesIndex[cat].sort((a, b) => a - b);
      fs.writeFileSync(dataPath, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
    }
  }

  const indexPath = path.join(DATA_DIR, 'notes-index.json');
  fs.writeFileSync(indexPath, `${JSON.stringify(notesIndex, null, 2)}\n`, 'utf8');
  console.log(`Notes extraction complete. Manifest written to ${path.relative(ROOT, indexPath)}.`);
}

main();
