#!/bin/bash

set -m

(sleep 4; pnpm start:watch) &

service ssh start


fg %1