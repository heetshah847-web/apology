// LANE-03 shared helpers for the media scripts.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const cfg = JSON.parse(fs.readFileSync(path.join(root, 'content/config/story.config.json'), 'utf8'));
export const RAW_PHOTOS = path.join(root, 'assets-drop/photos');
export const RAW_VIDEOS = path.join(root, 'assets-drop/videos');
export const OUT_PHOTOS = path.join(root, 'public/media/photos');
export const OUT_VIDEOS = path.join(root, 'public/media/videos');
export const MANIFEST = path.join(root, 'src/data/media.manifest.json');
export const CACHE_DIR = path.join(root, 'node_modules/.cache');
export const IMG_EXT = /\.(jpe?g|png|webp|avif|heic|tiff?)$/i;
export const VID_EXT = /\.(mp4|mov|m4v|webm)$/i;

/** Folder name -> id used in the manifest (`phase-1-friendship` -> `friendship`). */
export const HEETU = { folder: 'heetu-versions', id: 'heetu-versions' };
export const phaseFolders = () => [
  ...cfg.phases.map((p) => ({ folder: p.photos, id: p.id })),
  HEETU,
];

export const slug = (f) => path.parse(f).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const readJson = (p, fallback) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; } };
export const listFiles = (dir, re) => fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => re.test(f)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })) : [];
