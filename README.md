<div align="center">
    <img width="150" height="150" alt="Logo" src="public/icon.png"/>
    <h3 align="center" style="font-size:50px"><b>Pot</b></h3>
    <p align="center" style="font-size:18px">一个跨平台的划词翻译软件</p>
    <hr>
</div>

## 支持平台

|   |Linux|Windows|MacOS|
|---|-----|-------|-----|
|划词翻译|✅|☑️|☑️|
|独立窗口翻译|✅|✅|✅|

## 支持接口
- [x] 有道翻译(免费)
- [x] ChatGPT(gpt-3.5-turbo)
- [ ] 百度翻译
- [ ] 火山翻译
- [ ] 腾讯翻译
- [ ] 谷歌翻译
- [ ] DeepL
- [ ] 有道翻译
- [ ] 彩云小译
- [ ] 阿里翻译

## 使用演示
![example](./asset/example.webm)

## 手动编译
### 所需工具
- rust
- pnpm
- nodejs
### 编译步骤
```bash
pnpm install # 安装前端依赖

pnpm tauri build # 编译打包
```