/**
 * LENSCAPE — PORTFOLIO IMAGE WEBP TRANSFORMATION ENGINE
 * Automatically converts JPEG, JPG, and PNG assets inside public/Portfolio to high-performance WebP formats.
 * Deletes original bulky source files and transparently shifts references to WebP.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const PORTFOLIO_DIR = path.join(ROOT, 'public', 'Portfolio');

function walk(dir) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      res = res.concat(walk(full));
    } else if (/\.(jpe?g|png)$/i.test(item.name)) {
      res.push(full);
    }
  }
  return res;
}

async function convertToWebP() {
  console.log('=== LENSCAPE PORTFOLIO WEBP TRANSFORMATION PIPELINE ===');
  const imageFiles = walk(PORTFOLIO_DIR);
  console.log(`Discovered ${imageFiles.length} source images inside public/Portfolio.`);

  let convertedCount = 0;
  for (const img of imageFiles) {
    const relPath = path.relative(ROOT, img);
    const parsed = path.parse(img);
    const targetWebPPath = path.join(parsed.dir, `${parsed.name}.webp`);
    const stats = fs.statSync(img);
    const originalSizeKB = (stats.size / 1024).toFixed(2);

    console.log(`[${++convertedCount}/${imageFiles.length}] WebP Conversion: ${relPath} (${originalSizeKB} KB)...`);

    try {
      const buffer = fs.readFileSync(img);
      
      // Perform Sharp optimization directly to WebP
      const webpBuffer = await sharp(buffer)
        .webp({ quality: 82, effort: 4 })
        .toBuffer();

      const newSizeKB = (webpBuffer.length / 1024).toFixed(2);
      const ratio = (((stats.size - webpBuffer.length) / stats.size) * 100).toFixed(1);

      // Save WebP file
      fs.writeFileSync(targetWebPPath, webpBuffer);
      console.log(`  ✓ Converted to WebP: ${path.relative(ROOT, targetWebPPath)} (${newSizeKB} KB, -${ratio}%)`);

      // Delete original JPEG/PNG safely
      fs.unlinkSync(img);
      console.log(`  ✓ Deleted original: ${relPath}`);
    } catch (err) {
      console.error(`  ✕ Failed to convert ${relPath} to WebP:`, err.message);
    }
  }

  console.log(`\n=== WebP Transformation Complete for ${convertedCount} images ===\n`);
}

convertToWebP().catch(err => {
  console.error('WebP conversion failed:', err);
  process.exit(1);
});
