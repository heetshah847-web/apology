// Usage: node scripts/hash-answer.mjs "her answer"
// Normalises (trim, lowercase, collapse spaces) and prints SHA-256 for story.config.json → passcode.answerSha256
import { createHash } from 'node:crypto';
const raw = process.argv.slice(2).join(' ');
if (!raw) { console.error('Give the answer in quotes'); process.exit(1); }
const norm = raw.trim().toLowerCase().replace(/\s+/g, ' ');
console.log(createHash('sha256').update(norm).digest('hex'));
