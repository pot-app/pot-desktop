<img width="200px" src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/public/icon.png" align="left"/>

# Pot (Translator of Pylogmon)

> 🌈 A cross-platform translation software (
> [Quick Start](https://pot.pylogmon.com/docs/tutorial/intro) |
> [Download](https://github.com/pot-app/pot-desktop/releases/latest) |
> [Configuration](https://pot.pylogmon.com/docs/category/软件配置))

![License](https://img.shields.io/github/license/pot-app/pot-desktop.svg)
![Tauri](https://img.shields.io/badge/Tauri-1.3.0-blue?logo=tauri)
![JavaScript](https://img.shields.io/badge/-JavaScript-yellow?logo=javascript&logoColor=white)
![Rust](https://img.shields.io/badge/-Rust-orange?logo=rust&logoColor=white)
![Windows](https://img.shields.io/badge/-Windows-blue?logo=windows&logoColor=white)
![MacOS](https://img.shields.io/badge/-macOS-black?&logo=apple&logoColor=white)
![Linux](https://img.shields.io/badge/-Linux-yellow?logo=linux&logoColor=white)

<br/>
<hr/>
<div align="center">
<table>
<tr>
    <td> <img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/1.png">
    <td> <img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/2.png">
    <td> <img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/3.png">
</table>

## Instructions

<table>
<tr>
    <td>Selection Translation
    <td>Select the text to be translated, then press the shortcut key for word translation.
    <td> <img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/eg1.gif"/>
<tr>
    <td>Input Translation
    <td>Press the shortcut key for translation input, enter the text to be translated, and press <code>Enter</code> to translate.
    <td><img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/eg2.gif"/>
<tr>
    <td>Plugin Invocation
    <td>Select the text to be translated and click the plugin icon. More infomation <a href="https://pot.pylogmon.com/docs/tutorial/config/plugin_config" target="_blank">Plugin Invocation</a>
    <td><img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/eg3.gif"/>
<tr>
    <td>Clipboard Listening Mode
    <td>Open the translation window, start the clipboard listening mode, and copy the content you want to translate
    <td><img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/eg4.gif"/>
</table>

</div>

<div align="center">

## Features

</div>

-   [x] Input text and translate
-   [x] Selection text and translate
-   [x] Invoke by other software to translate ([Detial](#plugin-invocation))
-   [x] Listening clipboard to translate
-   [x] OpenAI API support
-   [x] Multi-API support ([Support Apis](#support-apis))
-   [x] Import to Anki/Eudic (or add more)
-   [x] Available on all PC platforms (Windows, macOS, and Linux)
-   [x] Good Wayland support (Test on KDE and Gnome)
-   [ ] Screenshot translate
-   [ ] OCR support

<div align="center">

## Support Apis

</div>

-   [x] [OpenAI](https://platform.openai.com/)
-   [x] [Alibaba](https://www.aliyun.com/product/ai/alimt)
-   [x] [Baidu](https://fanyi.baidu.com/)
-   [x] [Caiyun](https://fanyi.caiyunapp.com/)
-   [x] [Tencent](https://fanyi.qq.com/)
-   [x] [Volcengine](https://translate.volcengine.com/)
-   [x] [Lingva](https://lingva.ml/)
-   [x] [Google](https://translate.google.com)
-   [x] [Bing](https://learn.microsoft.com/zh-cn/azure/cognitive-services/translator/)
-   [x] [Bing Dict](https://www.bing.com/dict)
-   [x] [DeepL](https://www.deepl.com/)
-   [x] [Youdao](https://ai.youdao.com/)
-   [ ] and more...

<div align="center">

## Installation

</div>

### Windows

#### Install via Winget

```powershell
winget install Pylogmon.pot
```

#### Install Manually

1. Download the installation package ending in `.msi` from the Latest [Release](https://github.com/pot-app/pot-desktop/releases/latest) page.
2. Double click the downloaded file to install it.

### MacOS

> I would be very happy if someone could add this software to [Homebrew] (https://brew.sh/). Because I don't have a Mac, and I don't know how to do it.

#### Install Manually

1. Download the installation package ending in `.dmg` from the Latest [Release](https://github.com/pot-app/pot-desktop/releases/latest) page. (If you are using M1, please download the installation package named `pot_{version}_aarch64.dmg`, otherwise download the installation package named `pot_{version}_x64.dmg`)
2. Double click the downloaded file to install it.

#### Troubleshooting

-   "pot" can’t be opened because the developer cannot be verified.

    Click the Cancel button, then go to the Settings -> Privacy and Security page, click the Still Open button, and then click the Open button in the pop-up window. After that, there will be no more pop-up warnings when opening pot.

    If you cannot find the above options in Privacy & Security, or get error prompts such as broken files with Apple Silicon machines. Open Terminal.app and enter the following command (you may need to enter a password halfway through), then restart pot:

    ```bash
    sudo xattr -d com.apple.quarantine /Applications/pot.app
    ```

-   If you encounter a permission prompt every time you open it, or if you cannot perform a shortcut translation, please go to Settings -> Privacy & Security -> Supporting Features to remove pot, and then re-add pot.

### Linux

#### Debian/Ubuntu

We provide `AppImage` and `deb` packages for Linux.

Please note that: There are two deb package, `universal` is based on `glibc2.28` and `openssl-1.1`, If the regular deb package can't run on your machine due to dependency problems, please download the `universal` package, Due to its low version dependency, it can run on most systems.

#### Arch/Manjaro

View on [AUR](https://aur.archlinux.org/packages?O=0&K=pot-translation)

Use aur helper：

```bash
yay -S pot-translation
# or
paru -S pot-translation
```

<div align="center">

## Plugin Invocation

</div>

### Introduction

Pot supports invoke by other software. In this way, with the help of other software, it is very convenient to translate.

Pot provides two ways to call it from outside, you can also call it through other software you like

1. Call the pot via the command line

```bash
pot popclip "hello world" # The second parameter is what you want to translate
```

2. Call the pot via the HTTP Request

```bash
curl 'http://127.0.0.1:60828' -X POST -d "Hello world" # The body content is what you want to translate
```

### Existing Usage

#### SnipDO (Windows)

1. Download and install SnipDo in the [Microsoft Store](https://apps.microsoft.com/store/detail/snipdo/9NPZ2TVKJVT7)
2. Download the SnipDo extension of pot from the Latest [Release](https://github.com/pot-app/pot-desktop/releases/latest) (pot.pbar)
3. Double click the downloaded file to install it.
4. Selection some text, you can see the pot icon in the upper right corner of the selection, click the icon to translate.

#### PopClip (MacOS)

1. Download and install PopClip in the [App Store](https://apps.apple.com/us/app/popclip/id445189367?mt=12)
2. Download the PopClip extension of pot from the Latest [Release](https://github.com/pot-app/pot-desktop/releases/latest) (pot.popclipextz)
3. Double click the downloaded file to install it.
4. Enable the pot extension in PopClip settings, and then you can translate by selecting text.

#### Starry (Linux)

> Starry is still in the development stage, so you can only compile him manually

1. Download and install Starry [AppImageHub](https://appimage.github.io/Starry/)

<div align="center">

## Contributors

</div>

<img src="https://github.com/pot-app/.github/blob/master/pot-desktop-contributions.svg?raw=true"/>

### Manual compilation

#### Requirements

Node.js >= 18.0.0

pnpm >= 8.5.0

Rust >= 1.69.0

#### Start compilation

1. Clone the repository

    ```bash
    git clone https://github.com/pot-app/pot-desktop.git
    ```

2. Install dependencies

    ```bash
    cd pot-desktop
    pnpm install
    ```

3. Development (Optional)

    ```bash
    pnpm tauri dev # Run the app in development mode
    ```

4. Build
    ```bash
    pnpm tauri build # Build into installation package
    ```

<div align="center">

## Acknowledgement

</div>

-   [Bob](https://github.com/ripperhe/Bob) Inspiration
-   [bob-plugin-openai-translator](https://github.com/yetone/bob-plugin-openai-translator) OpenAI API Reference
-   [@uiYzzi](https://github.com/uiYzzi) Implementation ideas
-   [@Lichenkass](https://github.com/Lichenkass) Maintaining the Deepin App Store.
-   [Tauri](https://github.com/tauri-apps/tauri) A user-friendly GUI framework.

<div align="center">
