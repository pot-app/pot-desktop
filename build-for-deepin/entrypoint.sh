#!/bin/bash

wget https://nodejs.org/dist/v19.8.1/node-v19.8.1-linux-x64.tar.xz
tar -Jxvf ./node-v19.8.1-linux-x64.tar.xz
export PATH=$(pwd)/node-v19.8.1-linux-x64/bin:$PATH
npm install pnpm -g
bash build.sh
