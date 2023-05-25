FROM debian:11.2 AS base

LABEL author="Sebastian Stang <sebastian@chair.audio>"
LABEL version="1.5"

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
RUN corepack prepare pnpm@8.5.1 --activate
WORKDIR /workspace
COPY dockerfs/build-pd.sh /usr/local/bin/
COPY dockerfs/run.sh /usr/local/bin/


FROM dev as build

USER root
RUN mkdir -p /workspace/
# first copy only what's needed for pnpm install, so Docker can cache it in
# future runs
COPY workspace/package.json /workspace/
COPY workspace/pnpm-lock.yaml /workspace/
RUN pnpm install
RUN pnpm config set store-dir /workspace/.pnpm-store
# now copy the actual sources. For some reason
# COPY workspace/* /workspace
# results in the _contents_ of src to be placed into /workspace/
# so we resort to copying the folder separately:
COPY workspace/src /workspace/src
COPY workspace/tsconfig.json /workspace/
RUN pnpm run build

FROM build as build-pkg

# get only the relevant files into pkg/
RUN mkdir -p /workspace/pkg/
RUN cp /workspace/package.json /workspace/pkg
RUN cp -r /workspace/dist /workspace/pkg
WORKDIR /workspace/pkg
# only install production modules and without links
RUN pnpm install --prod --shamefully-hoist --force

# when running, we copy out the relevant files
CMD ["cp", "-r", ".", "/dist/"]


FROM build as run

CMD ["run.sh"]
