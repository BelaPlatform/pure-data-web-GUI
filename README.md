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


# run it

the order of steps is important

## run the shim

`cd pd-gui-shim`

`./run-dev.sh`

### inside docker

dvlpr@frontend:/workspace$ `pnpm start:watch`


## start pd

`/opt/pd-gui/bin/pd -guiport 56026`


## run the frontend

`cd pd-gui-frontend`

`./run-dev.sh`

### inside docker

dvlpr@frontend:/workspace$ `pnpm start:watch`

visit http://localhost:5173


