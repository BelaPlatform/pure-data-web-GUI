FROM debian:11.2 AS base

LABEL author="Sebastian Stang <sebastian@chair.audio>"
LABEL version="1.4"

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
      apt-get install -y \
        apt-utils \
        curl \
        fish \
        tar \
        xzip \
        xz-utils \
        automake \
        gcc \
        libtool \
        make \
        vim

ARG NODE_VERSION=18.16.0
RUN curl -fsSL https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz --output /tmp/node.tar.xz
RUN mkdir -p /opt/nodejs
RUN tar -xJvf /tmp/node.tar.xz --strip 1 -C /opt/nodejs

EXPOSE 8081


FROM base AS dev

ARG USERNAME=dvlpr
ARG UID=1000
ARG GID=1000
RUN groupadd -g $GID -o $USERNAME
RUN useradd -m -u $UID -g $GID -o $USERNAME
USER ${USERNAME}
ENV PATH "/opt/nodejs/bin:/workspace/node_modules/.bin:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@8.5.0 --activate
WORKDIR /workspace
COPY dockerfs/build-pd.sh /usr/local/bin/
COPY dockerfs/run.sh /usr/local/bin/

FROM dev as build

USER root
COPY workspace /workspace/
RUN pnpm install
RUN pnpm run build

FROM build as run

CMD ["run.sh"]
