# overview

To make Pd send it's gui procotol data to us, we have to give it a TCP port at startup

`pd -guiport 56026`

On the frontend side, we have to use WebSockets, though. Thus, we need a shim between pd and the frontend.


# setup pd

currently, the core->gui cummunication is a PR of a POC by umlaeute 
https://github.com/pure-data/pure-data/pull/1765

## get pd code

https://github.com/umlaeute/pure-data.git
check out branch remotes/origin/feature/1695/draft-1

## build & install

`./autogen.sh`
`./configure --enable-fftw --enable-libpd --enable-libpd-instance --prefix=/opt/pd-gui`
`make`
`sudo make install`


# build the shim

`cmake -S . -B cmake-build-debug -G Ninja`
`cmake --build cmake-build-debug`


# run the frontend

