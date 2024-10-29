<img width="200px" src="public/icon.svg" align="left"/>

# Pot (간편 번역기)

> A cross-platform translator application ([Telegram Group](https://t.me/pot_app))

![License](https://img.shields.io/github/license/pot-app/pot-desktop.svg)
![Tauri](https://img.shields.io/badge/Tauri-1.6.8-blue?logo=tauri)
![JavaScript](https://img.shields.io/badge/-JavaScript-yellow?logo=javascript&logoColor=white)
![Rust](https://img.shields.io/badge/-Rust-orange?logo=rust&logoColor=white)
![Windows](https://img.shields.io/badge/-Windows-blue?logo=windows&logoColor=white)
![MacOS](https://img.shields.io/badge/-macOS-black?&logo=apple&logoColor=white)
![Linux](https://img.shields.io/badge/-Linux-yellow?logo=linux&logoColor=white)

<br/>
<hr/>
<div align="center">

<h3><a href='./README.md'>中文</a> | <a href='./README_EN.md'> English </a> | 한글</h3>

<table>
<tr>
    <td> <img src="asset/1.png">
    <td> <img src="asset/2.png">
    <td> <img src="asset/3.png">
</table>

# 목차

</div>

-   [사용법](#usage)
-   [기능](#features)
-   [지원 서비스](#supported-services)
-   [플러그인 시스템](#plugin-system)
-   [설치](#installation)
-   [외부호출](#external-calls)
-   [Wayland 지원](#wayland-support)
-   [다국어](#internationalizationweblate)
-   [기여자](#contributors)
-   [감사한 사람들](#thanks)

<div align="center">

# 사용법

</div>

| 선택영역 자동번역                       | 입력단어 번역                           | 외부호출                                                                                   |
| --------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------ |
| 문장을 선택하고 *번역단축키*를 누릅니다 | 번역창을 열고, 번역할 문장을 입력합니다 | 다른 프로그램과 연동하여 효율적으로 사용가능합니다, [External Calls](#external-calls) 참고 |
| <img src="asset/eg1.gif"/>              | <img src="asset/eg2.gif"/>              | <img src="asset/eg3.gif"/>                                                                 |

| 클립보드 자동인식                                                    | 스크린샷 OCR언어인식              | 스크린샷 자동번역                        |
| -------------------------------------------------------------------- | --------------------------------- | ---------------------------------------- |
| 클립보드 모니터링 옵션을 통해, 텍스트를 복사하면 자동으로 번역합니다 | 화면캡쳐를 통해 문자를 인식합니다 | 화면을 캡쳐하면 인식한 문장을 번역합니다 |
| <img src="asset/eg4.gif"/>                                           | <img src="asset/eg5.gif"/>        | <img src="asset/eg6.gif"/>               |

<div align="center">

# 기능

</div>

-   [x] 여러 번역 사이트를 사용한 동시번역 ([상세 페이지](#supported-services))
-   [x] 문자인식 OCR ([상세 페이지](#supported-services))
-   [x] 텍스트 음성 변환 ([상세 페이지](#supported-services))
-   [x] 사전 앱에 내보내기 ([상세 페이지](#supported-services))
-   [x] 외부호출 ([External Calls](#external-calls))
-   [x] 플러그인 시스템 ([Plugin System](#plugin-system))
-   [x] 운영체제 지원 - Windows, macOS and Linux
-   [x] Wayland 지원 (Tested on KDE, Gnome and Hyprland)
-   [x] 다중언어 지원

<div align="center">

# 상세 페이지

</div>

## 번역

-   [x] [OpenAI](https://platform.openai.com/)
-   [x] [ChatGLM](https://www.zhipuai.cn/)
-   [x] [Gemini Pro](https://gemini.google.com/)
-   [x] [Ollama](https://www.ollama.com/) (Offline)
-   [x] [Ali Translate](https://www.aliyun.com/product/ai/alimt)
-   [x] [Baidu Translate](https://fanyi.baidu.com/)
-   [x] [Caiyun](https://fanyi.caiyunapp.com/)
-   [x] [Tencent Transmart](https://fanyi.qq.com/)
-   [x] [Tencent Interactive Translate](https://transmart.qq.com/)
-   [x] [Volcengine Translate](https://translate.volcengine.com/)
-   [x] [NiuTrans](https://niutrans.com/)
-   [x] [Google Translate](https://translate.google.com)
-   [x] [Bing Translate](https://learn.microsoft.com/zh-cn/azure/cognitive-services/translator/)
-   [x] [Bing Dictionary](https://www.bing.com/dict)
-   [x] [DeepL](https://www.deepl.com/)
-   [x] [Youdao](https://ai.youdao.com/)
-   [x] [Cambridge Dictionary](https://dictionary.cambridge.org/)
-   [x] [Yandex](https://translate.yandex.com/)
-   [x] [Lingva](https://github.com/TheDavidDelta/lingva-translate) ([Plugin](https://github.com/pot-app/pot-app-translate-plugin-template))
-   [x] [Tatoeba](https://tatoeba.org/) ([Plugin](https://github.com/pot-app/pot-app-translate-plugin-tatoeba))
-   [x] [ECDICT](https://github.com/skywind3000/ECDICT) ([Plugin](https://github.com/pot-app/pot-app-translate-plugin-ecdict))

추가항목은 다음을 참고 [Plugin System](#plugin-system)

## 문자인식

-   [x] System OCR (Offline)
    -   [x] [Windows.Media.OCR](https://learn.microsoft.com/en-us/uwp/api/windows.media.ocr.ocrengine?view=winrt-22621) on Windows
    -   [x] [Apple Vision Framework](https://developer.apple.com/documentation/vision/recognizing_text_in_images) on MacOS
    -   [x] [Tesseract OCR](https://github.com/tesseract-ocr) on Linux
-   [x] [Tesseract.js](https://tesseract.projectnaptha.com/) (Offline)
-   [x] [Baidu](https://ai.baidu.com/tech/ocr/general)
-   [x] [Tencent](https://cloud.tencent.com/product/ocr-catalog)
-   [x] [Volcengine](https://www.volcengine.com/product/OCR)
-   [x] [iflytek](https://www.xfyun.cn/services/common-ocr)
-   [x] [Tencent Image Translate](https://cloud.tencent.com/document/product/551/17232)
-   [x] [Baidu Image Translate](https://fanyi-api.baidu.com/product/22)
-   [x] [Simple LaTeX](https://simpletex.cn/)
-   [x] [OCRSpace](https://ocr.space/) ([Plugin](https://github.com/pot-app/pot-app-recognize-plugin-template))
-   [x] [Rapid](https://github.com/RapidAI/RapidOcrOnnx) (Offline [Plugin](https://github.com/pot-app/pot-app-recognize-plugin-rapid))
-   [x] [Paddle](https://github.com/hiroi-sora/PaddleOCR-json) (Offline [Plugin](https://github.com/pot-app/pot-app-recognize-plugin-paddle))

추가항목은 다음을 참고 [Plugin System](#plugin-system)

## 문자-음성변환

-   [x] [Lingva](https://github.com/thedaviddelta/lingva-translate)

추가항목은 다음을 참고 [Plugin System](#plugin-system)

## 사전

-   [x] [Anki](https://apps.ankiweb.net/)
-   [x] [Eudic](https://dict.eudic.net/)
-   [x] [Youdao](https://www.youdao.com/) ([Plugin](https://github.com/pot-app/pot-app-collection-plugin-youdao))
-   [x] [ShanBay](https://web.shanbay.com/web/main) ([Plugin](https://github.com/pot-app/pot-app-collection-plugin-shanbay))

추가항목은 다음을 참고 [Plugin System](#plugin-system)

<div align="center">

# -플러그인- 시스템

</div>

정해진 기본 설정항목 외에, -플러그인 시스템-을 통해 사용자가 원하는 기능을 추가할 수 있습니다.

## -플러그인-의 설치

설치가능한 플러그인 항목은 다음을 참고하세요 [Plugin List](https://pot-app.com/plugin.html). 그리고 필요한 항목을 다운받으십시오.

플러그인의 확장자는 `.potext` 입니다. 다운받은 `.potext` 확장자 파일을 프로그램 설정메뉴 - 서비스 - Add External Plugin - Install External Plugin 메뉴에서 등록하여 설치합니다. 파일을 등록하면 해당 항목을 프로그램의 사용목록에 표시가 되어 사용이 가능해 집니다.

### 문제해결

-   특정모듈을 불러오지 못할 때 (Windows)

    C++ 라이브러리가 없을 때 이러한 문제가 주로 발생합니다. 다음페이지를 방문하여 필요한 라이브러리를 설치합니다. [참고 페이지](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist?view=msvc-170#visual-studio-2015-2017-2019-and-2022)

-   유효하지 않은 Win32 프로그램 (Windows)

    시스템 또는 프로그램과 호환되지 않는 플러그인을 다운받아 설치한 경우입니다. 플러그인에서 적절한 파일을 다운받았는지 확인하시고 재설치 하십시오.

## -플러그인-의 개발

템플릿 [Template](https://pot-app.com/en/plugin.html#template) 항목에서 다양한 항목을 플러그인들을 찾을 수 있습니다 [Plugin List](https://pot-app.com/en/plugin.html). 이 곳에서 필요한 문서를 참고하십시오.

<div align="center">

# 설치방법

</div>

## Windows 윈도우

### Winget 을 이용한 설치

```powershell
winget install Pylogmon.pot
```

### 수동 설치

1. 최신버전 다운로드 페이지 [Release](https://github.com/pot-app/pot-desktop/releases/latest)에서 `.exe` 파일을 다운받습니다.

    - 64-bit 버전 사용시, `pot_{version}_x64-setup.exe`
    - 32-bit 버전 사용시, `pot_{version}_x86-setup.exe`
    - arm64 버전 사용시, `pot_{version}_arm64-setup.exe`

2. 더블클릭하여 설치를 합니다.

### 문제해결

-   설치 후 프로그램창이 보이지 않거나 오른쪽 하단 시스템 트레이 항목에 아이콘이 표시되지 않을 경우,

    윈도우-브라우저에서 사용하는 WebView2 기능이 설치되지 않았거나 비활성화 된 경우 입니다. 이 때는 WebView2 를 설치하거나 기능을 재설정 하십시오.

    회사/기업 사용자의 경우 WebView2 기능이 설치되지 않았거나 비활성화된 경우가 있습니다. 이 경우 다음을 설치하십시오. WebView2 version `pot_{version} at [Release](https://github.com/pot-app/pot-desktop/releases/latest) _{arch}_fix_webview2_runtime-setup.exe`

    문제가 해결되지 않는 경우, Windows 7 compatibility mode에서 시도해 보십시오.

## MacOS 맥OS

### Brew를 통한 설치

1. 탭에 추가:

```bash
brew tap pot-app/homebrew-tap
```

2. 설치:

```bash
brew install --cask pot
```

3. 업데이트:

```bash
brew upgrade --cask pot
```

### 수동설치

1. 최신버전 다운로드 페이지 [Release](https://github.com/pot-app/pot-desktop/releases/latest)에서 `.dmg` 파일을 다운받습니다. (M1 사용자이면, 다음 파일명을 다운로드 합니다 `pot_{version}_aarch64.dmg`, 기타 사용자는 다음 파일을 다운로드 합니다. `pot_{version}_x64.dmg`)
2. 더블클릭하여 설치를 합니다.

### 문제해결

-   "pot" 을 열 수 없는 경우는 개발자 인증이 되지 않아서 입니다.

    취소 버튼을 누르고 설정 메뉴로 들어갑니다 -> 개인정보 및 보안 메뉴에서 설정을 합니다.
    열기 버튼을 클릭한 다음 팝업 창에서 열기 버튼을 클릭합니다. 그 이후에는 포트를 열 때 더 이상 팝업 경고가 표시되지 않습니다.

    개인정보 및 보안에서 위의 옵션을 찾을 수 없거나 Apple Silicon 컴퓨터에서 파일 손상과 같은 오류 메시지가 표시되는 경우. Terminal.app을 열고 다음 명령을 입력한 다음(중간에 비밀번호를 입력해야 할 수도 있음), pot을 다시 시작합니다:

    ```bash
    sudo xattr -d com.apple.quarantine /Applications/pot.app
    ```

-   열 때마다 권한 프롬프트가 나타나거나 바로 가기 번역을 수행할 수 없는 경우 설정 -> 개인정보 및 보안 -> 지원 기능으로 이동하여 Pot을 제거한 다음 Pot을 다시 추가하세요..

## Linux

### Debian/Ubuntu 데비안/우분투

리눅스 환경을 위해 `deb` 파일이 제공됩니다

참고 : 두 가지 버전이 제공됩니다. `glibc2.28`기반의 `universal`과 `openssl-1.1` 버전입니다. 프로그램이 당신의 컴퓨터에서 정상적으로 실행되지 않는다면 dependency와 관련된 문제일 경우가 많습니다. `universal`버전을 사용하면 이전 버전의 dependency를 사용하여 실행하면 대부분 실행이 가능합니다.

### Arch/Manjaro

> [!WARNING]  
> In newer version of [Webkit2Gtk](https://archlinux.org/packages/extra/x86_64/webkit2gtk) (2.42.0), Because Nvidia Proprietary drives are not fully implemented DMABUF, it will cause failure to start and crash.<br>
> Please downgrade or add the `WEBKIT_DISABLE_DMABUF_RENDERER=1` environment variable to `/etc/environment` (or other places where environment variables are set) to turn off the use of DMABUF.

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

### Flatpak

> [!WARNING]
> 시스템 트레이 아이콘이 Flatpak을 통해 설치하면 표시되지 않습니다.

<a href='https://flathub.org/apps/com.pot_app.pot'>
    <img width='240' alt='Download on Flathub' src='https://flathub.org/api/badge?locale=en'/>
</a>

<div align="center">

# 외부호출

</div>

Pot은 완벽한 HTTP 인터페이스를 제공합니다. 이를 통해 다른 프로그램과 연동해서 사용이 가능합니다. 타 프로그램은 HTTP requests를 `127.0.0.1:port` 주소로 보내어 활용할 수 있습니다. 기본 포트는 `60828`입니다. 이는 사용자 설정에서 변경이 가능합니다.

## API 상세:

```bash
POST "/" => Translate given text (body is text to translate)
GET "/config" => Open settings
POST "/translate" => Translate given text (same as "/")
GET "/selection_translate" => Translate selected text
GET "/input_translate" => Open input translation
GET "/ocr_recognize" => Perform OCR on screenshot
GET "/ocr_translate" => Perform translation on screenshot
GET "/ocr_recognize?screenshot=false" => OCR without taking screenshot
GET "/ocr_translate?screenshot=false" => Translate screenshot without taking screenshot
GET "/ocr_recognize?screenshot=true" => OCR with screenshot
GET "/ocr_translate?screenshot=true" => Translate screenshot
```

## 예제:

-   선택영역 자동번역:

    "선택영역 자동번역"을 호출하려면 간단히 `127.0.0.1:port`에 호출요청을 합니다:

    E.g. curl 사용시:

    ```bash
    curl "127.0.0.1:60828/selection_translate"
    ```

## 자체스크린샷 미사용 OCR 기능

OCR 및 번역을 위해서 pot은 자체 스크린샷(화면캡쳐)기능을 사용하지 않을 수 있습니다. 자체 화면캡쳐 툴을 사용하면 특정환경에서 자체 스크린샷 기능이 정상적으로 동작하지 않는 것을 해결할 수 있습니다.

### Workflow:

1. 타 스크린샷 프로그램을 사용하여 화면을 캡쳐합니다
2. 캡쳐한 화면을 다음 위치에 저장합니다. `$CACHE/com.pot-app.desktop/pot_screenshot_cut.png`
3. 외부호출을 통해 번역요청을 요청합니다. `127.0.0.1:port/ocr_recognize?screenshot=false`

> `$CACHE` 는 시스템 캐시 폴더입니다. e.g. 윈도우는 다음경로를 확인하세요 `C:\Users\{username}\AppData\Local\com.pot-app.desktop\pot_screenshot_cut.png` .

### 예제

리눅스에서 Flameshot을 활용한 OCR:

```bash
rm ~/.cache/com.pot-app.desktop/pot_screenshot_cut.png && flameshot gui -s -p ~/.cache/com.pot-app.desktop/pot_screenshot_cut.png && curl "127.0.0.1:60828/ocr_recognize?screenshot=false"
```

## Existing Usages (Quick selection translation)

### SnipDo (Windows)

1. SnipDo를 [Microsoft Store](https://apps.microsoft.com/store/detail/snipdo/9NPZ2TVKJVT7) 에서 다운받아 설치합니다.
2. DSnipDo 확장팩을 최신버전 다운 경로에서 [Release](https://github.com/pot-app/pot-desktop/releases/latest) (pot.pbar) 다운받습니다.
3. 더블클릭하여 설치합니다.
4. 특정단어를 선택하게 되면, 선택영역의 오른쪽 윗 부분에 번역아이콘이 보이게 됩니다. 클릭하여 번역을 진행합니다.

### PopClip (MacOS)

1. PopClip를 [App Store](https://apps.apple.com/us/app/popclip/id445189367?mt=12) 에서 다운받아 설치합니다.
2. PopClip 확장팩을 최신버전 다운 경로에서 [Release](https://github.com/pot-app/pot-desktop/releases/latest) (pot.popclipextz) 다운받습니다.
3. 더블클릭하여 설치합니다.
4. PopClip settings에서 기능을 활성화 하면 선택영역의 번역을 할 수 있습니다.

### Starry (Linux)

> Starry는 아직 개발단계에 머물러 있습니다.따라서 사용자가 직업 컴파일해야 합니다.

Github: [ccslykx/Starry](https://github.com/ccslykx/Starry)

<div align="center">

# Wayland 지원

</div>

배포판마다 Wayland에 대한 지원 수준이 다르기 때문에 pot 자체로는 완벽한 호환성을 달성할 수 없습니다. 하지만 다음은 적절한 구성을 통해 구현할 수 있는 몇 가지 일반적인 문제에 대한 해결책으로, Wayland에서 pot을 완벽하게 실행할 수 있습니다.

## 단축키를 적용할 수 없을 때,

타우리Tauri는 웨이랜드Wayland를 지원하지 않기 때문에, pot의 단축키 기능은 웨이랜드Waylan에서 사용할 수 없습니다.
시스템 단축키를 설정하고 `curl`로 요청을 보내 팟을 호출할 수 있으며, 자세한 내용은[External Calls](#external-calls) 을 참조하세요.

## 단축키가 동작하지 않을 때,

일부 순수 웨이랜드Wayland 데스크톱 환경/창 관리자(예: 하이프랜드)에서는 pot의 기본 제공 스크린샷 기능을 사용할 수 없습니다. 이 경우 다른 스크린샷 도구를 대신 사용할 수 있습니다. 자세한 내용은 [Not Using Built-in Screenshot](#not-using-built-in-screenshot) 섹션을 참조하세요.

아래는 스크린샷 기능을 구현하기 위해 `grim`과 `slurp`를 사용하는 Hyprland의 구성 예시입니다:

```conf
bind = ALT, X, exec, grim -g "$(slurp)" ~/.cache/com.pot-app.desktop/pot_screenshot_cut.png && curl "127.0.0.1:60828/ocr_recognize?screenshot=false"
bind = ALT, C, exec, grim -g "$(slurp)" ~/.cache/com.pot-app.desktop/pot_screenshot_cut.png && curl "127.0.0.1:60828/ocr_translate?screenshot=false"
```

다른 데스크톱 환경/창 관리자도 비슷한 작업을 수행합니다.

## 번역창은 마우스 좌표를 따라갑니다.

현재 웨이랜드Wayland에서 정확한 마우스 좌표를 얻을 수 없기 때문에 내부 구현이 제대로 작동하지 않습니다. 특정 데스크톱 환경/창 관리자의 경우 창 규칙을 설정하여 마우스 위치에 따른 창을 구현할 수 있습니다. 여기서는 하이프랜드Hyprland를 예로 들어보겠습니다:

```conf
windowrulev2 = float, class:(pot), title:(Translator|OCR|PopClip|Screenshot Translate) # Translation window floating
windowrulev2 = move cursor 0 0, class:(pot), title:(Translator|PopClip|Screenshot Translate) # Translation window follows the mouse position.
```

<div align="center">

# 다중언어 지원([Weblate](https://hosted.weblate.org/engage/pot-app/))

[![](https://hosted.weblate.org/widget/pot-app/pot-desktop/svg-badge.svg)](https://hosted.weblate.org/engage/pot-app/)

[![](https://hosted.weblate.org/widget/pot-app/pot-desktop/multi-auto.svg)](https://hosted.weblate.org/engage/pot-app/)

</div>

<div align="center">

# 기여자

</div>

<img src="https://github.com/pot-app/.github/blob/master/pot-desktop-contributions.svg?raw=true" width="100%"/>

## 사용자 컴파일

### 요구사항

Node.js >= 18.0.0

pnpm >= 8.5.0

Rust >= 1.80.0

### 컴파일 방법

1. repository을 복사합니다

    ```bash
    git clone https://github.com/pot-app/pot-desktop.git
    ```

2. dependencies를 설치합니다

    ```bash
    cd pot-desktop
    pnpm install
    ```

3. (Only Linux) dependencies를 설치합니다

    ```bash
    sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libayatana-appindicator3-dev librsvg2-dev patchelf libxdo-dev libxcb1 libxrandr2 libdbus-1-3
    ```

4. 개발모드 (Optional)

    ```bash
    pnpm tauri dev # Run the app in development mode
    ```

5. 빌드
    ```bash
    pnpm tauri build # Build into installation package
    ```

<div align="center">

# 관련사항

</div>

-   [Bob](https://github.com/ripperhe/Bob) Inspiration
-   [bob-plugin-openai-translator](https://github.com/yetone/bob-plugin-openai-translator) OpenAI API Reference
-   [@uiYzzi](https://github.com/uiYzzi) Implementation ideas
-   [@Lichenkass](https://github.com/Lichenkass) Maintaining the Deepin App Store.
-   [Tauri](https://github.com/tauri-apps/tauri) A user-friendly GUI framework.

<div align="center">
