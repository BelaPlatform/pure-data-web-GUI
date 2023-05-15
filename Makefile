DIST_DIRECTORY:=./packaging/dist
PD_WEBGUI_GITVERSION=0.1
TARGET_ARCHITECTURE=armhf
DEB_PACKAGE_NAME=pd-webgui_${PD_WEBGUI_GITVERSION}_${TARGET_ARCHITECTURE}
DEB_DIRECTORY:=${DIST_DIRECTORY}/${DEB_PACKAGE_NAME}
DEB_CONTROL_DIRECTORY:=${DEB_DIRECTORY}/DEBIAN
OPT_PD_WEBGUI_DIRECTORY:=${DEB_DIRECTORY}/opt/pd-webgui

all: deb
.PHONY: frontend shim clean

prep:
	@mkdir -p ${OPT_PD_WEBGUI_DIRECTORY}
	@mkdir -p ${OPT_PD_WEBGUI_DIRECTORY}/frontend
	@mkdir -p ${OPT_PD_WEBGUI_DIRECTORY}/shim

frontend:
	cd pd-gui-frontend && ./build.sh

shim:
	cd pd-gui-shim && ./build.sh

deb: prep frontend shim
	rsync -av pd-gui-frontend/workspace/ ${OPT_PD_WEBGUI_DIRECTORY}/frontend
	rsync -av pd-gui-shim/workspace/ ${OPT_PD_WEBGUI_DIRECTORY}/shim
	rsync -av packaging/rootfs/ ${DEB_DIRECTORY}/
	@mkdir -p ${DEB_CONTROL_DIRECTORY}
	rsync -av packaging/deb/ ${DEB_CONTROL_DIRECTORY}
	cd packaging && ./build.sh

clean:
	@rm -rf ${DIST_DIRECTORY}
