#!/bin/bash
set -euo pipefail
set -x

PD_INSTALL_DIR=/opt/pd/
PD_INSTALL_BINARY=$PD_INSTALL_DIR/bin/pd
[ -f "Makefile.in" ] || {
./autogen.sh
}
[ -f "Makefile" ] || {
./configure --prefix $PD_INSTALL_DIR --disable-portaudio
}
make -j$(getconf _NPROCESSORS_ONLN) install

set -m

(sleep 4; $PD_INSTALL_BINARY -guiport 56026) &

ssh pd-gui-shim-runner -L 127.0.0.1:56026:127.0.0.1:56026

fg %1