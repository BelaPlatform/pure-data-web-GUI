DIST_DIRECTORY:=./packaging/dist
PD_WEBGUI_GITVERSION=0.1
TARGET_ARCHITECTURE=armhf
DEB_PACKAGE_NAME=pd-webgui_${PD_WEBGUI_GITVERSION}_${TARGET_ARCHITECTURE}
DEB_DIRECTORY:=${DIST_DIRECTORY}/${DEB_PACKAGE_NAME}
DEB_CONTROL_DIRECTORY:=${DEB_DIRECTORY}/DEBIAN
OPT_PD_WEBGUI_DIRECTORY:=${DEB_DIRECTORY}/opt/pd-webgui

all: deb
.PHONY: frontend shim clean deb

prep:
	@mkdir -p ${OPT_PD_WEBGUI_DIRECTORY}
	@mkdir -p ${OPT_PD_WEBGUI_DIRECTORY}/frontend
	@mkdir -p ${OPT_PD_WEBGUI_DIRECTORY}/shim

frontend:
	cd pd-gui-frontend && ./build.sh

shim:
	cd pd-gui-shim && ./build.sh

RSYNC_OPTS:=-av --exclude "*.sw?" --exclude .DS_Store
deb: prep frontend shim deb-fast

# deb-fast assumes that the frontend and shim have been built
deb-fast:
	rsync ${RSYNC_OPTS} pd-gui-frontend/dist/ ${OPT_PD_WEBGUI_DIRECTORY}/frontend/
	rsync ${RSYNC_OPTS} pd-gui-shim/dist/ ${OPT_PD_WEBGUI_DIRECTORY}/shim/
	rsync ${RSYNC_OPTS} packaging/rootfs/ ${DEB_DIRECTORY}/
	@rm -rf ${DEB_CONTROL_DIRECTORY}
	@mkdir -p ${DEB_CONTROL_DIRECTORY}
	rsync ${RSYNC_OPTS} packaging/deb/ ${DEB_CONTROL_DIRECTORY}
	cd packaging && ./build.sh

clean:
	@rm -rf ${DIST_DIRECTORY}
