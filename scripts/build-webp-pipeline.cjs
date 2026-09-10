const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const sharp = require('sharp');
const ffmpegPath = require('ffmpeg-static');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUR_WORK_DIR = path.join(ROOT_DIR, 'public', 'Portfolio', 'Our Work');
const THUMBS_DIR = path.join(ROOT_DIR, 'public', 'Portfolio', 'thumbnails');

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function walkFiles(dir, filterRegex) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(walkFiles(fullPath, filterRegex));
    } else if (!filterRegex || filterRegex.test(item.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

async function processVideos() {
  console.log('=== EXTRACTING VIDEO POSTERS (WEBP) ===');
  const videosDir = path.join(OUR_WORK_DIR, 'Videos');
  const videoFiles = walkFiles(videosDir, /\.(mp4|mov)$/i);
  console.log(`Found ${videoFiles.length} videos to process.`);

  let count = 0;
  for (const vidPath of videoFiles) {
    const relFromVideos = path.relative(videosDir, vidPath);
    const baseName = path.parse(vidPath).name;
    const subDir = path.dirname(relFromVideos);
    const targetDir = path.join(THUMBS_DIR, 'Videos', subDir);
    await ensureDir(targetDir);
    const targetWebp = path.join(targetDir, baseName + '.webp');

    const tempFrame = path.join(targetDir, baseName + '_temp.jpg');
    try {
      try {
        execFileSync(ffmpegPath, [
          '-y', '-ss', '00:00:01.000', '-i', vidPath,
          '-vframes', '1', '-q:v', '2', tempFrame
        ], { stdio: 'ignore' });
      } catch (err) {
        execFileSync(ffmpegPath, [
          '-y', '-ss', '00:00:00.100', '-i', vidPath,
          '-vframes', '1', '-q:v', '2', tempFrame
        ], { stdio: 'ignore' });
      }

      if (fs.existsSync(tempFrame)) {
        await sharp(tempFrame)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 84 })
          .toFile(targetWebp);

        fs.unlinkSync(tempFrame);
        count++;
        console.log(`? Extracted poster: ${path.relative(ROOT_DIR, targetWebp)}`);
      } else {
        console.warn(`? Failed to extract frame for: ${path.basename(vidPath)}`);
      }
    } catch (e) {
      console.error(`Error processing video ${vidPath}:`, e.message);
      if (fs.existsSync(tempFrame)) fs.unlinkSync(tempFrame);
    }
  }
  console.log(`Finished processing ${count} video posters.\n`);
}

async function convertImagesToWebP() {
  console.log('=== CONVERTING EXISTING THUMBNAILS TO WEBP ===');
  const imageFiles = walkFiles(THUMBS_DIR, /\.(jpg|jpeg|png)$/i);
  console.log(`Found ${imageFiles.length} existing thumbnails to convert to WebP.`);

  let count = 0;
  for (const imgPath of imageFiles) {
    const parsed = path.parse(imgPath);
    const targetWebp = path.join(parsed.dir, parsed.name + '.webp');
    try {
      await sharp(imgPath)
        .webp({ quality: 82 })
        .toFile(targetWebp);
      count++;
    } catch (e) {
      console.error(`Error converting ${imgPath}:`, e.message);
    }
  }
  console.log(`Finished converting ${count} thumbnails to .webp.\n`);
}

async function ensureAlbumWebPs() {
  console.log('=== VERIFYING ALBUMS & CONTENT IN WEBP ===');
  const albumFiles = walkFiles(OUR_WORK_DIR, /\.(jpg|jpeg|png)$/i);
  let generated = 0;

  for (const srcPath of albumFiles) {
    const rel = path.relative(OUR_WORK_DIR, srcPath);
    const parsed = path.parse(rel);
    const targetDir = path.join(THUMBS_DIR, parsed.dir);
    await ensureDir(targetDir);
    const targetWebp = path.join(targetDir, parsed.name + '.webp');

    if (!fs.existsSync(targetWebp)) {
      try {
        await sharp(srcPath)
          .resize({ width: 1200, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(targetWebp);
        generated++;
      } catch (e) {
        console.error(`Error building webp for ${srcPath}:`, e.message);
      }
    }
  }
  console.log(`Verified all albums: generated ${generated} additional WebP files.\n`);
}

async function main() {
  console.log('Starting WebP & Video Poster Pipeline...');
  await processVideos();
  await convertImagesToWebP();
  await ensureAlbumWebPs();
  console.log('?? WebP Pipeline Complete!');
}

main().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
