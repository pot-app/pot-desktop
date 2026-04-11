<div align="center">

<img width="200px" src="asset/pot.png" />

# Pot (Кумедний перекладач)

> 🌈 Кросплатформений застосунок для перекладу та розпізнавання тексту

[![License](https://img.shields.io/github/license/pot-app/pot-desktop.svg)](https://github.com/pot-app/pot-desktop/blob/master/LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-1.x-blue)](https://tauri.app)
[![Windows](https://img.shields.io/badge/-Windows-blue?logo=windows)](https://github.com/pot-app/pot-desktop/releases/latest)
[![MacOS](https://img.shields.io/badge/-MacOS-black?logo=apple)](https://github.com/pot-app/pot-desktop/releases/latest)
[![Linux](https://img.shields.io/badge/-Linux-yellow?logo=linux)](https://github.com/pot-app/pot-desktop/releases/latest)

[Telegram-група](https://t.me/pot_app)

[中文](./README.md) | [English](./README_EN.md) | [한글](./README_KR.md) | **Українська**

</div>

## Зміст

- [Використання](#використання)
- [Особливості](#особливості)
- [Підтримувані сервіси](#підтримувані-сервіси)
- [Система плагінів](#система-плагінів)
- [Встановлення](#встановлення)
- [Зовнішні виклики](#зовнішні-виклики)
- [Підтримка Wayland](#підтримка-wayland)
- [Локалізація](#локалізація)
- [Учасники](#учасники)
- [Подяки](#подяки)

## Використання

| Переклад виділеного тексту | Переклад введеного тексту | Зовнішні виклики |
| :---: | :---: | :---: |
| Виділіть текст і натисніть задану гарячу клавішу | Натисніть гарячу клавішу, введіть текст і натисніть Enter | Виклик з інших застосунків для зручнішого робочого процесу, детальніше — [Зовнішні виклики](#зовнішні-виклики) |

| Режим прослуховування буфера обміну | Знімок екрана (OCR) | Переклад знімка екрана |
| :---: | :---: | :---: |
| Натисніть іконку у лівому верхньому куті панелі перекладу — скопійований текст перекладатиметься автоматично | Натисніть гарячу клавішу і виділіть область для розпізнавання | Натисніть гарячу клавішу і виділіть область для перекладу |

## Особливості

- Паралельний переклад через кілька сервісів ([підтримувані сервіси](#підтримувані-сервіси))
- Розпізнавання тексту (OCR) через кілька сервісів ([підтримувані сервіси](#підтримувані-сервіси))
- Синтез мовлення (TTS) через кілька сервісів ([підтримувані сервіси](#підтримувані-сервіси))
- Експорт до словникових застосунків ([підтримувані сервіси](#підтримувані-сервіси))
- Зовнішні виклики ([детальніше](#зовнішні-виклики))
- Система плагінів ([система плагінів](#система-плагінів))
- Підтримка Windows, macOS та Linux
- Підтримка Wayland (протестовано на KDE, Gnome та Hyprland)
- Підтримка кількох мов інтерфейсу

## Підтримувані сервіси

<details>
<summary>Переклад</summary>

- OpenAI
- ChatGLM
- Gemini Pro
- Ollama (офлайн)
- Alibaba Translate
- Baidu Translate
- Caiyun
- Tencent Translate
- Tencent Interactive Translate
- Volcengine Translate
- NiuTrans
- Google Translate
- Bing Translate
- Bing Dictionary
- DeepL
- Youdao
- Cambridge Dictionary
- Yandex
- Lingva (плагін)
- Tatoeba (плагін)
- ECDICT (плагін)

> Більше сервісів — у [системі плагінів](#система-плагінів)

</details>

<details>
<summary>Розпізнавання тексту (OCR)</summary>

- Системний OCR (офлайн)
  - Windows.Media.OCR (Windows)
  - Apple Vision Framework (macOS)
  - Tesseract OCR (Linux)
- Tesseract.js (офлайн)
- Baidu OCR
- Tencent OCR
- Volcengine OCR
- iFlyTek OCR
- Tencent Image Translate
- Baidu Image Translate
- Simple LaTeX
- OCRSpace (плагін)
- Rapid (офлайн, плагін)
- Paddle (офлайн, плагін)

> Більше сервісів — у [системі плагінів](#система-плагінів)

</details>

<details>
<summary>Синтез мовлення (TTS)</summary>

- Lingva

> Більше сервісів — у [системі плагінів](#система-плагінів)

</details>

<details>
<summary>Словники</summary>

- Anki
- Eudic
- Youdao (плагін)
- Shanbay (плагін)

> Більше сервісів — у [системі плагінів](#система-плагінів)

</details>

## Система плагінів

Кількість вбудованих сервісів обмежена, але ви можете розширити функціональність застосунку за допомогою системи плагінів.

### Встановлення плагіна

Знайдіть потрібний плагін у [списку плагінів](https://github.com/pot-app/pot-desktop/blob/master/PLUGIN_LIST.md) і перейдіть у репозиторій плагіна для завантаження.

Розширення плагінів pot має формат `.potext`. Після завантаження файлу `.potext` перейдіть до **Налаштування → Служби → Додати зовнішній плагін → Встановити зовнішній плагін** і виберіть відповідний файл `.potext`. Плагін буде додано до списку служб і працюватиме як вбудований.

### Усунення несправностей

**Не вдається знайти вказаний модуль (Windows)**

Така помилка виникає через відсутність бібліотек C++ у системі. Завантажте та встановіть їх [звідси](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist).

**Не є допустимим застосунком Win32 (Windows)**

Ця помилка означає, що ви завантажили плагін для іншої системи або архітектури. Завантажте правильний плагін з репозиторію.

### Розробка плагіна

Розділ «Шаблони» у [списку плагінів](https://github.com/pot-app/pot-desktop/blob/master/PLUGIN_LIST.md) містить шаблони розробки для різних типів плагінів. Конкретну документацію дивіться у відповідному шаблонному репозиторії.

## Встановлення

### Windows

**Встановлення через Winget**

```bash
winget install Pylogmon.pot
```

**Встановлення вручну**

Завантажте останній інсталятор `.exe` зі [сторінки релізів](https://github.com/pot-app/pot-desktop/releases/latest):

- 64-розрядна система: `pot_{version}_x64-setup.exe`
- 32-розрядна система: `pot_{version}_x86-setup.exe`
- arm64: `pot_{version}_arm64-setup.exe`

Двічі клацніть завантажений файл для встановлення.

**Усунення несправностей**

*Після запуску немає інтерфейсу, клацання на іконку в треї не реагує*

Перевірте, чи не видалено або вимкнено WebView2. Якщо так — встановіть WebView2 вручну або відновіть його. Якщо встановити WebView2 не вдається (корпоративна версія системи), спробуйте завантажити версію з вбудованим WebView2: `pot_{version}_{arch}_fix_webview2_runtime-setup.exe`. Якщо проблема залишається — спробуйте запустити у режимі сумісності з Windows 7.

---

### macOS

**Встановлення через Brew**

```bash
# Додайте наш tap
brew tap pot-app/homebrew-tap

# Встановіть pot
brew install --cask pot

# Оновіть pot
brew upgrade --cask pot
```

**Встановлення вручну**

Завантажте останній інсталятор `.dmg` зі [сторінки релізів](https://github.com/pot-app/pot-desktop/releases/latest). Для чіпа M1 — файл `pot_{version}_aarch64.dmg`, для Intel — `pot_{version}_x64.dmg`. Двічі клацніть завантажений файл і перетягніть pot до папки «Програми».

**Усунення несправностей**

*"pot" неможливо відкрити, оскільки розробника не вдається перевірити*

Натисніть «Скасувати», потім перейдіть до **Системні налаштування → Конфіденційність і безпека** і натисніть «Все одно відкрити». Після цього попередження більше не з'являтиметься.

Якщо ця опція відсутня або файл пошкоджено (Apple Silicon) — відкрийте Terminal.app і виконайте:

```bash
sudo xattr -d com.apple.quarantine /Applications/pot.app
```

Потім перезапустіть pot.

*Щоразу з'являється запит на дозвіл доступності, або не працює переклад виділеного тексту*

Перейдіть до **Системні налаштування → Конфіденційність і безпека → Доступність**, видаліть pot зі списку і додайте знову.

---

### Linux

**Debian/Ubuntu**

Завантажте останній `.deb`-пакет зі [сторінки релізів](https://github.com/pot-app/pot-desktop/releases/latest). Доступні два варіанти: стандартний і `universal` (на базі glibc 2.28 та openssl 1.1 — для систем із проблемами залежностей).

```bash
sudo apt-get install ./pot_{version}_amd64.deb
```

**Arch/Manjaro**

> ⚠️ У нових версіях Webkit2Gtk (2.42.0) з пропрієтарними драйверами Nvidia можливі збої через неповну реалізацію DMABUF. Знизьте версію або додайте змінну середовища `WEBKIT_DISABLE_DMABUF_RENDERER=1` до `/etc/environment`.

```bash
# Через AUR helper
yay -S pot-translation
# або
paru -S pot-translation

# Через archlinuxcn
sudo pacman -S pot-translation
```

**Flatpak**

> ⚠️ У версії Flatpak відсутня іконка в системному треї.

---

## Зовнішні виклики

Pot надає повний HTTP-інтерфейс для інтеграції з іншими застосунками. Надсилайте HTTP-запити на `127.0.0.1:port`, де `port` — порт прослуховування pot (за замовчуванням `60828`, можна змінити в налаштуваннях).

### API

| Метод | Шлях | Опис |
|-------|------|------|
| POST | `/` | Перекласти переданий текст (тіло запиту — текст) |
| GET | `/config` | Відкрити налаштування |
| POST | `/translate` | Перекласти переданий текст (аналог `/`) |
| GET | `/selection_translate` | Переклад виділеного тексту |
| GET | `/input_translate` | Відкрити вікно введення перекладу |
| GET | `/ocr_recognize` | OCR знімка екрана |
| GET | `/ocr_translate` | Переклад знімка екрана |
| GET | `/ocr_recognize?screenshot=false` | OCR без внутрішнього знімка |
| GET | `/ocr_translate?screenshot=false` | Переклад без внутрішнього знімка |

**Приклад — виклик перекладу виділеного тексту через curl:**

```bash
curl "127.0.0.1:60828/selection_translate"
```

### OCR без вбудованого скріншота

Ця функція дозволяє використовувати власний інструмент для знімків екрана:

1. Зробіть знімок екрана іншим інструментом
2. Збережіть його у `$CACHE/com.pot-app.desktop/pot_screenshot_cut.png`
   - Windows: `C:\Users\{ім'я_користувача}\AppData\Local\com.pot-app.desktop\pot_screenshot_cut.png`
3. Надішліть запит: `curl "127.0.0.1:60828/ocr_recognize?screenshot=false"`

**Приклад для Linux (Flameshot):**

```bash
rm ~/.cache/com.pot-app.desktop/pot_screenshot_cut.png && \
flameshot gui -s -p ~/.cache/com.pot-app.desktop/pot_screenshot_cut.png && \
curl "127.0.0.1:60828/ocr_recognize?screenshot=false"
```

### Готові інтеграції

**SnipDo (Windows)**
1. Встановіть [SnipDo](https://apps.microsoft.com/store/detail/snipdo/9NPZ2TVKJVT7) з Microsoft Store
2. Завантажте розширення pot для SnipDo (`pot.pbar`) зі [сторінки релізів](https://github.com/pot-app/pot-desktop/releases/latest)
3. Двічі клацніть файл розширення для встановлення
4. Виділіть текст — у панелі SnipDo з'явиться кнопка перекладу

**PopClip (macOS)**
1. Встановіть [PopClip](https://apps.apple.com/app/popclip/id445189367) з App Store
2. Завантажте розширення pot для PopClip (`pot.popclipextz`) зі [сторінки релізів](https://github.com/pot-app/pot-desktop/releases/latest)
3. Двічі клацніть файл розширення для встановлення
4. Увімкніть розширення pot у налаштуваннях PopClip — виділений текст перекладатиметься автоматично

**Starry (Linux)**

Starry ще на стадії розробки, потребує ручного компілювання. [GitHub: ccslykx/Starry](https://github.com/ccslykx/Starry)

---

## Підтримка Wayland

Рівень підтримки Wayland різниться між дистрибутивами, тому pot не може забезпечити ідеальну сумісність «з коробки». Нижче наведено рішення для типових проблем.

### Гарячі клавіші не працюють

Tauri не підтримує гарячі клавіші під Wayland. Налаштуйте системні гарячі клавіші для надсилання curl-запитів до pot (детальніше — [Зовнішні виклики](#зовнішні-виклики)).

### Знімок екрана не працює

У деяких середовищах Wayland (наприклад Hyprland) вбудований скріншот pot не працює. Використовуйте зовнішні інструменти (детальніше — [OCR без вбудованого скріншота](#ocr-без-вбудованого-скріншота)).

**Приклад конфігурації Hyprland (grim + slurp):**

```
bind = ALT, X, exec, grim -g "$(slurp)" ~/.cache/com.pot-app.desktop/pot_screenshot_cut.png && curl "127.0.0.1:60828/ocr_recognize?screenshot=false"
bind = ALT, C, exec, grim -g "$(slurp)" ~/.cache/com.pot-app.desktop/pot_screenshot_cut.png && curl "127.0.0.1:60828/ocr_translate?screenshot=false"
```

### Вікно перекладу не слідує за курсором

Pot наразі не може коректно отримати координати курсора під Wayland. Для певних середовищ можна налаштувати правила вікон. Приклад для Hyprland:

```
windowrulev2 = float, class:(pot), title:(Translator|OCR|PopClip|Screenshot Translate)
windowrulev2 = move cursor 0 0, class:(pot), title:(Translator|PopClip|Screenshot Translate)
```

---

## Локалізація

Pot підтримує кілька мов інтерфейсу. Долучитися до перекладу можна через [Weblate](https://hosted.weblate.org/engage/pot-app/).

[![Стан перекладу](https://hosted.weblate.org/widgets/pot-app/-/pot-desktop/multi-auto.svg)](https://hosted.weblate.org/engage/pot-app/)

---

## Ручне складання

### Вимоги

- Node.js >= 18.0.0
- pnpm >= 8.5.0
- Rust >= 1.80.0

### Кроки

```bash
# Клонувати репозиторій
git clone https://github.com/pot-app/pot-desktop.git
cd pot-desktop

# Встановити залежності
pnpm install

# Лише для Linux — системні залежності
sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libayatana-appindicator3-dev librsvg2-dev patchelf libxdo-dev libxcb1 libxrandr2 libdbus-1-3

# Запуск у режимі розробки
pnpm tauri dev

# Збірка інсталяційного пакету
pnpm tauri build
```

---

## Учасники

<a href="https://github.com/pot-app/pot-desktop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=pot-app/pot-desktop" />
</a>

---

## Подяки

- [Bob](https://github.com/ripperhe/Bob) — джерело натхнення
- [bob-plugin-openai-translator](https://github.com/yetone/bob-plugin-openai-translator) — довідка з OpenAI API
- [@uiYzzi](https://github.com/uiYzzi) — ідеї реалізації
- [@Lichenkass](https://github.com/Lichenkass) — підтримка застосунку в Deepin App Store
- [Tauri](https://tauri.app/) — зручний GUI-фреймворк
