#!/usr/bin/env bash
set -euo pipefail

docker build --tag pd-gui-frontend-runner --target run .

docker run -p 0.0.0.0:8080:3000 \
  --init \
  --rm --interactive --tty \
  -v "$(pwd)/../patches":/patches:z \
  --name pd-gui-frontend-runner pd-gui-frontend-runner
