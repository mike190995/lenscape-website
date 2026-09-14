const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const HERO_DIR = path.resolve(__dirname, '..', 'public', 'hero');
const FRAME_COUNT = 177;
const BASE_INDEX = 1000;

async function convertHeroFrames() {
  console.log(`Starting Hero WebP conversion for ${FRAME_COUNT} frames...`);
  const startTime = Date.now();

  let totalPngSize = 0;
  let totalWebpSize = 0;
  let convertedCount = 0;

  for (let i = 0; i < FRAME_COUNT; i++) {
    const frameIndex = BASE_INDEX + i;
    const baseName = `lenscape glambot_17902106327947948917_sample_${frameIndex}`;
    const pngPath = path.join(HERO_DIR, `${baseName}.png`);
    const webpPath = path.join(HERO_DIR, `${baseName}.webp`);

    if (!fs.existsSync(pngPath)) {
      console.warn(`Warning: Frame not found: ${pngPath}`);
      continue;
    }

    const pngStat = fs.statSync(pngPath);
    totalPngSize += pngStat.size;

    // Convert to WebP (max width 1440, quality 82)
    const webpBuffer = await sharp(pngPath)
      .resize({ width: 1440, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    fs.writeFileSync(webpPath, webpBuffer);
    totalWebpSize += webpBuffer.length;
    convertedCount++;

    if (convertedCount % 25 === 0 || convertedCount === FRAME_COUNT) {
      console.log(`Converted ${convertedCount}/${FRAME_COUNT} frames...`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  const pngMb = (totalPngSize / (1024 * 1024)).toFixed(2);
  const webpMb = (totalWebpSize / (1024 * 1024)).toFixed(2);
  const reductionPct = (((totalPngSize - totalWebpSize) / totalPngSize) * 100).toFixed(1);

  console.log(`\n=== Conversion Complete in ${durationSec}s ===`);
  console.log(`Frames processed: ${convertedCount}`);
  console.log(`Original PNG size: ${pngMb} MB`);
  console.log(`Optimized WebP size: ${webpMb} MB`);
  console.log(`Bandwidth savings: ${reductionPct}% reduction (-${(pngMb - webpMb).toFixed(2)} MB)\n`);
}

convertHeroFrames().catch(err => {
  console.error('Conversion failed:', err);
  process.exit(1);
});
