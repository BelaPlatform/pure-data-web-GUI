#!/usr/bin/env bash
set -euo pipefail
cd $(dirname $0)
. ../parse-cli.inc #sets $NOPD_PARAMS

docker build --tag pd-gui-shim-runner --target run .

docker run -p 0.0.0.0:8081:8081 -p 0.0.0.0:56026:56026 \
  --rm --interactive --tty \
  -v "$(pwd)/../patches":/patches:z \
  -v "$(pwd)/../pd/pure-data":/pure-data:z \
  $NOPD_PARAMS \
  --name pd-gui-shim-runner pd-gui-shim-runner
