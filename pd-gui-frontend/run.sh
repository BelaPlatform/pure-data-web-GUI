#!/usr/bin/env bash
set -euo pipefail
cd $(dirname $0)
. ../parse-cli.inc #sets $NOPD_PARAMS

docker build --tag pd-gui-frontend-runner --target run .

docker run -p 0.0.0.0:8080:8080 \
  --init \
  --rm --interactive --tty \
  -v "$(pwd)/../patches":/patches:z \
  -e ARE_WE_DOCKERIZED="1" \
  $NOPD_PARAMS \
  --name pd-gui-frontend-runner pd-gui-frontend-runner
