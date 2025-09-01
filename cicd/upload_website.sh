#!/bin/bash

# Upload website to AWS S3

set -e  # Exit on any error

DIR="$(dirname "$0")"

# Configuration
S3_BUCKET="dm.apc.cc"
WEBSITE_DIR="$DIR/../website"

echo "Uploading website to AWS S3"

aws s3 sync "$WEBSITE_DIR" "s3://$S3_BUCKET/" --exclude "*.DS_Store"

echo "Website uploaded to AWS S3"

exit 0
