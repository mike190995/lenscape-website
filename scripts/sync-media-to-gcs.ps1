<#
.SYNOPSIS
    Synchronizes local portfolio media assets to the Google Cloud Storage CDN bucket.
.DESCRIPTION
    Uploads public/Portfolio/ to gs://<bucket-name>/Portfolio/ using gcloud storage rsync,
    with long-term immutable caching headers.
.EXAMPLE
    .\scripts\sync-media-to-gcs.ps1 -BucketName "lenscape-media-cdn"
#>

param(
    [string]$BucketName = "lenscape-media-cdn"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  LENSCAPE MEDIA CDN: ASSET SYNCHRONIZATION" -ForegroundColor Cyan
Write-Host "  Target Bucket: gs://$BucketName" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$portfolioDir = Join-Path (Split-Path $PSScriptRoot -Parent) "public\Portfolio"

if (-not (Test-Path $portfolioDir)) {
    Write-Error "Local directory not found: $portfolioDir"
}

Write-Host "`n[1/2] Syncing public/Portfolio directory to gs://$BucketName/Portfolio/..." -ForegroundColor Gray
gcloud storage rsync -r "$portfolioDir" "gs://$BucketName/Portfolio" `
    --cache-control="public, max-age=31536000, immutable"

Write-Host "`n[2/2] Verifying bucket contents..." -ForegroundColor Gray
gcloud storage ls --long "gs://$BucketName/Portfolio" | Select-Object -First 10

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  SYNC COMPLETE!" -ForegroundColor Green
Write-Host "  Media assets are now accessible at:" -ForegroundColor White
Write-Host "  https://storage.googleapis.com/$BucketName/Portfolio/..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
