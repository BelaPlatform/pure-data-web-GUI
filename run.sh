#!/usr/bin/env bash
set -euo pipefail

docker build --tag pd-gui-runner --target run .

docker run -p 0.0.0.0:8081:8081 -p 0.0.0.0:8080:3000 -p 0.0.0.0:8082:5173 \
  --init \
  --rm --interactive --tty \
  -v "$(pwd)":/repo:z \
  -v "$(pwd)/patches":/patches:z \
  --name pd-gui-runner pd-gui-runner
