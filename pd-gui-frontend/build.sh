#!/usr/bin/env bash

mkdir dist

docker build --tag pd-webgui-frontend/build --target build .

docker run \
  --rm \
  -v "$(pwd)/dist":/dist:z \
  pd-webgui-frontend/build
