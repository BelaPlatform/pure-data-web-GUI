#!/usr/bin/env bash
set -euo pipefail
cd $(dirname $0)
. ../parse-cli.inc #sets $NOPD_PARAMS

docker build --tag pd-gui-frontend-runner --target run .

docker run -p 0.0.0.0:8080:3000 \
  --init \
  --rm --interactive --tty \
  -v "$(pwd)/../patches":/patches:z \
  $NOPD_PARAMS \
  --name pd-gui-frontend-runner pd-gui-frontend-runner
