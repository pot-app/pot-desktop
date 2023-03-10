<div align="center">
    <img width="150" height="150" alt="Logo" src="public/icon.png"/>
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

[![AUR version](https://img.shields.io/aur/version/pot-translation?label=pot-translation&logo=archlinux)](https://aur.archlinux.org/packages/pot-translation)
[![AUR version](https://img.shields.io/aur/version/pot-translation-bin?label=pot-translation-bin&logo=archlinux)](https://aur.archlinux.org/packages/pot-translation-bin)
[![AUR version](https://img.shields.io/aur/version/pot-translation-git?label=pot-translation-git&logo=archlinux)](https://aur.archlinux.org/packages/pot-translation-git)

</div>
<hr/>

## 支持平台

|   |Linux|Windows|MacOS|
| - |-----|-------|-----|
|划词翻译|✅|✅| |
|独立窗口|✅|✅|✅|

## 支持接口
- [x] 有道翻译(无需申请)
- [x] Open AI(需要申请 [api服务](https://pot.pylogmon.cn/guide/api/) 0.002$/1000token)
- [x] 百度翻译(需要申请 [api服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度100万字符)
- [x] 彩云小译(需要申请 [api服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度100万字符)
- [x] 腾讯翻译(需要申请 [api服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度500万字符)
- [x] 火山翻译(需要申请 [api服务](https://pot.pylogmon.cn/guide/api/) 每月免费额度200万字符)
- [ ] 谷歌翻译
- [ ] DeepL
- [ ] 阿里翻译

具体的api服务申请，请看[申请指南](https://pot.pylogmon.cn/guide/api/)
> 由于使用api产生的费用本作者概不负责
## 参与贡献
参考 [接口贡献指南](./CONTRIBUTING.md)
## 使用截图
![example](asset/example1.gif)
![example](asset/example2.gif)

## 使用方法
1. 鼠标选择需要翻译的内容
2. 按下划词翻译快捷键（默认Ctrl+D）
3. 完成翻译

## 安装
### Linux
#### Debian
在 [Release](https://github.com/Pylogmon/pot/releases) 下载最新deb包安装

> **注意：低版本系统请下载 `pot_<version>_amd64_universal.deb` 否则会因为`glibc`版本过低无法运行**

#### Arch
已提供 [AUR](https://aur.archlinux.org/packages?O=0&K=pot-translation) 包

### Windows
在 [Release](https://github.com/Pylogmon/pot/releases) 下载最新msi安装包安装
## 手动编译

### 所需工具
- rust 1.67.0
- pnpm
- nodejs 19
### 编译步骤

1. 克隆仓库
```bash
git clone https://github.com/Pylogmon/pot.git
```

2. 安装构建依赖
```bash
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
```

3. 开始编译
```bash
cd pot

pnpm install # 安装前端依赖

pnpm tauri build # 编译打包
```

## 感谢

- [Bob](https://github.com/ripperhe/Bob) 软件的灵感
- [bob-plugin-openai-translator](https://github.com/yetone/bob-plugin-openai-translator) 项目的启发
- [@uiYzzi](https://github.com/uiYzzi) 提供的实现思路
- [Tauri](https://github.com/tauri-apps/tauri) 提供的好用的开发框架