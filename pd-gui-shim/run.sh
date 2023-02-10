#!/usr/bin/env bash

docker build --tag pd-gui-shim-runner --target run .

docker run -p 127.0.0.1:8081:8081 -p 127.0.0.1:56026:56026  -p 127.0.0.1:22:22 \
  --rm --interactive --tty \
  --network pd-gui-run \
  --name pd-gui-shim-runner pd-gui-shim-runner bash
