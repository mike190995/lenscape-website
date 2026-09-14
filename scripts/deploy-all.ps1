<#
.SYNOPSIS
    Lenscape One-Click Deployment Pipeline.
.DESCRIPTION
    Automates the entire flow:
    1. Transcodes portfolio videos to adaptive HLS/MP4 formats.
    2. Synchronizes updated media assets to the Google Cloud Storage bucket.
    3. Builds the production-optimized static website.
    4. Deploys the frontend container to Google Cloud Run.
.EXAMPLE
    .\scripts\deploy-all.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     LENSCAPE UNIFIED DEPLOYMENT & SYNC PIPELINE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. OPTIMIZE & TRANSCODE MEDIA
Write-Host "`n[Step 1/4] Running media optimization & transcoding..." -ForegroundColor Yellow
try {
    Write-Host "-> Optimizing JPEGs and PNGs inside public/Portfolio..." -ForegroundColor Gray
    node scripts/optimize-portfolio-images.cjs
    Write-Host "-> Transcoding videos to HLS adaptive streams..." -ForegroundColor Gray
    node scripts/transcode-hls-media.cjs
    Write-Host "[OK] Media optimization completed." -ForegroundColor Green
} catch {
    Write-Warning "Optimization step skipped or failed. Proceeding with raw streams..."
}

# 2. UPLOAD MEDIA TO CLOUD STORAGE CDN
Write-Host "`n[Step 2/4] Syncing local portfolio media to Google Cloud Storage CDN..." -ForegroundColor Yellow
.\scripts\sync-media-to-gcs.ps1 -BucketName "lenscape-media-cdn"

# 3. BUILD THE WEB APP
Write-Host "`n[Step 3/4] Building production web bundle..." -ForegroundColor Yellow
npm run build
Write-Host "[OK] Website build completed." -ForegroundColor Green

# 4. DEPLOY FE TO GOOGLE CLOUD RUN
Write-Host "`n[Step 4/4] Deploying website container to Google Cloud Run..." -ForegroundColor Yellow
Write-Host "Deploying service 'lenscape-website' to project 'lenscape-company'..." -ForegroundColor Gray

gcloud run deploy lenscape-website `
    --source . `
    --project lenscape-company `
    --region us-east1 `
    --allow-unauthenticated `
    --quiet

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT & SYNC COMPLETE!" -ForegroundColor Green
Write-Host "  - CDN Media:  https://storage.googleapis.com/lenscape-media-cdn/Portfolio/" -ForegroundColor Cyan
Write-Host "  - Live Website: Check your Cloud Run Service URL" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
