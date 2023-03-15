#!/usr/bin/env bash
set -euo pipefail

docker build --tag pd-gui-shim-runner --target run .

docker run -p 0.0.0.0:8081:8081 \
  --rm --interactive --tty \
  -v "$(pwd)/../patches":/patches:z \
  -v "$(pwd)/../pd/pure-data":/pure-data:z \
  --name pd-gui-shim-runner pd-gui-shim-runner
