pnpm install
pnpm prettier --write .
pnpm tauri build -b deb
pnpm tauri build -b rpm