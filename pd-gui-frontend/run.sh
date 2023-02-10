#!/usr/bin/env bash

docker build --tag pd-gui-frontend-runner --target run .

docker run -p 127.0.0.1:8080:3000 \
  --rm --interactive --tty \
  --network pd-gui-run \
  --name pd-gui-frontend-runner pd-gui-frontend-runner
