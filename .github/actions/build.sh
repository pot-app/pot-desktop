# pnpm install --resolution-only
pnpm install
sed -i "s/#openssl/openssl={version=\"0.10\",features=[\"vendored\"]}/g" src-tauri/Cargo.toml
pnpm tauri build --target $INPUT_TARGET -b deb
cd src-tauri/target/$INPUT_TARGET/release/bundle/deb