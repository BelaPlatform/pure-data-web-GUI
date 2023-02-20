#!/bin/bash

./autogen.sh
./configure --prefix /opt/pd --disable-portaudio
make -j$(getconf _NPROCESSORS_ONLN) install

set -m

(sleep 4; /opt/pd/bin/pd -guiport 56026) &

ssh pd-gui-shim-runner -L 127.0.0.1:56026:127.0.0.1:56026

fg %1