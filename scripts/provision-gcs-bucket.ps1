<#
.SYNOPSIS
    Provisions a Google Cloud Storage bucket for Lenscape CDN media assets.
.DESCRIPTION
    Creates standard storage bucket in us-east1 with uniform bucket-level access,
    applies CORS configuration for web audio/video streaming, and grants public object viewer access.
.EXAMPLE
    .\scripts\provision-gcs-bucket.ps1 -ProjectId "lenscape-company" -BucketName "lenscape-media-cdn"
#>

param(
    [string]$ProjectId = "lenscape-company",
    [string]$BucketName = "lenscape-media-cdn",
    [string]$Location = "us-east1"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  LENSCAPE MEDIA CDN: BUCKET PROVISIONING" -ForegroundColor Cyan
Write-Host "  Project ID : $ProjectId" -ForegroundColor Yellow
Write-Host "  Bucket Name: $BucketName" -ForegroundColor Yellow
Write-Host "  Location   : $Location" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Set Active Project
Write-Host "[1/4] Setting active GCP project to '$ProjectId'..." -ForegroundColor Gray
gcloud config set project $ProjectId | Out-Null

# Step 2: Create Bucket if it doesn't already exist
Write-Host "[2/4] Checking/Creating Cloud Storage bucket 'gs://$BucketName'..." -ForegroundColor Gray
$bucketExists = $false
try {
    $describe = gcloud storage buckets describe "gs://$BucketName" --format="value(name)" 2>$null
    if ($describe) {
        Write-Host "  --> Bucket 'gs://$BucketName' already exists." -ForegroundColor Green
        $bucketExists = $true
    }
} catch {
    $bucketExists = $false
}

if (-not $bucketExists) {
    try {
        gcloud storage buckets create "gs://$BucketName" `
            --project=$ProjectId `
            --location=$Location `
            --default-storage-class=STANDARD `
            --uniform-bucket-level-access
        Write-Host "  --> Bucket 'gs://$BucketName' created successfully." -ForegroundColor Green
    } catch {
        Write-Host "  [!] Primary bucket name '$BucketName' was unavailable or encountered an error." -ForegroundColor Yellow
        $FallbackBucket = "$ProjectId-media-cdn"
        Write-Host "  --> Attempting creation with fallback name: '$FallbackBucket'..." -ForegroundColor Cyan
        gcloud storage buckets create "gs://$FallbackBucket" `
            --project=$ProjectId `
            --location=$Location `
            --default-storage-class=STANDARD `
            --uniform-bucket-level-access
        $BucketName = $FallbackBucket
        Write-Host "  --> Bucket 'gs://$BucketName' created successfully." -ForegroundColor Green
    }
}

# Step 3: Apply CORS Configuration
Write-Host "[3/4] Applying CORS policy from scripts/gcs-cors.json..." -ForegroundColor Gray
$corsFile = Join-Path $PSScriptRoot "gcs-cors.json"
if (Test-Path $corsFile) {
    gcloud storage buckets update "gs://$BucketName" --cors-file="$corsFile"
    Write-Host "  --> CORS rules applied successfully." -ForegroundColor Green
} else {
    Write-Host "  [!] CORS file not found at $corsFile, skipping." -ForegroundColor Yellow
}

# Step 4: Grant Public Object Read Access
Write-Host "[4/4] Configuring public read access (roles/storage.objectViewer)..." -ForegroundColor Gray
try {
    gcloud storage buckets add-iam-policy-binding "gs://$BucketName" `
        --member="allUsers" `
        --role="roles/storage.objectViewer"
    Write-Host "  --> Public objectViewer granted to allUsers." -ForegroundColor Green
} catch {
    Write-Host "  [!] Note: If public access prevention is enforced at the organization level," -ForegroundColor Yellow
    Write-Host "      configure Cloud CDN or an HTTPS load balancer to front this bucket." -ForegroundColor Yellow
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  PROVISIONING COMPLETE!" -ForegroundColor Green
Write-Host "  Bucket URL: gs://$BucketName" -ForegroundColor White
Write-Host "  Public HTTP Endpoint: https://storage.googleapis.com/$BucketName/" -ForegroundColor White
Write-Host "  Add to .env.production: VITE_MEDIA_CDN_URL=https://storage.googleapis.com/$BucketName" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
