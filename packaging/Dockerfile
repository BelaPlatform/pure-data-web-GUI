FROM debian:11.2 AS base

LABEL author="Sebastian Stang <sebastian@chair.audio>"
LABEL version="0.1"

ENV DEBIAN_FRONTEND=noninteractive


WORKDIR /root

CMD ["dpkg-deb", "--build", "/dist/pd-webgui_0.1_armhf"]
