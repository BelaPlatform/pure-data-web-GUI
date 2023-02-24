#!/usr/bin/env bash

docker build --tag pd-gui-frontend-runner --target run .

docker run -p 0.0.0.0:8080:3000 \
  --rm --interactive --tty \
  -v "$(pwd)/../patches":/patches:z \
  --network pd-gui-run \
  --name pd-gui-frontend-runner pd-gui-frontend-runner
