#!/bin/bash

# Upload webapi application to AWS Lambda function
# This script packages the webapi folder and uploads it to the dungeon-master-api Lambda function

set -e  # Exit on any error

DIR="$(dirname "$0")"

# Configuration
LAMBDA_FUNCTION_NAME="dungeon-master-api"
WEBAPI_DIR="$DIR/../webapi"
PACKAGE_DIR="webapi_lambda_package"
ZIP_FILE="webapi_lambda_deployment.zip"

echo "🚀 Starting Lambda deployment for $LAMBDA_FUNCTION_NAME..."

# Clean up any previous package
if [[ -d "$PACKAGE_DIR" ]]; then
    echo "🧹 Cleaning up previous package directory..."
    rm -rf "$PACKAGE_DIR"
fi

if [[ -f "$ZIP_FILE" ]]; then
    echo "🗑️  Removing previous zip file..."
    rm -f "$ZIP_FILE"
fi

# Create package directory
echo "📦 Creating package directory..."
mkdir -p "$PACKAGE_DIR"

# Copy Python files, requirements, and subdirectories, excluding __pycache__ and .venv
echo "📋 Copying application files..."
# Copy the entire webapi directory structure while preserving hierarchy
cp -r "$WEBAPI_DIR"/* "$PACKAGE_DIR/"

# Remove unwanted directories that might have been copied
echo "🧹 Removing unwanted directories..."
cd "$PACKAGE_DIR"
if [[ -d "__pycache__" ]]; then
    rm -rf "__pycache__"
fi
if [[ -d ".venv" ]]; then
    rm -rf ".venv"
fi
cd ..

# Install dependencies to package directory
echo "📚 Installing Python dependencies..."
cd "$PACKAGE_DIR"
pip install -r requirements.txt -t . --no-deps --platform manylinux2014_x86_64 --only-binary=:all:
cd ..

# Remove unnecessary files to reduce package size
echo "🧹 Cleaning up package..."
cd "$PACKAGE_DIR"
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "*.dist-info" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type d -name ".venv" -exec rm -rf {} + 2>/dev/null || true
cd ..

# Create deployment zip
echo "🗜️  Creating deployment package..."
cd "$PACKAGE_DIR"
zip -r "../$ZIP_FILE" . -x "*.pyc" "__pycache__/*" ".venv/*" "*.dist-info/*" "*.egg-info/*"
cd ..

# Upload to Lambda
echo "☁️  Uploading to AWS Lambda..."
aws lambda update-function-code \
    --function-name "$LAMBDA_FUNCTION_NAME" \
    --zip-file "fileb://$ZIP_FILE" | jq -r '.LastUpdateStatus'

# Clean up package files
echo "🧹 Cleaning up temporary files..."
rm -rf "$PACKAGE_DIR"
rm -f "$ZIP_FILE"

echo "✅ Successfully deployed $LAMBDA_FUNCTION_NAME to AWS Lambda!"
