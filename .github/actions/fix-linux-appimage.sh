#!/usr/bin/env bash

set -euo pipefail

target="${1:?usage: fix-linux-appimage.sh <target-triple>}"

if [[ "$target" != "x86_64-unknown-linux-gnu" ]]; then
    echo "AppImage Wayland fix only supports x86_64-unknown-linux-gnu" >&2
    exit 1
fi

target_dir="${CARGO_TARGET_DIR:-src-tauri/target}"
bundle_dir="$target_dir/$target/release/bundle/appimage"

mapfile -t appimages < <(find "$bundle_dir" -maxdepth 1 -type f -name '*.AppImage' -print)
mapfile -t appdirs < <(find "$bundle_dir" -maxdepth 1 -type d -name '*.AppDir' -print)

if [[ "${#appimages[@]}" -ne 1 || "${#appdirs[@]}" -ne 1 ]]; then
    echo "Expected exactly one AppImage and one AppDir in $bundle_dir" >&2
    exit 1
fi

appimage_path="${appimages[0]}"
appdir_path="${appdirs[0]}"
# Tauri 1.x bundles this library from the build host. On newer Wayland systems it
# can conflict with the host compositor stack and make WebKitGTK abort at startup.
mapfile -t bundled_wayland_clients < <(
    find "$appdir_path/usr" \( -type f -o -type l \) -name 'libwayland-client.so.0*' -print
)

if [[ "${#bundled_wayland_clients[@]}" -gt 0 ]]; then
    rm -f -- "${bundled_wayland_clients[@]}"

    cache_dir="${XDG_CACHE_HOME:-${HOME:?HOME is not set}/.cache}/tauri"
    linuxdeploy_path="${TAURI_LINUXDEPLOY_PATH:-$cache_dir/linuxdeploy-x86_64.AppImage}"

    if [[ ! -x "$linuxdeploy_path" ]]; then
        echo "linuxdeploy is not executable: $linuxdeploy_path" >&2
        exit 1
    fi

    appimage_name="$(basename "$appimage_path")"
    appdir_name="$(basename "$appdir_path")"
    tool_extract_dir="$(mktemp -d)"
    trap 'rm -rf -- "$tool_extract_dir"' EXIT

    (
        cd "$tool_extract_dir"
        "$linuxdeploy_path" --appimage-extract >/dev/null
    )
    appimage_plugin="$tool_extract_dir/squashfs-root/plugins/linuxdeploy-plugin-appimage/AppRun"

    if [[ ! -x "$appimage_plugin" ]]; then
        echo "AppImage output plugin was not found in $linuxdeploy_path" >&2
        exit 1
    fi

    # Call only the output plugin. Running linuxdeploy again would rescan the
    # completed AppDir and could copy host libraries back into the bundle.
    rm -f -- "$appimage_path"
    (
        cd "$bundle_dir"
        LDAI_OUTPUT="$appimage_name" "$appimage_plugin" --appdir "$appdir_name"
    )

    if [[ ! -s "$appimage_path" ]]; then
        echo "Failed to rebuild $appimage_path" >&2
        exit 1
    fi
else
    echo "No bundled libwayland-client.so.0 found; skipping AppImage rebuild"
fi

updater_archive="$appimage_path.tar.gz"
rm -f -- "$updater_archive" "$updater_archive.sig"
# The build command omits Tauri's updater step so the archive can be created
# from the corrected AppImage and that final artifact can be signed below.
tar -czf "$updater_archive" -C "$bundle_dir" "$(basename "$appimage_path")"

if [[ -n "${TAURI_PRIVATE_KEY:-}" ]]; then
    signer_args=(tauri signer sign)
    if [[ -f "$TAURI_PRIVATE_KEY" ]]; then
        signer_args+=(--private-key-path "$TAURI_PRIVATE_KEY")
    else
        signer_args+=(--private-key "$TAURI_PRIVATE_KEY")
    fi
    signer_args+=(--password "${TAURI_KEY_PASSWORD:-}" "$updater_archive")
    pnpm "${signer_args[@]}"
else
    echo "TAURI_PRIVATE_KEY is not set; updater archive was not signed"
fi
