FROM debian:bookworm-20230109 AS base

LABEL author="Sebastian Stang <sebastian@chair.audio>"
LABEL version="1.1"

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
      apt-get install -y \
        automake \
        gcc \
        libtool \
        make

WORKDIR /src


FROM base as build

COPY dockerfs/build-and-run.sh /usr/local/bin/

CMD ["build-and-run.sh"]