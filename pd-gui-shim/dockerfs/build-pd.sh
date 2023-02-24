#!/bin/bash
set -euo pipefail
set -x

cd /pure-data
[ -f "Makefile.in" ] || {
./autogen.sh
}
[ -f "Makefile" ] || {
./configure --disable-portaudio
}
make -C src -j$(getconf _NPROCESSORS_ONLN)
