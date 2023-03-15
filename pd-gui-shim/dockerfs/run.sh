#!/bin/bash
OVERRIDE_PATCH_DIRECTORY="$OVERRIDE_PATCH_DIRECTORY"
SCRIPT_SUFFIX=
set -euo pipefail

[ -n "$OVERRIDE_PATCH_DIRECTORY" ] \
	&& SCRIPT_SUFFIX=":nopd" \
	|| build-pd.sh
pnpm start:watch$SCRIPT_SUFFIX
