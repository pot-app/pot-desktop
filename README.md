<img width="200px" src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/public/icon.png" align="left"/>

# Pot (Translator of Pylogmon)

> 🌈 A cross-platform software for text translation ([Telegram Group](https://t.me/pot_app))

![License](https://img.shields.io/github/license/pot-app/pot-desktop.svg)
![Tauri](https://img.shields.io/badge/Tauri-1.4.0-blue?logo=tauri)
![JavaScript](https://img.shields.io/badge/-JavaScript-yellow?logo=javascript&logoColor=white)
![Rust](https://img.shields.io/badge/-Rust-orange?logo=rust&logoColor=white)
![Windows](https://img.shields.io/badge/-Windows-blue?logo=windows&logoColor=white)
![MacOS](https://img.shields.io/badge/-macOS-black?&logo=apple&logoColor=white)
![Linux](https://img.shields.io/badge/-Linux-yellow?logo=linux&logoColor=white)

<br/>
<hr/>
<div align="center">

<h3><a href='./README_CN.md'>中文</a> | English</h3>

<table>
<tr>
    <td> <img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/1.png">
    <td> <img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/2.png">
    <td> <img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/3.png">
</table>

# Instructions

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
    <td>Invoke by other Software
    <td>Achieving more convenient and efficient functionality through being called by other software. More information <a href="#invoke-by-other-software" target="_blank">Invoke by other Software</a>
    <td><img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/eg3.gif"/>
<tr>
    <td>Clipboard Listening Mode
    <td>Open the translation window, start the clipboard listening mode, and copy the content you want to translate
    <td><img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/eg4.gif"/>
<tr>
    <td>Screenshot OCR
    <td>Press the shortcut key for screenshot OCR, select the screenshot area in the box
    <td><img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/eg5.gif"/>
<tr>
    <td>Screenshot Translation
    <td>Press the shortcut key for screenshot translation, select the screenshot area in the box
    <td><img src="https://cdn.staticaly.com/gh/pot-app/pot-desktop/master/asset/eg6.gif"/>
</table>

</div>

<div align="center">

# Features

</div>

-   [x] Input text and translate
-   [x] Selection text and translate
-   [x] Invoke by other software to translate ([Detail](#plugin-invocation))
-   [x] Listening clipboard to translate
-   [x] OpenAI API support
-   [x] Multi-API support ([Support Apis](#support-apis))
-   [x] Multi-language support
-   [x] Export to Anki/Eudic (or add more)
-   [x] Available on all PC platforms (Windows, macOS, and Linux)
-   [x] Good Wayland support (Test on KDE and Gnome)
-   [x] OCR support ([Support Apis](#support-apis))
-   [x] Screenshot translate

<div align="center">

# Support Apis

</div>

## Translation

-   [x] [OpenAI](https://platform.openai.com/)
-   [x] [Alibaba](https://www.aliyun.com/product/ai/alimt)
-   [x] [Baidu](https://fanyi.baidu.com/)
-   [x] [Caiyun](https://fanyi.caiyunapp.com/)
-   [x] [Tencent](https://fanyi.qq.com/)
-   [x] [TranSmart](https://transmart.qq.com/)
-   [x] [Volcengine](https://translate.volcengine.com/)
-   [x] [Xiaoniu](https://niutrans.com/)
-   [x] [Lingva](https://lingva.pot-app.com/)
-   [x] [Google](https://translate.google.com)
-   [x] [Bing](https://learn.microsoft.com/zh-cn/azure/cognitive-services/translator/)
-   [x] [Bing Dict](https://www.bing.com/dict)
-   [x] [DeepL](https://www.deepl.com/)
-   [x] [Youdao](https://ai.youdao.com/)
-   [x] [Cambridge Dictionary](https://dictionary.cambridge.org/)
-   [x] [MoJi](https://www.mojidict.com/)
-   [x] [Yandex](https://translate.yandex.com/)
-   [x] [Tatoeba](https://tatoeba.org/)
-   [x] [PALM2](https://ai.google/discover/palm2/)
-   [ ] and more...

## OCR

-   [x] System OCR (Offline)
    -   [x] [Windows.Media.OCR](https://learn.microsoft.com/en-us/uwp/api/windows.media.ocr.ocrengine?view=winrt-22621) on Windows
    -   [x] [Apple Vision Framework](https://developer.apple.com/documentation/vision/recognizing_text_in_images) on MacOS
    -   [x] [Tesseract OCR](https://github.com/tesseract-ocr) on Linux
-   [x] [Tesseract.js](https://tesseract.projectnaptha.com/) (Offline)
-   [x] [PaddleOCR](https://github.com/xushengfeng/eSearch-OCR) (Offline)
-   [x] [Baidu](https://ai.baidu.com/tech/ocr/general)
-   [x] [Tencent](https://cloud.tencent.com/product/ocr-catalog)
-   [x] [OCR Space](http://ocr.space/)
-   [x] [Volcengine](https://www.volcengine.com/product/OCR)
-   [x] [iFlytek](https://www.xfyun.cn/services/common-ocr)
-   [x] [Tencent Image Translation](https://cloud.tencent.com/document/product/551/17232)
-   [x] [Baidu Image Translation](https://fanyi-api.baidu.com/product/22)
-   [x] [Simple LaTeX](https://simpletex.cn/)
-   [ ] and more...

<div align="center">

# Installation

</div>

## Windows

### Install via Winget

```powershell
winget install Pylogmon.pot
```

### Install Manually

1. Download the installation package ending in `.exe` from the Latest [Release](https://github.com/pot-app/pot-desktop/releases/latest) page.
2. Double click the downloaded file to install it.

## MacOS

### Install via Brew

1. Add our tap:

```bash
brew tap pot-app/homebrew-tap
```

2. Install pot:

```bash
brew install --cask pot
```

3. Upgrade pot

```bash
brew upgrade --cask pot
```

### Install Manually

1. Download the installation package ending in `.dmg` from the Latest [Release](https://github.com/pot-app/pot-desktop/releases/latest) page. (If you are using M1, please download the installation package named `pot_{version}_aarch64.dmg`, otherwise download the installation package named `pot_{version}_x64.dmg`)
2. Double click the downloaded file to install it.

### Troubleshooting

-   "pot" can’t be opened because the developer cannot be verified.

    Click the Cancel button, then go to the Settings -> Privacy and Security page, click the Still Open button, and then click the Open button in the pop-up window. After that, there will be no more pop-up warnings when opening pot.

    If you cannot find the above options in Privacy & Security, or get error prompts such as broken files with Apple Silicon machines. Open Terminal.app and enter the following command (you may need to enter a password halfway through), then restart pot:

    ```bash
    sudo xattr -d com.apple.quarantine /Applications/pot.app
    ```

-   If you encounter a permission prompt every time you open it, or if you cannot perform a shortcut translation, please go to Settings -> Privacy & Security -> Supporting Features to remove pot, and then re-add pot.

## Linux

### Debian/Ubuntu

We provide `AppImage` and `deb` packages for Linux.

Please note that: There are two deb package, `universal` is based on `glibc2.28` and `openssl-1.1`, If the regular deb package can't run on your machine due to dependency problems, please download the `universal` package, Due to its low version dependency, it can run on most systems.

### Arch/Manjaro

1. View on [AUR](https://aur.archlinux.org/packages?O=0&K=pot-translation)

Use aur helper：

```bash
yay -S pot-translation # or pot-translation-bin or pot-translation-git
# or
paru -S pot-translation # or pot-translation-bin or pot-translation-git
```

2. If you are using `archlinuxcn`, you can install directly using pacman:

```bash
sudo pacman -S pot-translation
```

<div align="center">

# Invoke by other Software

</div>

## Introduction

Pot supports invoke by other software. In this way, with the help of other software, it is very convenient to translate and ocr.

> This require the pot to keep running in the background.

Pot provides an HTTP interface that can be called by other software. You can call pot by sending a request to `127.0.0.1:port`, where `port` is the port number that pot listens on and can be changed in the software settings.

### API Documentation:

```bash
POST "/" => Translate the specified text.(Body is the text that needs to be translated),
GET "/config" => Open App Config,
GET "/translate" => Translate the specified text.(Same as "/"),
GET "/selection_translate" => Selection Translate,
GET "/input_translate" => Input Translate,
GET "/ocr_recognize" => Screenshot OCR,
GET "/ocr_translate" => Screenshot Translate,
GET "/ocr_recognize?screenshot=false" => Screenshot OCR(Do not use in-software screenshots),
GET "/ocr_translate?screenshot=false" => Screenshot Translate(Do not use in-software screenshots),
GET "/ocr_recognize?screenshot=true" => Screenshot OCR,
GET "/ocr_translate?screenshot=true" => Screenshot Translate,
```

### Example

-   Invoke Selection Translate：

```bash
curl "127.0.0.1:60828/selection_translate"
```

-   Using grim for OCR screenshot on Wayland(When you don't want to use the in-app screenshot feature or it's not available, simply save the screenshot using another software to $CACHE/com.pot-app.desktop/pot_screenshot_cut.png and then call pot to complete OCR.)：

```bash
grim -g "$(slurp)" ~/.cache/com.pot-app.pot-desktop/pot_screenshot_cut.png && curl "127.0.0.1:60828/ocr_recognize?screenshot=false"
```

-   Translate "Hello World"：

```bash
curl "127.0.0.1:60828/translate" -X POST -d "Hello World"
```

## Existing Usage (Quick Selection Translate)

### SnipDo (Windows)

1. Download and install SnipDo in the [Microsoft Store](https://apps.microsoft.com/store/detail/snipdo/9NPZ2TVKJVT7)
2. Download the SnipDo extension of pot from the Latest [Release](https://github.com/pot-app/pot-desktop/releases/latest) (pot.pbar)
3. Double click the downloaded file to install it.
4. Selection some text, you can see the pot icon in the upper right corner of the selection, click the icon to translate.

### PopClip (MacOS)

1. Download and install PopClip in the [App Store](https://apps.apple.com/us/app/popclip/id445189367?mt=12)
2. Download the PopClip extension of pot from the Latest [Release](https://github.com/pot-app/pot-desktop/releases/latest) (pot.popclipextz)
3. Double click the downloaded file to install it.
4. Enable the pot extension in PopClip settings, and then you can translate by selecting text.

### Starry (Linux)

> Starry is still in the development stage, so you can only compile him manually

Github: [ccslykx/Starry](https://github.com/ccslykx/Starry)

<div align="center">

# Wayland Support

</div>

Due to the varying levels of support for Wayland among different distributions, pot itself cannot achieve perfect compatibility. However, here are some solutions to common issues that can be implemented through proper configuration, allowing pot to run flawlessly on Wayland.

## Shortcut key cannot be used

Due to Tauri's lack of support for Wayland, the shortcut key scheme in the pot application cannot be used under Wayland.
You can set the system shortcut and send a request with `curl` to call pot, see [Invoke by other Software](#invoke-by-other-software) for details

## Screenshot doesn't work

In some pure Wayland desktop environments/window managers (such as Hyprland), the built-in screenshot feature of pot cannot be used. In this case, you can use other screenshot tools instead by using command line parameters. Simply save the screenshot to `~/.cache/com.pot-app.desktop/pot_screenshot_cut.png` and then execute `pot screenshot_ocr without_screenshot`.

Here is an example configuration in Hyprland (using grim and slurp for screenshots):

```conf
bind = ALT, X, exec, grim -g "$(slurp)" ~/.cache/com.pot-app.desktop/pot_screenshot_cut.png && curl "127.0.0.1:60828/ocr_recognize?screenshot=false"
bind = ALT, C, exec, grim -g "$(slurp)" ~/.cache/com.pot-app.desktop/pot_screenshot_cut.png && curl "127.0.0.1:60828/ocr_translate?screenshot=false"
```

Other desktop environments/window managers also have similar operations.

## The translation window follows the mouse position.

Due to the current inability of pot to obtain accurate mouse coordinates under Wayland, its internal implementation cannot function properly.
For certain desktop environments/window managers, it is possible to achieve window following mouse position by setting window rules. Here we take Hyprland as an example:

```conf
windowrulev2 = float, class:(pot), title:(Translator|OCR|PopClip|Screenshot Translate) # Translation window floating
windowrulev2 = move cursor 0 0, class:(pot), title:(Translator|PopClip|Screenshot Translate) # Translation window follows the mouse position.
```

<div align="center">

# Contributors

</div>

<img src="https://github.com/pot-app/.github/blob/master/pot-desktop-contributions.svg?raw=true" width="100%"/>

## Manual compilation

### Requirements

Node.js >= 18.0.0

pnpm >= 8.5.0

Rust >= 1.69.0

### Start compilation

1. Clone the repository

    ```bash
    git clone https://github.com/pot-app/pot-desktop.git
    ```

2. Install dependencies

    ```bash
    cd pot-desktop
    pnpm install
    ```

3. Install dependencies(Only Linux)

```bash
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf libxdo-dev libxcb1 libxrandr2 libdbus-1-3
```

4. Development (Optional)

    ```bash
    pnpm tauri dev # Run the app in development mode
    ```

5. Build
    ```bash
    pnpm tauri build # Build into installation package
    ```

<div align="center">

# Acknowledgement

</div>

-   [Bob](https://github.com/ripperhe/Bob) Inspiration
-   [bob-plugin-openai-translator](https://github.com/yetone/bob-plugin-openai-translator) OpenAI API Reference
-   [@uiYzzi](https://github.com/uiYzzi) Implementation ideas
-   [@Lichenkass](https://github.com/Lichenkass) Maintaining the Deepin App Store.
-   [Tauri](https://github.com/tauri-apps/tauri) A user-friendly GUI framework.
-   [eSearch-OCR](https://github.com/xushengfeng/eSearch-OCR) PaddleOCR Implementation

<div align="center">
