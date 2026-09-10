const fs = require('fs');
const path = require('path');

function getPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  // PNG header: 8 bytes, IHDR chunk starts at byte 12
  // Width is 4 bytes at offset 16, Height is 4 bytes at offset 20
  if (buf.slice(0, 8).toString('hex') === '89504e470d0a1a0a') {
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    return { width, height, ratio: (width / height).toFixed(2) };
  }
  return null;
}

['Ads', 'General Content'].forEach(dir => {
  const full = path.join('public', 'Portfolio', 'Our Work', dir);
  console.log('=== ' + dir + ' ===');
  fs.readdirSync(full).forEach(f => {
    if (f.endsWith('.png')) {
      const dim = getPngDimensions(path.join(full, f));
      console.log(f, dim);
    }
  });
});
