#!/usr/bin/env bash

docker build --tag pd-gui-shim-runner --target run .

docker run -p 127.0.0.1:8081:8081 -p 127.0.0.1:56026:56026 \
  --rm --interactive --tty \
  --name pd-gui-shim-runner pd-gui-shim-runner
