#!/usr/bin/env bash
set -euo pipefail

docker build --tag pd-gui-frontend --target dev .

docker run -p 0.0.0.0:8080:5173 \
  --rm --interactive --tty \
  -v "$(pwd)/workspace":/workspace:z \
  -v "$(pwd)/../patches":/patches:z \
  -e "OVERRIDE_PATCH_DIRECTORY=$(pwd)/../patches" \
  -h frontend --name pd-gui-frontend pd-gui-frontend
