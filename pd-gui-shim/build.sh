#!/usr/bin/env bash
set -e

rm -rf dist
mkdir -p dist

docker build --tag pd-webgui-shim/build --target build .

docker run \
  --rm \
  -v "$(pwd)/dist":/dist:z \
  pd-webgui-shim/build
