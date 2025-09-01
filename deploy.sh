#!/bin/bash

set -e

DIR="$(dirname "$0")"

echo "Deploying website and webapi"

./cicd/upload_website.sh
./cicd/upload_webapi.sh

exit 0
