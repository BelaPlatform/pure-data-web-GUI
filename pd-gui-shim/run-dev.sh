#!/usr/bin/env bash
set -euo pipefail

docker build --tag pd-gui-shim --target dev .

docker run -p 0.0.0.0:8081:8081 \
  --rm --interactive --tty \
  -v "$(pwd)/workspace":/workspace:z \
  -v "$(pwd)/../patches":/patches:z \
  -v "$(pwd)/../pd/pure-data":/pure-data:z \
  -h shim --name pd-gui-shim pd-gui-shim
