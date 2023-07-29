pnpm install
pnpm prettier --write .
pnpm tauri build --target $INPUT_TARGET -b deb
cd src-tauri/target/$INPUT_TARGET/release/bundle/deb
alien -r ./pot*.deb

rename '-' '_' ./pot*.rpm
rename '-' 'pylogmon' ./pot*.rpm
rename 'pylogmon1.' '_' ./pot*.rpm
rename 'x86_64' 'amd64' ./pot*.rpm
