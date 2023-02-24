#!/bin/bash
set -euo pipefail
set -x

build-pd.sh
pnpm start:watch
