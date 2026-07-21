/**
 * compress-assets.js
 * Dev-only script — compresses all PNG/JPG assets that are bundled into the APK.
 * Run: node scripts/compress-assets.js
 *
 * Rules:
 *   - Agent icons (1254×1254) → resize to 256×256, PNG quality 80
 *   - Logo / splash icons (1024×1024) → keep 1024, but re-encode at quality 90
 *     (splash/icon.png and adaptive-icon.png must stay ≥1024 for Play Store)
 *   - banner.png → resize to 800 wide, quality 85
 *   - JPG screenshots (not bundled in APK, only in repo) → skip
 *   - tool.icons, demo, agnetpanel.screenshots → not in APK → skip
 *
 * DOES NOT change any logic. Only overwrites the asset files in-place.
 */

const sharp = require('sharp');
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const tasks = [
  // ── Agent icons (team agents + custom agent picker) ─────────────────────
  // These are shown at 28–64px in-app. 1254px originals are enormous.
  // 256×256 is 4× the largest in-app size — still perfectly crisp on all densities.
  { glob: 'assets/agent-icons/**/*.png', resize: 256, quality: 82 },

  // ── App logo — used in header, toast, coordination panel header ──────────
  // Shown at ~32–48px in-app. Keep at 512 so it stays sharp at 3× density.
  { file: 'assets/images/logo.png', resize: 512, quality: 90 },

  // ── Splash / launcher icons ──────────────────────────────────────────────
  // Play Store requires 512×512 minimum. Keep at 1024 but recompress.
  { file: 'assets/splash/icon.png',          resize: 1024, quality: 88 },
  { file: 'assets/splash/adaptive-icon.png', resize: 1024, quality: 88 },
  { file: 'assets/splash/splash-icon.png',   resize: 512,  quality: 88 },

  // ── Banner (README only — not in APK but let's still shrink for repo) ────
  { file: 'assets/images/banner.png', resize: 900, quality: 85 },

  // ── Favicon (web only — tiny, skip) ──────────────────────────────────────
];

// ── Expand glob-style tasks ──────────────────────────────────────────────────
function walkDir(dir, ext) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walkDir(full, ext));
    else if (entry.isFile() && entry.name.endsWith(ext)) files.push(full);
  }
  return files;
}

async function compressFile(filePath, resize, quality) {
  const before = fs.statSync(filePath).size;
  const tmp = filePath + '.tmp';
  try {
    let pipeline = sharp(filePath);
    const meta = await pipeline.metadata();

    // Only downscale — never upscale
    if (meta.width > resize || meta.height > resize) {
      pipeline = pipeline.resize(resize, resize, { fit: 'inside', withoutEnlargement: true });
    }

    // PNG: use compressionLevel 9 + palette quantisation where possible
    pipeline = pipeline.png({ quality, compressionLevel: 9, effort: 10 });

    await pipeline.toFile(tmp);
    const after = fs.statSync(tmp).size;

    if (after < before) {
      fs.renameSync(tmp, filePath);
      const saved = ((before - after) / 1024).toFixed(1);
      const pct   = ((1 - after / before) * 100).toFixed(1);
      console.log(`  ✓  ${path.relative(ROOT, filePath).padEnd(58)} ${(before/1024).toFixed(0).padStart(5)} KB → ${(after/1024).toFixed(0).padStart(5)} KB  (−${saved} KB / −${pct}%)`);
    } else {
      fs.unlinkSync(tmp);
      console.log(`  –  ${path.relative(ROOT, filePath).padEnd(58)} already optimal`);
    }
  } catch (err) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    console.error(`  ✗  ${path.relative(ROOT, filePath)}: ${err.message}`);
  }
}

async function main() {
  console.log('\n🗜  Zyron asset compressor\n' + '─'.repeat(80));
  let beforeTotal = 0, afterTotal = 0;

  for (const task of tasks) {
    let files = [];
    if (task.glob) {
      const dir = path.join(ROOT, task.glob.split('/**')[0]);
      files = walkDir(dir, '.png');
    } else if (task.file) {
      files = [path.join(ROOT, task.file)];
    }

    for (const f of files) {
      beforeTotal += fs.statSync(f).size;
      await compressFile(f, task.resize, task.quality);
      afterTotal += fs.statSync(f).size;
    }
  }

  const savedMB  = ((beforeTotal - afterTotal) / (1024 * 1024)).toFixed(2);
  const savedPct = ((1 - afterTotal / beforeTotal) * 100).toFixed(1);
  console.log('\n' + '─'.repeat(80));
  console.log(`  Total before : ${(beforeTotal  / (1024*1024)).toFixed(2)} MB`);
  console.log(`  Total after  : ${(afterTotal   / (1024*1024)).toFixed(2)} MB`);
  console.log(`  Saved        : ${savedMB} MB  (${savedPct}% reduction)\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
