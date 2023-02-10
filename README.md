# Preview Setup

🚧

ideally, it will be as simple as

`make run`

🚧

visit http://localhost:8080


# Development Setup

To make Pd send its gui procotol data to us, we have to give it a TCP port at startup

`pd -guiport 56026`

On the frontend side, we have to use WebSockets though. Thus, we need a shim between Pd and the frontend.


## Pd

currently, the core→gui communication is a PR of a POC by umlaeute 
https://github.com/pure-data/pure-data/pull/1765

### Get Pd code

https://github.com/umlaeute/pure-data.git
check out branch remotes/origin/feature/1695/draft-1

### Build & install

`./autogen.sh`

`./configure --prefix=/opt/pd-gui`

`make`

`sudo make install`


## Run it

the order of steps is important

### run the shim

`cd pd-gui-shim`

`./run-dev.sh`

#### Inside Docker

##### install dependencies

dvlpr@shim:/workspace$ `pnpm install`

##### run

dvlpr@shim:/workspace$ `pnpm start:watch`


### Start Pd

`/opt/pd-gui/bin/pd -guiport 56026`


### Run the Frontend

`cd pd-gui-frontend`

`./run-dev.sh`

#### Inside Docker

##### install dependencies

dvlpr@frontend:/workspace$ `pnpm install`

##### run

dvlpr@frontend:/workspace$ `pnpm start:watch`

visit http://localhost:5173


