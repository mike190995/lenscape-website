#!/usr/bin/env bash
# ==========================================================
# LENSCAPE MEDIA CDN: BUCKET PROVISIONING (BASH)
# ==========================================================
set -euo pipefail

PROJECT_ID="${1:-lenscape-company}"
BUCKET_NAME="${2:-lenscape-media-cdn}"
LOCATION="${3:-us-east1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo "  LENSCAPE MEDIA CDN: BUCKET PROVISIONING"
echo "  Project ID : $PROJECT_ID"
echo "  Bucket Name: $BUCKET_NAME"
echo "  Location   : $LOCATION"
echo "=========================================================="

echo "[1/4] Setting active GCP project to '$PROJECT_ID'..."
gcloud config set project "$PROJECT_ID"

echo "[2/4] Checking/Creating Cloud Storage bucket 'gs://$BUCKET_NAME'..."
if ! gcloud storage buckets describe "gs://$BUCKET_NAME" >/dev/null 2>&1; then
  if ! gcloud storage buckets create "gs://$BUCKET_NAME" \
    --project="$PROJECT_ID" \
    --location="$LOCATION" \
    --default-storage-class=STANDARD \
    --uniform-bucket-level-access; then
    FALLBACK_BUCKET="${PROJECT_ID}-media-cdn"
    echo "  Primary bucket '$BUCKET_NAME' unavailable, trying fallback: '$FALLBACK_BUCKET'..."
    gcloud storage buckets create "gs://$FALLBACK_BUCKET" \
      --project="$PROJECT_ID" \
      --location="$LOCATION" \
      --default-storage-class=STANDARD \
      --uniform-bucket-level-access
    BUCKET_NAME="$FALLBACK_BUCKET"
  fi
fi

echo "[3/4] Applying CORS policy from scripts/gcs-cors.json..."
if [ -f "$SCRIPT_DIR/gcs-cors.json" ]; then
  gcloud storage buckets update "gs://$BUCKET_NAME" --cors-file="$SCRIPT_DIR/gcs-cors.json"
fi

echo "[4/4] Configuring public read access (roles/storage.objectViewer)..."
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET_NAME" \
  --member="allUsers" \
  --role="roles/storage.objectViewer" || true

echo "=========================================================="
echo "  PROVISIONING COMPLETE!"
echo "  Bucket URL: gs://$BUCKET_NAME"
echo "  Public HTTP Endpoint: https://storage.googleapis.com/$BUCKET_NAME/"
echo "  Add to .env.production: VITE_MEDIA_CDN_URL=https://storage.googleapis.com/$BUCKET_NAME"
echo "=========================================================="
