#!/usr/bin/env bash
set -euo pipefail
cd $(dirname $0)
. ../parse-cli.inc #sets $NOPD_PARAMS

docker build --tag pd-gui-frontend --target dev .

docker run -p 0.0.0.0:8080:8080 \
  --rm --interactive --tty \
  -v "$(pwd)/workspace":/workspace:z \
  -v "$(pwd)/../patches":/patches:z \
  -e ARE_WE_DOCKERIZED="1" \
  $NOPD_PARAMS \
  -h frontend --name pd-gui-frontend pd-gui-frontend
