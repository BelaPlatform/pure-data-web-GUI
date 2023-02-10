#!/usr/bin/env bash

docker build --tag pd-gui-pd-runner --target build .

docker run \
  --rm --interactive --tty \
  -v "$(pwd)/pure-data":/src:z \
  --name pd-gui-pd-runner pd-gui-pd-runner bash
