# Overview

To make Pd send it's gui procotol data to us, we have to give it a TCP port at startup

`pd -guiport 56026`

On the frontend side, we have to use WebSockets though. Thus, we need a shim between Pd and the frontend.


# Setup Pd

currently, the core→gui communication is a PR of a POC by umlaeute 
https://github.com/pure-data/pure-data/pull/1765

## Get Pd code

https://github.com/umlaeute/pure-data.git
check out branch remotes/origin/feature/1695/draft-1

## Build & install

`./autogen.sh`

`./configure --enable-fftw --enable-libpd --enable-libpd-instance --prefix=/opt/pd-gui`

`make`

`sudo make install`


# Run it

the order of steps is important

## run the shim

`cd pd-gui-shim`

`./run-dev.sh`

### Inside Docker

dvlpr@frontend:/workspace$ `pnpm start:watch`


## Start Pd

`/opt/pd-gui/bin/pd -guiport 56026`


## Run the Frontend

`cd pd-gui-frontend`

`./run-dev.sh`

### Inside Docker

dvlpr@frontend:/workspace$ `pnpm start:watch`

visit http://localhost:5173


