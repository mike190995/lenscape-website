#!/bin/bash
# Lenscape One-Click Deployment Pipeline (Bash/macOS/Linux)
set -e

echo "=========================================================="
echo "     LENSCAPE UNIFIED DEPLOYMENT & SYNC PIPELINE"
echo "=========================================================="

# 1. OPTIMIZE & TRANSCODE MEDIA
echo -e "\n[Step 1/4] Running media optimization & transcoding..."
echo "-> Optimizing JPEGs and PNGs inside public/Portfolio..."
node scripts/optimize-portfolio-images.cjs
echo "-> Transcoding videos to HLS adaptive streams..."
if node scripts/transcode-hls-media.cjs; then
    echo "✓ Media optimization completed."
else
    echo "⚠️ Optimization step skipped or failed. Proceeding with raw streams..."
fi

# 2. UPLOAD MEDIA TO CLOUD STORAGE CDN
echo -e "\n[Step 2/4] Syncing local portfolio media to Google Cloud Storage CDN..."
gcloud storage rsync -r public/Portfolio gs://lenscape-media-cdn/Portfolio \
    --cache-control="public, max-age=31536000, immutable"

# 3. BUILD THE WEB APP
echo -e "\n[Step 3/4] Building production web bundle..."
npm run build
echo "✓ Website build completed."

# 4. DEPLOY FE TO GOOGLE CLOUD RUN
echo -e "\n[Step 4/4] Deploying website container to Google Cloud Run..."
gcloud run deploy lenscape-website \
    --source . \
    --project lenscape-company \
    --region us-east1 \
    --allow-unauthenticated \
    --quiet

echo "=========================================================="
echo "  DEPLOYMENT & SYNC COMPLETE!"
echo "  - CDN Media:  https://storage.googleapis.com/lenscape-media-cdn/Portfolio/"
echo "  - Live Website: Check your Cloud Run Service URL"
echo "=========================================================="
