set +e # avoid crashing if $1 is not passed
NOPD="$1"
set -e
[ nopd == "$NOPD" ] && NOPD_PARAMS="-e OVERRIDE_PATCH_DIRECTORY=$(pwd)/../patches" || NOPD_PARAMS=
