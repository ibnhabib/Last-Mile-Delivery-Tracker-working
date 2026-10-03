#!/bin/bash
echo "Packaging LastMileUS project..."
rm -f last-mile-delivery-tracker.zip
zip -r last-mile-delivery-tracker.zip . -x "*/node_modules/*" -x "*/dist/*" -x "*/.env" -x "*/.git/*"
echo "Packaging complete: last-mile-delivery-tracker.zip"