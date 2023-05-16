#!/usr/bin/env bash
set -e

docker build --tag pd-webgui/build .

docker run --rm --interactive --tty \
  --mount type=bind,source="$(pwd)/dist",target=/dist \
  pd-webgui/build
