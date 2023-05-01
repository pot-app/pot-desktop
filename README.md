<img width="150px" src="https://cdn.staticaly.com/gh/Pylogmon/pot/master/public/icon.png" align="left"/>

# Pot (Translator of Pylogmon)

> 🌈 一个跨平台的划词翻译软件 [
> [快速上手](https://pot.pylogmon.cn/guide/)|
> [软件下载](https://github.com/Pylogmon/pot/releases)|
> [进阶配置](https://pot.pylogmon.cn/guide/config.html)]

![License](https://img.shields.io/github/license/Pylogmon/pot.svg)
![Tauri](https://img.shields.io/badge/Tauri-1.2.4-blue?logo=tauri)
![JavaScript](https://img.shields.io/badge/-JavaScript-yellow?logo=javascript&logoColor=white)
![Rust](https://img.shields.io/badge/-Rust-orange?logo=rust&logoColor=white)
![Windows](https://img.shields.io/badge/-Windows-blue?logo=windows&logoColor=white)
![MacOS](https://img.shields.io/badge/-macOS-red?&logo=apple&logoColor=white)
![Linux](https://img.shields.io/badge/-Linux-yellow?logo=linux&logoColor=white)

<br/>
<hr/>
<div align="center">
<table>
<tr>
    <td> <img src="https://cdn.staticaly.com/gh/Pylogmon/pot/master/asset/light.png">
    <td> <img src="https://cdn.staticaly.com/gh/Pylogmon/pot/master/asset/dark.png">
</table>

## 使用方法

<table>
<tr>
    <td>
    <td>描述
    <td>预览
<tr>
    <td>划词翻译
    <td>选中需要翻译的文本之后，按下划词翻译快捷键即可
    <td> <img src="https://cdn.staticaly.com/gh/Pylogmon/pot/master/asset/example1.gif"/>
<tr>
    <td>输入翻译
    <td>按下输入翻译快捷键，输入需要翻译的文本，<code>Enter</code> 键翻译
    <td><img src="https://cdn.staticaly.com/gh/Pylogmon/pot/master/asset/example2.gif"/>
<tr>
    <td>插件调用
    <td>选中需要翻译的文本之后，点击插件图标即可，详情见 <a href="https://pot.pylogmon.cn/guide/config.html#%E6%8F%92%E4%BB%B6%E8%B0%83%E7%94%A8" target="_blank">插件调用</a>
    <td><img src="https://cdn.staticaly.com/gh/Pylogmon/pot/master/asset/example3.gif"/>
</table>

</div>

## 支持特性

<table>
<tr>
    <td>支持特性
    <td>Linux
    <td>Windows
    <td>MacOS
<tr>
    <td>划词翻译
    <td>✅
    <td>✅
    <td>✅
<tr>
    <td>独立窗口
    <td>✅
    <td>✅
    <td>✅
<tr>
    <td>插件调用
    <td>❔
    <td> <a href="https://pot.pylogmon.cn/guide/config.html#snipdo-windows">SnipDo</a>
    <td> <a href="https://pot.pylogmon.cn/guide/config.html#popclip-macos">PopClip</a>
<tr>
    <td>添加到 Anki
    <td colspan="3" align="center"> <a href="https://pot.pylogmon.cn/guide/config.html#anki" target="_blank">配置指南</a>
</table>

## 支持接口

-   [x] DeepL(无需申请)
-   [x] Open AI(需要申请 [api 服务](https://pot.pylogmon.cn/guide/api/) 0.002$/1000token)
-   [x] 阿里翻译(需要申请 [api 服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度 100 万字符)
-   [x] 百度翻译(需要申请 [api 服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度 100 万字符)
-   [x] 彩云小译(需要申请 [api 服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度 100 万字符)
-   [x] 腾讯翻译(需要申请 [api 服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度 500 万字符)
-   [x] 火山翻译(需要申请 [api 服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度 200 万字符)
-   [x] 谷歌翻译(无需申请，但需要自己解决网络问题，已提供镜像站地址设置选项)
-   [x]必应词典(无需申请，只能查词)

具体的 api 服务申请步骤，见[申请指南](https://pot.pylogmon.cn/guide/api/)

> 由于使用 api 产生的费用本作者概不负责

## 参与贡献

参考 [接口贡献指南](./CONTRIBUTING.md)

## 安装

### Windows

#### WinGet

pot 已经进入了 winget 仓库，可以直接使用 winget 安装

```powershell
winget install Pylogmon.pot
```

#### 手动安装

在 [Release](https://github.com/Pylogmon/pot/releases) 下载最新 msi 安装包安装

### Linux

#### Debian/Ubuntu

在 [Release](https://github.com/Pylogmon/pot/releases) 下载最新 deb 包安装

> **注意：低版本系统请下载 `pot_<version>_amd64_universal.deb` 否则会因为`glibc`版本过低无法运行**

#### Deepin

Deepin V20 用户请下载`pot_<version>_amd64_universal.deb`，Deepin V23 可以下载正常的 deb 包。

另外，pot 已经上架 Deepin 应用商店，由[@Lichenkass](https://github.com/Lichenkass)进行维护。

#### Arch/Manjaro

已提供 [AUR](https://aur.archlinux.org/packages?O=0&K=pot-translation) 包

#### 关于 Wayland

pot 默认运行在 xwayland 下，如果发现在某些软件中快捷键不起作用，可以将 pot 设置中的快捷键清空，在系统设置中设置自定义快捷键：

```bash
pot translate # 划词翻译
pot persistent # 独立窗口
```

### MacOS

在 [Release](https://github.com/Pylogmon/pot/releases) 根据自己 CPU 型号选择对应的 dmg 包下载安装

Intel 芯片下载`pot_<version>_x64.dmg`，M 系列芯片下载`pot_<version>_aarch64.dmg`

## 手动编译

### 所需工具

-   rust 1.67.0
-   pnpm 8
-   nodejs 19

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

-   [Bob](https://github.com/ripperhe/Bob) 灵感来源
-   [bob-plugin-openai-translator](https://github.com/yetone/bob-plugin-openai-translator) OpenAI 接口参考
-   [@uiYzzi](https://github.com/uiYzzi) 提供实现思路
-   [@Lichenkass](https://github.com/Lichenkass) 维护 Deepin 应用商店版本
-   [Tauri](https://github.com/tauri-apps/tauri) 好用的 Gui 框架
