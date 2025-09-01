#!/bin/bash

echo "Running Dungeon Master Website Web Server"

cd website_webserver
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 main.py

exit 0
