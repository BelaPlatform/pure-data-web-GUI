#!/usr/bin/env bash
set -e

rm -rf dist
mkdir -p dist

docker build --tag pd-webgui-shim/build-pkg --target build-pkg .

docker run \
  --rm --interactive --tty \
  -v "$(pwd)/dist":/dist:z \
  -h shim-pkg --name pd-gui-shim-pkg \
  pd-webgui-shim/build-pkg
