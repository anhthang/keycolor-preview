# KeyColor - Keyboard & Keycap Color Preview

<p align="center">
    <img src="./public/logo256.png"/>
</p>

Keyboard information, layouts, styles are based on the data from the [QMK Configurator](https://config.qmk.fm/) with some of my modifications.

## 🥳 Why I'm here
This project popped up in my mind when I ordered Canoe Gen 2 and wanted to see what it looks like when combined with the keysets I have. So if you have the same concern, here it is for you. Hope this helps people who are in the mechanical keyboard community in order to build a favorite keyboard.

## 🎉 Feature
- [x] **3D keycap viewer** (except KAT profile)
- [x] Different font, text display per keycap profile
- [x] Support displaying characters of other languages
    - Hiragana (GMK Bento, Mecha-01, Sumi...)
    - Hangul (GMK Hanguk)
    - Cyrillics (GMK Yuri)
- [x] Multiple colorway selections for alphas, modifiers
- [x] Use SVG icons for novelties like Esc, Enter (SA Oblivion)

## 🎨 TODO
- [ ] Keyboard cases
- [ ] 3D keycap render
    - [ ] Zoom camera to near the keyboard
    - [ ] Display correct legend text position
    - [ ] Darker canvas color to match the design color or real color
- [ ] Filter by layout type
- [ ] Auto deploy
- [ ] Auto resize in small screens
- [ ] Dark mode toggle
- [ ] Artisan keycap on 3D mode 😆

## 📬 Pull Request
You are welcome.

- Add new keyboards:
    - Add new items at `public/keyboards.json`
    - Add new keyboard info at the `public/keyboards` folder following the data from QMK
    - Key `code` is required for layout, don't need any label here. Or you can use default layout (see `keyboards/percent/canoe`)

- Add new default layouts:
    - Add new files into public/layouts

- Add a new colorway:
    - Clone a new colorway from QMK or look at `src/scss/colorways.scss` and other files in the same folder


## 📝 Credits
- SA, Cherry keycap models are Copyright (c) 2017 [Josh Hinnebusch](https://github.com/hineybush) (thanks eli#1111 for helping me convert .sldprt to .stl)
- DSA keycap models are Copyright (c) 2017 [Kael Ruland](https://www.reddit.com/user/the_television)

- [Logo], [Favicon] made by [Flat Icons](https://www.flaticon.com)

[Logo]: https://www.flaticon.com/free-icon/keyboard_2867576
[Favicon]: https://www.flaticon.com/free-icon/keyboard_2764814
