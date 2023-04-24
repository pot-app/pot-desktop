<div align="center">
    <img width="150" height="150" alt="Logo" src="https://cdn.staticaly.com/gh/Pylogmon/pot/master/public/icon.png"/>
    <h3 align="center" style="font-size:50px"><b>Pot</b></h3>
    <p align="center" style="font-size:18px">一个跨平台的划词翻译软件</p>
    <a href="https://pot.pylogmon.cn/guide/">快速上手</a> |
    <a href="https://github.com/Pylogmon/pot/releases">软件下载</a> |
    <a href="https://pot.pylogmon.cn/guide/config.html">进阶配置</a>
</div>
<div align="center">

[![Downloads](https://img.shields.io/github/downloads/Pylogmon/pot/total?color=blue)](https://github.com/Pylogmon/pot/releases)
[![Release](https://img.shields.io/github/v/release/Pylogmon/pot)](https://github.com/Pylogmon/pot/releases)
[![License](https://img.shields.io/github/license/Pylogmon/pot)](https://github.com/Pylogmon/pot/blob/main/LICENSE)
[![CI](https://github.com/Pylogmon/pot/actions/workflows/package.yml/badge.svg)](https://github.com/Pylogmon/pot/actions/workflows/package.yml)
[![QQ](https://img.shields.io/badge/QQ%E4%BA%A4%E6%B5%81%E7%BE%A4-767701966-blue?style=flat&logo=tencentqq)](https://raw.githubusercontent.com/Pylogmon/pot/master/asset/qq_group.jpg)

[![AUR version](https://img.shields.io/aur/version/pot-translation?label=pot-translation&logo=archlinux)](https://aur.archlinux.org/packages/pot-translation)
[![AUR version](https://img.shields.io/aur/version/pot-translation-bin?label=pot-translation-bin&logo=archlinux)](https://aur.archlinux.org/packages/pot-translation-bin)
[![AUR version](https://img.shields.io/aur/version/pot-translation-git?label=pot-translation-git&logo=archlinux)](https://aur.archlinux.org/packages/pot-translation-git)

</div>
<hr/>

## 支持特性

|   |Linux|Windows|MacOS|
| - |-----|-------|-----|
|划词翻译|✅|✅|✅|
|独立窗口|✅|✅|✅|
|插件调用|❔|[SnipDo](https://pot.pylogmon.cn/guide/config.html#snipdo-windows)|[PopClip](https://pot.pylogmon.cn/guide/config.html#popclip-macos)|
|添加到Anki([配置指南](https://pot.pylogmon.cn/guide/config.html#Anki))|✅|✅|✅|

## 支持接口
- [x] DeepL(无需申请)
- [x] Open AI(需要申请 [api服务](https://pot.pylogmon.cn/guide/api/) 0.002$/1000token)
- [x] 阿里翻译(需要申请 [api服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度100万字符)
- [x] 百度翻译(需要申请 [api服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度100万字符)
- [x] 彩云小译(需要申请 [api服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度100万字符)
- [x] 腾讯翻译(需要申请 [api服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度500万字符)
- [x] 火山翻译(需要申请 [api服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度200万字符)
- [x] 谷歌翻译(无需申请，但需要自己解决网络问题，已提供镜像站地址设置选项)

具体的api服务申请，请看[申请指南](https://pot.pylogmon.cn/guide/api/)
> 由于使用api产生的费用本作者概不负责
## 参与贡献
参考 [接口贡献指南](./CONTRIBUTING.md)

## 使用方法
| 方式 | 描述 | 预览 |
| :---: | :---: | :---: |
| 划词翻译 | 选中需要翻译的文本之后，按下划词翻译快捷键即可（默认 `Ctrl + D`） | ![划词翻译](https://cdn.staticaly.com/gh/Pylogmon/pot/master/asset/example1.gif) |
| 输入翻译| 按下输入翻译快捷键（默认 `Ctrl + Shift + D`），输入需要翻译的文本，`Enter` 键翻译 | ![输入翻译](https://cdn.staticaly.com/gh/Pylogmon/pot/master/asset/example2.gif) |
| 插件调用 | 选中需要翻译的文本之后，点击插件图标即可，详情见 [插件调用](https://pot.pylogmon.cn/guide/config.html#%E6%8F%92%E4%BB%B6%E8%B0%83%E7%94%A8) | ![插件翻译](https://cdn.staticaly.com/gh/Pylogmon/pot/master/asset/example3.gif) |

## 安装

### Windows
#### WinGet
pot 已经进入了winget仓库，可以直接使用winget安装
```powershell
winget install Pylogmon.pot
```
#### 手动安装
在 [Release](https://github.com/Pylogmon/pot/releases) 下载最新msi安装包安装

### Linux
#### Debian/Ubuntu
在 [Release](https://github.com/Pylogmon/pot/releases) 下载最新deb包安装

> **注意：低版本系统请下载 `pot_<version>_amd64_universal.deb` 否则会因为`glibc`版本过低无法运行**

#### Deepin
Deepin V20用户请下载`pot_<version>_amd64_universal.deb`，Deepin V23可以下载正常的deb包。

另外，pot已经上架Deepin应用商店，由[@Lichenkass](https://github.com/Lichenkass)进行维护。

#### Arch/Manjaro
已提供 [AUR](https://aur.archlinux.org/packages?O=0&K=pot-translation) 包

#### 关于Wayland
pot默认运行在xwayland下，如果发现在某些软件中快捷键不起作用，可以将pot设置中的快捷键清空，在系统设置中设置自定义快捷键：
```bash
pot translate # 划词翻译
pot persistent # 独立窗口
```

### MacOS
在 [Release](https://github.com/Pylogmon/pot/releases) 根据自己CPU型号选择对应的dmg包下载安装

Intel芯片下载`pot_<version>_x64.dmg`，M系列芯片下载`pot_<version>_aarch64.dmg`

## 手动编译

### 所需工具
- rust 1.67.0
- pnpm 8
- nodejs 19
### 编译步骤

1. 克隆仓库
```bash
git clone https://github.com/Pylogmon/pot.git
```

2. 安装构建依赖(Linux Only)
```bash
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
```

3. 开始编译
```bash
cd pot

pnpm install # 安装前端依赖

# pnpm tauri dev # 调试
pnpm tauri build # 编译打包
```

## 感谢

- [Bob](https://github.com/ripperhe/Bob) 灵感来源
- [bob-plugin-openai-translator](https://github.com/yetone/bob-plugin-openai-translator) OpenAI接口参考
- [@uiYzzi](https://github.com/uiYzzi) 提供实现思路
- [@Lichenkass](https://github.com/Lichenkass) 维护Deepin应用商店版本
- [Tauri](https://github.com/tauri-apps/tauri) 好用的Gui框架