# KeyColor Viewer

<p align="center">
    <img src="./public/logo256.png"/>
</p>

Keyboard information, layout, styles is based on the data from the [QMK Configurator](https://config.qmk.fm/) with some modifications from me.

## Why I'm here
I ordered Canoe Gen 2 and I want to see what it looks like when combined with the keysets I have. Hope this help people who joining mechanical keyboard community in order to build a favourite keyboards.

## TODO
- [x] Different font, text display per keycap profile
- [x] Support display bilingual (Hiragana, Hangul...)
- [ ] Multiple colorway selection for alphas, modifiers
- [ ] Keyboard cases
- [ ] 3D keycap render with three.js
- [ ] Filter by layout type

## Pull Request
You are welcome.

- Add new keyboard:
    - Add new item at `public/keyboard_folders.json`
    - Add new keyboard info at `public/keyboards` folder following the data from QMK
    - Key `code` is required for layout, don't need label here. Or you can use default layout (see `keyboards/percent/canoe`)

- Add new default layout:
    - Add new file into `public/layouts`

- Add new colorway:
    - Replica a new colorway from QMK or look at `src/scss/colorways.scss` and other files in the same folder


### Note
- [Logo], [Favicon] made by [Flat Icons](https://www.flaticon.com)

[Logo]: https://www.flaticon.com/free-icon/keyboard_2867576
[Favicon]: https://www.flaticon.com/free-icon/keyboard_2764814