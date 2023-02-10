# Preview Setup

## on the first run

`./setup.sh`

Sets up the docker network.


## Start shim

`cd pd-gui-shim`

`./run.sh`

Wait until you see the message "server bound on 56026"


## Start pd

`cd pd`

`./run.sh`

Wait until you see the message "priority 94 scheduling failed"


## Start frontend

`cd pd-gui-frontend`

`./run.sh`

visit http://localhost:8080



# Loading your own patches

Adding patches through the frontend is not yet implemented. Put your patches into the ./patches directory and reload the frontend in the browser to make them available in the menu.



# Development Setup

To make Pd send its gui procotol data to us, we have to give it a TCP port at startup

`pd -guiport 56026`

On the frontend side, we have to use WebSockets though. Thus, we need a shim between Pd and the frontend.



## Pd

Currently, the core→gui communication is a PR of a POC by umlaeute 
https://github.com/pure-data/pure-data/pull/1765

### Get Pd code

https://github.com/umlaeute/pure-data.git

Check out branch remotes/origin/feature/1695/draft-1

### Build & install

`./autogen.sh`

`./configure --prefix=/opt/pd-gui`

`make`

`sudo make install`


## Run the containers

The order of steps is important

### Run the shim

`cd pd-gui-shim`

`./run-dev.sh`

#### Inside Docker

##### install dependencies

dvlpr@shim:/workspace$ `pnpm install`

##### Start

dvlpr@shim:/workspace$ `pnpm start:watch`


### Start Pd

`/opt/pd-gui/bin/pd -guiport 56026`


### Run the Frontend

`cd pd-gui-frontend`

`./run-dev.sh`

#### Inside Docker

##### Install dependencies

dvlpr@frontend:/workspace$ `pnpm install`

##### Start

dvlpr@frontend:/workspace$ `pnpm start:watch`

visit http://localhost:5173


