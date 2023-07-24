FROM rust:buster
RUN rustup target add $INPUT_TARGET && rustup toolchain install --force-non-host $INPUT_TOOLCHAIN
RUN if [ "$INPUT_TARGET" = "x86_64-unknown-linux-gnu" ]; then \
        apt-get update && apt-get install -y wget libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf libxdo-dev libxcb1 libxrandr2 libdbus-1-3 \
    elif [ "$INPUT_TARGET" = "i686-unknown-linux-gnu" ]; then \
        dpkg --add-architecture i386 && apt-get update && apt-get install -y libgcc-s1:i386 libstdc++6:i386 libgdk-pixbuf-2.0-dev:i386 libgdk-pixbuf2.0-dev:i386 libatomic1:i386 gcc-multilib g++-multilib libwebkit2gtk-4.0-dev:i386 libssl-dev:i386 libgtk-3-dev:i386 librsvg2-dev:i386 libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf libxdo-dev libxcb1 libxrandr2 libdbus-1-3 \
    elif [ "$INPUT_TARGET" = "aarch64-unknown-linux-gnu" ]; then \
        sed 's/http:\/\/\(.*\).ubuntu.com\/ubuntu\//[arch-=amd64,i386] http:\/\/ports.ubuntu.com\/ubuntu-ports\//g' /etc/apt/sources.list | tee /etc/apt/sources.list.d/ports.list && sed -i 's/http:\/\/\(.*\).ubuntu.com\/ubuntu\//[arch=amd64,i386] http:\/\/\1.archive.ubuntu.com\/ubuntu\//g' /etc/apt/sources.list && dpkg --add-architecture arm64 && apt-get update && apt-get install -y libncurses6:arm64 libtinfo6:arm64 linux-libc-dev:arm64 libncursesw6:arm64 libssl3:arm64 libcups2:arm64 && apt-get install -y --no-install-recommends g++-aarch64-linux-gnu libc6-dev-arm64-cross libssl-dev:arm64 libwebkit2gtk-4.0-dev:arm64 libgtk-3-dev:arm64 patchelf:arm64 librsvg2-dev:arm64 && apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf libxdo-dev libxcb1 libxrandr2 libdbus-1-3 \
    elif [ "$INPUT_TARGET" = "armv7-unknown-linux-gnueabihf" ]; then \
        sed 's/http:\/\/\(.*\).ubuntu.com\/ubuntu\//[arch-=amd64,i386] http:\/\/ports.ubuntu.com\/ubuntu-ports\//g' /etc/apt/sources.list | tee /etc/apt/sources.list.d/ports.list && sed -i 's/http:\/\/\(.*\).ubuntu.com\/ubuntu\//[arch=amd64,i386] http:\/\/\1.archive.ubuntu.com\/ubuntu\//g' /etc/apt/sources.list && dpkg --add-architecture armhf && apt-get update && apt-get install -y libncurses6:armhf libtinfo6:armhf linux-libc-dev:armhf libncursesw6:armhf libssl3:armhf libcups2:armhf && apt-get install -y --no-install-recommends g++-arm-linux-gnueabihf libc6-dev-armhf-cross libssl-dev:armhf libwebkit2gtk-4.0-dev:armhf libgtk-3-dev:armhf patchelf:armhf librsvg2-dev:armhf && apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf libxdo-dev libxcb1 libxrandr2 libdbus-1-3 \
    else \
        echo "Unknown target: $INPUT_TARGET" && exit 1 \
    fi
RUN 
COPY entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"] 