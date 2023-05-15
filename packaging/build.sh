#!/usr/bin/env bash

docker build --tag pd-webgui/build .

docker run --rm --interactive --tty \
  --mount type=bind,source="$(pwd)/dist",target=/dist \
  pd-webgui/build
