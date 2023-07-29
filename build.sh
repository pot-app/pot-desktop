pnpm install
pnpm prettier --write .
pnpm tauri build --target $INPUT_TARGET -b deb
cd src-tauri/target/$INPUT_TARGET/release/bundle/deb
alien -r ./pot*.deb