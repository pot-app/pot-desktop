#!/usr/bin/env bash

set -euo pipefail

data_home="${XDG_DATA_HOME:-${HOME:?HOME is not set}/.local/share}"
bin_home="${HOME:?HOME is not set}/.local/bin"
app_dir="$data_home/pot"
appimage_target="$app_dir/pot.AppImage"
launcher="$data_home/applications/pot.desktop"
icon_target="$data_home/icons/hicolor/128x128/apps/pot.png"
command_path="$bin_home/pot"

refresh_desktop() {
    if command -v update-desktop-database >/dev/null 2>&1; then
        update-desktop-database "$data_home/applications" >/dev/null 2>&1 || true
    fi
    if command -v gtk-update-icon-cache >/dev/null 2>&1; then
        gtk-update-icon-cache -f -t "$data_home/icons/hicolor" >/dev/null 2>&1 || true
    fi
}

uninstall() {
    if [[ -L "$command_path" && "$(readlink -f "$command_path")" == "$appimage_target" ]]; then
        rm -f -- "$command_path"
    fi
    rm -f -- "$appimage_target" "$launcher" "$icon_target"
    rmdir -- "$app_dir" 2>/dev/null || true
    refresh_desktop
    echo "Pot AppImage desktop integration was removed"
}

if [[ "${1:-}" == "--uninstall" ]]; then
    uninstall
    exit 0
fi

source_appimage="${1:?usage: install-appimage.sh <Pot.AppImage> | --uninstall}"
source_appimage="$(realpath "$source_appimage")"

if [[ ! -f "$source_appimage" ]]; then
    echo "AppImage not found: $source_appimage" >&2
    exit 1
fi

install -Dm755 "$source_appimage" "$appimage_target"
mkdir -p "$bin_home"

if [[ -e "$command_path" || -L "$command_path" ]]; then
    if [[ ! -L "$command_path" || "$(readlink -f "$command_path")" != "$appimage_target" ]]; then
        backup="$command_path.backup.$(date +%Y%m%d%H%M%S)"
        mv -- "$command_path" "$backup"
        echo "Existing $command_path was moved to $backup"
    else
        rm -f -- "$command_path"
    fi
fi
ln -s "$appimage_target" "$command_path"

extract_dir="$(mktemp -d)"
trap 'rm -rf -- "$extract_dir"' EXIT
(
    cd "$extract_dir"
    "$appimage_target" --appimage-extract 'usr/share/icons/hicolor/128x128/apps/pot.png' >/dev/null
)
install -Dm644 \
    "$extract_dir/squashfs-root/usr/share/icons/hicolor/128x128/apps/pot.png" \
    "$icon_target"

mkdir -p "$(dirname "$launcher")"
{
    printf '%s\n' '[Desktop Entry]'
    printf '%s\n' 'Type=Application'
    printf '%s\n' 'Name=Pot'
    printf '%s\n' 'Comment=Text translation and OCR'
    printf 'Exec="%s"\n' "$command_path"
    printf '%s\n' 'Icon=pot'
    printf '%s\n' 'Categories=Utility;TextTools;'
    printf '%s\n' 'Terminal=false'
    printf '%s\n' 'StartupNotify=true'
    printf '%s\n' 'StartupWMClass=pot'
    printf '%s\n' 'Actions=SelectionTranslate;InputTranslate;OcrRecognize;OcrTranslate;'
    printf '%s\n' ''
    printf '%s\n' '[Desktop Action SelectionTranslate]'
    printf '%s\n' 'Name=Selection Translation'
    printf 'Exec="%s" --selection-translate\n' "$command_path"
    printf '%s\n' ''
    printf '%s\n' '[Desktop Action InputTranslate]'
    printf '%s\n' 'Name=Input Translation'
    printf 'Exec="%s" --input-translate\n' "$command_path"
    printf '%s\n' ''
    printf '%s\n' '[Desktop Action OcrRecognize]'
    printf '%s\n' 'Name=Screenshot OCR'
    printf 'Exec="%s" --ocr-recognize\n' "$command_path"
    printf '%s\n' ''
    printf '%s\n' '[Desktop Action OcrTranslate]'
    printf '%s\n' 'Name=Screenshot Translation'
    printf 'Exec="%s" --ocr-translate\n' "$command_path"
} >"$launcher"
chmod 644 "$launcher"

refresh_desktop

echo "Pot was installed to $appimage_target"
echo "Command: $command_path"
echo "Desktop launcher: $launcher"
