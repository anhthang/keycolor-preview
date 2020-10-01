const fs = require('fs')

const base = 'public/keyboards'
const layouts = {
    '60_ansi': {
        name: '60 ANSI',
        keyboards: [],
    },
    '65_ansi': {
        name: '65 ANSI',
        keyboards: [],
    },
    '75_ansi': {
        name: '75 ANSI',
        keyboards: [],
    },
    '96_ansi': {
        name: '96 ANSI',
        keyboards: [],
    },
    alice: {
        name: 'Alice',
        keyboards: [],
    },
    hhkb: {
        name: 'HHKB',
        keyboards: [],
    },
    numpad: {
        name: 'Numpad',
        keyboards: [],
    },
    tkl: {
        name: 'Tenkeyless',
        keyboards: [],
    },
    default: {
        name: 'Others',
        keyboards: [],
    },
}

const folders = fs.readdirSync(base).sort((a, b) => a - b)

folders.forEach(folder => {
    if (folder === '.DS_Store') return

    const files = fs.readdirSync(`${base}/${folder}`)
    if (!Array.isArray(files)) return

    files.forEach(file => {
        const data = require(__dirname + `/${base}/${folder}/${file}`)
        Object.keys(data.layouts).forEach(layout => {
            layouts[layout] = layouts[layout] || { name: layout, keyboards: [] }
            layouts[layout].keyboards.push({
                keyboard_name: data.keyboard_name,
                keyboard_folder: data.keyboard_folder,
                manufacturer: data.manufacturer,
            })
        })
        // fs.readFile(`${base}/${folder}/${file}`, (err, data) => {
        // })
    })
})

fs.writeFile('public/keyboards.json', JSON.stringify(layouts, null, 4), () => {
    console.log('done')
})
