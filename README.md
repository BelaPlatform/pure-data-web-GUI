# An HTML5 GUI for Pd

## Introduction

This repo interfaces Pd's backend with a webserver hosting a static website containing the HTML GUI (the "frontend"). A websocket server (the "shim") acts as an intermediary between the Pd backend and the web browser. The user loads the static frontend on port 8080; upon load the page connects to the shim via websocket on port 8081.

Under the hood, the shim starts the Pd backend passing it a GUI port, so that it doesn't start its own GUI:

`pd -guiport 56026`

A little example:

[Screencast from 2023-02-04 07-50-02.webm](https://user-images.githubusercontent.com/4260604/225753604-0c28cdbc-6faf-4acb-ad5f-16a6870775fe.webm)

### Shim - `./pd-gui-shim`

The shim is a minimal application written in Typescript which uses `pnpm` for dependencies and the `tsc` Typescript compiler.
It starts a WebSocket server and the Pd process and forwards messages to and from Pd and the web browser via the WebSocket.

### Frontend `./pd-gui-frontend`

The frontend is an HTML5 implementation of the Pd GUI. It is written in Typescript using the Svelte framework, it uses `pnpm` for dependencies, `vite` as a bundler and `tsc` as a typescript compiler.
It parses messages from the Pd backend and renders Pd patches, objects, menus and forwards keyboard, mouse and touch events to the Pd backend.

### Pd

We are using the refactored core/GUI protocol as per https://github.com/pure-data/pure-data/pull/1765 and https://github.com/umlaeute/pure-data/tree/feature/1695/draft-1 . If you are starting Pd manually, you should also use the same.

### Things that currently work

A lot. Most of those that work on the Pd branch we are using. Additionally, there is touch support so you can (although in a cumbersome and limited way) edit patches from a touch screen. Hint: use the "Edit->Connect selection" menu entry to create connection between selected objects. ctrl-1, ctrl-2, ctrl-3, ctrl-4, ctrl-5 to create new objects.

### Things that currently don't work

Several. All bugs/regressions inherited from the Pd branch we are using.

Additionally:
- on macos, you cannot use a keyboard shortcut to create a new window, but can do that from the File menu.
- if you have more than one tab on one or more devices open with the page loaded, it will misfunction without warning you about it. Just make sure you use a single window at all times.
- vslider/hslider are not handled properly.
- audio and MIDI I/O is currently not possible when running Pd inside the Docker container. You can start Pd externally and connect to the shim instead if you want audio and MIDI I/O to work.
- ctrl-shift shortcuts not implemented
- on macos, always use ctrl instead of cmd
- refreshing the page while one or more patches are open will hide them
- loading patches from arbitrary locations

## Quick start

In all the commands below, if you replace `$NOPD` with `nopd`, it will be assumed that you intend to start Pd manually with `/path/to/pd -guiport 56026`. This has to be done after starting the shim.
Get the repo and submodules:
```
git clone --recursive https://github.com/BelaPlatform/pure-data-web-GUI
```

### Start shim (and Pd)

Open a terminal and run:

```
cd pd-gui-shim
./run.sh $NOPD
```

If you started Pd as part of this command, you will see the message `priority 94 scheduling failed`. Nothing to worry about.
Leave this process running and go to the next section.

### Start frontend

Open a new terminal and run:

```
cd pd-gui-frontend
./run.sh $NOPD
```

Wait until you see the message `Listening on 0.0.0.0:8000`.

Then visit http://localhost:8080. Here you can create new patches and edit them.

### Loading your own patches

Saving new files or loading patches from arbitrary locations through the frontend is not yet implemented. Instead, put your patches into the `./patches` directory and reload the frontend in the browser. You will then be able to load them from the `File` menu. You can then save them with `ctrl-s` or the `File` menu.

## Development workflow

### Run the shim and Pd

Run:
```
cd pd-gui-shim
./run-dev.sh $NOPD
```
this will start a docker container and give you a shell within it.

#### Inside Docker

##### install dependencies

```
pnpm install
```
these are installed in the `/workspace` folder, which is the persistent storage corresponding to `./pd-gui-shim/workspace`.

#### Build Pd

If starting Pd inside the container, you'll want to build it first:
```
build-pd.sh
```

##### Start

This will start the shim. You can choose one of these options:
- start the shim and start Pd inside the container. Quick and easy if you don't care about audio and MIDI I/O from Pd and are mainly working on the frontend. Changes to the `pd/pure-data` folder are currently _not_ monitored. You should manually rebuild it upon change and restart `pnpm`.
```
pnpm start:watch
```
- start the shim, wait for a Pd instance to connect. This way you can have audio I/O for Pd:
```
pnpm start:watch:nopd
```
Separately, you'll have to start an appropriate version of Pd with `/path/to/pd -guiport 56026`.

In both cases, if any files in `workspace/src` are modified, it will rebuild and restart the shim. If Pd is running externally, it may have to be manually restarted.

### Run the Frontend

Run:
```
cd pd-gui-frontend
./run-dev.sh $NOPD
```
this will start another docker container and give you a shell within it.

#### Inside Docker

You should get a prompt:
```
dvlpr@frontend:/workspace$
```
##### Install dependencies

```
pnpm install
```
these are installed in the `/workspace` folder, which is the persistent storage corresponding to `./pd-gui-frontend/workspace`.

##### Start

This will build the frontend and start a file server. If any files in `workspace/src` are modified, it will rebuild them.
```
PORT=8080 pnpm start:watch
```

Wait until you see the message `Local:   http://localhost:8080/`.

Then visit http://localhost:8080.
