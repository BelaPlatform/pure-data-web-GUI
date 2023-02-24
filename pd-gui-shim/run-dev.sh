#!/usr/bin/env bash

docker build --tag pd-gui-shim --target dev .

docker run -p 0.0.0.0:8081:8081 -p 127.0.0.1:56026:56026 \
  --rm --interactive --tty \
  -v "$(pwd)/workspace":/workspace:z \
  -h shim --name pd-gui-shim pd-gui-shim
