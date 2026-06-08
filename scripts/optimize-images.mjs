import sharp from 'sharp';
import { existsSync, renameSync, copyFileSync } from 'fs';
import { join } from 'path';

const PUBLIC = 'public';

const jobs = [
  // Hero Polaroid — displayed at ~132px but needs to look crisp on retina: 400px wide is plenty
  { src: 'image.png',           out: 'image.png',           width: 400,  format: 'png',  opts: { compressionLevel: 9, palette: false } },

  // Wave APNG — tiny, just recompress
  { src: 'wave.png',            out: 'wave.png',             width: 96,   format: 'png',  opts: { compressionLevel: 9 } },

  // Profile photo for OG card — 400px square is fine
  { src: 'linkedin.png',        out: 'linkedin.png',         width: 400,  format: 'png',  opts: { compressionLevel: 9 } },

  // Nix logo — marquee/inline, 200px wide plenty
  { src: 'nix.png',             out: 'nix.png',              width: 200,  format: 'png',  opts: { compressionLevel: 9 } },

  // UPV marquee logo
  { src: 'upv.png',             out: 'upv.png',              width: 400,  format: 'png',  opts: { compressionLevel: 9 } },

  // Project banners — max display width ~672px, 1344px for retina
  { src: 'nixbanner.png',       out: 'nixbanner.jpg',        width: 1344, format: 'jpeg', opts: { quality: 82, mozjpeg: true } },
  { src: 'daydreambanner.jpg',  out: 'daydreambanner.jpg',   width: 1344, format: 'jpeg', opts: { quality: 82, mozjpeg: true } },
  { src: 'challengebanner.jpg', out: 'challengebanner.jpg',  width: 1344, format: 'jpeg', opts: { quality: 82, mozjpeg: true } },
  { src: 'gocalpbanner.jpg',    out: 'gocalpbanner.jpg',     width: 1344, format: 'jpeg', opts: { quality: 82, mozjpeg: true } },
];

for (const { src, out, width, format, opts } of jobs) {
  const srcPath = join(PUBLIC, src);
  const outPath = join(PUBLIC, out);
  const tmpPath = outPath + '.tmp';

  if (!existsSync(srcPath)) { console.log(`SKIP ${src} (not found)`); continue; }

  const meta = await sharp(srcPath).metadata();
  const before = (await import('fs')).statSync(srcPath).size;

  let pipeline = sharp(srcPath).resize({ width, withoutEnlargement: true });

  if (format === 'jpeg') pipeline = pipeline.jpeg(opts);
  else if (format === 'png') pipeline = pipeline.png(opts);
  else if (format === 'webp') pipeline = pipeline.webp(opts);

  await pipeline.toFile(tmpPath);

  const after = (await import('fs')).statSync(tmpPath).size;
  const saving = ((1 - after / before) * 100).toFixed(1);

  // Only replace if smaller (or same name target)
  if (after < before || src !== out) {
    if (src !== out && existsSync(srcPath)) {
      // Keep original with .orig suffix just in case
    }
    renameSync(tmpPath, outPath);
    console.log(`✓ ${src} → ${out}  ${(before/1024/1024).toFixed(1)}MB → ${(after/1024/1024).toFixed(2)}MB  (${saving}% smaller)  ${meta.width}x${meta.height} → ${Math.min(width, meta.width ?? width)}w`);
  } else {
    renameSync(tmpPath, outPath);
    console.log(`✓ ${src} (already optimal, kept)  ${(after/1024).toFixed(0)}KB`);
  }
}

console.log('\nDone. Remember to update any .png banner references in lib/projects.ts → .jpg');
