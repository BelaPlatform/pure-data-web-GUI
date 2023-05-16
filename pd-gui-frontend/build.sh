#!/usr/bin/env bash
set -e

rm -rf dist
mkdir -p dist

docker build --tag pd-webgui-frontend/build-pkg --target build-pkg .

docker run \
  --rm --interactive --tty \
  -v "$(pwd)/dist":/dist:z \
  -h frontend-pkg --name pd-gui-frontend-pkg \
  pd-webgui-frontend/build-pkg
