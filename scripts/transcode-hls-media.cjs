/**
 * LENSCAPE — HLS & ADAPTIVE VIDEO TRANSCODER
 * Transcodes production MP4s into adaptive HLS (.m3u8) streams
 * with H.264/AAC multi-segment packaging for low-latency streaming on Caribbean edge.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const ROOT = path.resolve(__dirname, '..');
const VIDEOS_DIR = path.join(ROOT, 'public', 'Portfolio', 'Our Work', 'Videos');
const HLS_OUTPUT_DIR = path.join(ROOT, 'dist-media', 'hls');

function walk(dir) {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      res = res.concat(walk(full));
    } else if (/\.(mp4|mov)$/i.test(item.name)) {
      res.push(full);
    }
  }
  return res;
}

async function transcodeVideos() {
  console.log('=== LENSCAPE VIDEO TRANSCODING & HLS PIPELINE ===');
  const videoFiles = walk(VIDEOS_DIR);
  console.log(`Discovered ${videoFiles.length} production videos.`);

  if (!fs.existsSync(HLS_OUTPUT_DIR)) {
    fs.mkdirSync(HLS_OUTPUT_DIR, { recursive: true });
  }

  let processed = 0;
  for (const vid of videoFiles) {
    const rel = path.relative(VIDEOS_DIR, vid);
    const parsed = path.parse(rel);
    const targetFolder = path.join(HLS_OUTPUT_DIR, parsed.dir, parsed.name);
    fs.mkdirSync(targetFolder, { recursive: true });

    const m3u8Path = path.join(targetFolder, 'index.m3u8');
    const segmentPattern = path.join(targetFolder, 'segment_%03d.ts');

    console.log(`[${++processed}/${videoFiles.length}] Transcoding to HLS: ${parsed.base}...`);

    try {
      execFileSync(ffmpeg, [
        '-y',
        '-i', vid,
        '-profile:v', 'main',
        '-level', '3.1',
        '-c:v', 'libx264',
        '-crf', '23',
        '-preset', 'fast',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ac', '2',
        '-f', 'hls',
        '-hls_time', '4',
        '-hls_playlist_type', 'vod',
        '-hls_segment_filename', segmentPattern,
        m3u8Path
      ], { stdio: 'ignore' });

      console.log(`  ✓ Generated HLS playlist: ${path.relative(ROOT, m3u8Path)}`);
    } catch (err) {
      console.error(`  ✕ Error transcoding ${parsed.base}:`, err.message);
    }
  }

  console.log(`\n=== HLS Transcoding Complete for ${processed} videos ===`);
  console.log(`Ready for Cloud Storage upload: gs://lenscape-video-cdn/hls/\n`);
}

transcodeVideos().catch(err => {
  console.error('Transcode failed:', err);
  process.exit(1);
});
