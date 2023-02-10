#!/bin/bash

./autogen.sh
./configure --prefix /opt/pd --disable-portaudio
make install

/opt/pd/bin/pd -guiport 56026