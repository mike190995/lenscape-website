const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('ffmpeg-static');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUR_WORK = path.join(ROOT, 'public', 'Portfolio', 'Our Work');
const ARCHIVE_DIR = path.join(ROOT, 'raw-media-archive');

function walk(dir, extRegex) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      res = res.concat(walk(full, extRegex));
    } else if (!extRegex || extRegex.test(item.name)) {
      res.push(full);
    }
  }
  return res;
}

async function optimizeImages() {
  console.log('--- OPTIMIZING IMAGES (Photo Albums, Ads, General Content) ---');
  const targetDirs = [
    path.join(OUR_WORK, 'Photo Albums'),
    path.join(OUR_WORK, 'Ads'),
    path.join(OUR_WORK, 'General Content'),
    path.join(OUR_WORK, 'Event labs portfolio')
  ];

  let totalBefore = 0;
  let totalAfter = 0;
  let count = 0;

  for (const dir of targetDirs) {
    const files = walk(dir, /\.(jpe?g|png)$/i);
    for (const file of files) {
      const stat = fs.statSync(file);
      const sizeBefore = stat.size;
      totalBefore += sizeBefore;

      try {
        const ext = path.extname(file).toLowerCase();
        const inputBuffer = fs.readFileSync(file);
        let pipeline = sharp(inputBuffer).resize({
          width: 2048,
          height: 2048,
          fit: 'inside',
          withoutEnlargement: true
        });

        let buf;
        if (ext === '.png') {
          buf = await pipeline.png({ compressionLevel: 9 }).toBuffer();
        } else {
          buf = await pipeline.jpeg({ quality: 84, mozjpeg: true }).toBuffer();
        }

        if (buf.length < sizeBefore) {
          fs.writeFileSync(file, buf);
          totalAfter += buf.length;
          count++;
          console.log(`Optimized [${count}]: ${path.relative(ROOT, file)}: ${(sizeBefore/1024/1024).toFixed(2)} MB -> ${(buf.length/1024).toFixed(1)} KB`);
        } else {
          totalAfter += sizeBefore;
        }
      } catch (err) {
        console.error('Error optimizing', file, err.message);
        totalAfter += sizeBefore;
      }
    }
  }

  console.log(`\nImages optimized: ${count}`);
  console.log(`Before: ${(totalBefore/1024/1024).toFixed(1)} MB | After: ${(totalAfter/1024/1024).toFixed(1)} MB | Saved: ${((totalBefore - totalAfter)/1024/1024).toFixed(1)} MB\n`);
}

async function handleVideos() {
  console.log('--- PROCESSING VIDEOS ---');
  const portfolioData = require(path.join(ROOT, 'portfolio-data.js'));
  const referencedVids = new Set();
  for (const p of portfolioData.PORTFOLIO_PROJECTS) {
    if (p.videoSrc) {
      const dec = decodeURIComponent(p.videoSrc).replace(/^\//, '').replace(/\//g, path.sep);
      referencedVids.add(path.resolve(ROOT, 'public', dec));
    }
  }

  const vidsDir = path.join(OUR_WORK, 'Videos');
  const allVids = walk(vidsDir, /\.(mp4|mov)$/i);

  // 1. Move unreferenced videos to archive
  let unrefCount = 0;
  for (const vid of allVids) {
    if (!referencedVids.has(path.resolve(vid))) {
      const rel = path.relative(vidsDir, vid);
      const targetArchive = path.join(ARCHIVE_DIR, 'unused_videos', rel);
      fs.mkdirSync(path.dirname(targetArchive), { recursive: true });
      fs.renameSync(vid, targetArchive);
      unrefCount++;
      console.log(`Archived unused video: ${path.relative(ROOT, vid)} -> ${path.relative(ROOT, targetArchive)}`);
    }
  }
  console.log(`Archived ${unrefCount} unreferenced videos.\n`);

  // 2. Compress referenced videos with faststart
  console.log('--- COMPRESSING REFERENCED VIDEOS ---');
  const activeVids = walk(vidsDir, /\.(mp4|mov)$/i);
  let vBefore = 0;
  let vAfter = 0;
  let vCount = 0;

  for (const vid of activeVids) {
    const stat = fs.statSync(vid);
    const szBefore = stat.size;
    vBefore += szBefore;

    const tmp = vid + '.temp.mp4';
    try {
      console.log(`Compressing: ${path.basename(vid)} (${(szBefore/1024/1024).toFixed(1)} MB)...`);
      cp.execFileSync(ffmpeg, [
        '-y', '-i', vid,
        '-c:v', 'libx264', '-crf', '26', '-preset', 'fast',
        '-c:a', 'aac', '-b:a', '128k',
        '-movflags', '+faststart',
        tmp
      ], { stdio: 'ignore' });

      if (fs.existsSync(tmp)) {
        const szAfter = fs.statSync(tmp).size;
        if (szAfter < szBefore) {
          fs.unlinkSync(vid);
          fs.renameSync(tmp, vid);
          vAfter += szAfter;
          vCount++;
          console.log(`✓ Compressed [${vCount}]: ${path.basename(vid)}: ${(szBefore/1024/1024).toFixed(1)} MB -> ${(szAfter/1024/1024).toFixed(1)} MB`);
        } else {
          fs.unlinkSync(tmp);
          vAfter += szBefore;
          console.log(`- Kept original for ${path.basename(vid)} (no reduction)`);
        }
      }
    } catch (err) {
      console.error('Error compressing video:', vid, err.message);
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      vAfter += szBefore;
    }
  }

  console.log(`\nVideos compressed: ${vCount}`);
  console.log(`Before: ${(vBefore/1024/1024).toFixed(1)} MB | After: ${(vAfter/1024/1024).toFixed(1)} MB | Saved: ${((vBefore - vAfter)/1024/1024).toFixed(1)} MB\n`);
}

async function main() {
  console.log('Starting Media Optimization Pipeline...\n');
  await optimizeImages();
  await handleVideos();
  console.log('All media optimization complete!');
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
