#!/usr/bin/env bash
set -euo pipefail

docker build --tag pd-gui-runner --target dev .

docker run -p 0.0.0.0:8081:8081 -p 0.0.0.0:8080:3000 -p 0.0.0.0:8082:5173 \
  --rm --interactive --tty \
  -v "$(pwd)":/repo:z \
  -v "$(pwd)/patches":/patches:z \
  -h pd-gui-runner --name pd-gui-runner pd-gui-runner
