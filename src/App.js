import React, { useEffect, useState } from 'react';
// import logo from './logo.svg';
import './App.css';
import './App.scss';
import 'antd/dist/antd.css';

import * as fetch from 'node-fetch';
import { Select, Card, Cascader } from 'antd';
import _ from 'lodash';
import keycodes from './keycodes';

import colorways from './components/colorways';

// let substitute = Object.assign(
//   {},
//   colorways.iconCodes,
//   colorways.platformIcons(window.navigator.platform)
// );

const keycodeMap = _.keyBy(keycodes, 'code')
const defaultColor = ['gmk', 'camping']

const { Option } = Select

function keyClasses(key, colorway, kit) {
  const classes = ['key']

  if (kit) {
    classes.push(kit)
  }
  if (key.display === false) {
    classes.push('hidden-key')
  }
  if (colorway.override && colorway.override[key.code]) {
    // Colorway specific overrides by keycode
    classes.push(
      `${colorway.name}-${colorway.override[key.code]}`
    );
  } else if (
    // Large alpha keys (like Numpad 0)
    colorways.alphaCodes[key.code]
  ) {
    classes.push(`${colorway.name}-key`);
  } else if (
    // Mod keys
    // colorways.modCodes[key.code] ||
    // (this.w <= KEY_WIDTH * 3 &&
    //   (this.w > KEY_WIDTH || this.h > KEY_HEIGHT))
    colorways.modCodes[key.code] || (key.w <= 3 && (key.w > 1 || key.h > 1))
  ) {
    classes.push('mod');
    classes.push(`${colorway.name}-mod`);
  } else {
    // everything else
    classes.push(`${colorway.name}-key`);
  }

  return classes.join(' ')
}

const colorwayNames = _(colorways.list)
  .groupBy(i => i.name.split('-')[0])
  .map((list, manufacture) => {
    return {
      value: manufacture,
      label: manufacture.toUpperCase(),
      children: list.map(c => {
        const parts = c.name.split('-')
        parts.shift()
        const display = parts.map((n) => n.replace(n.charAt(0), n.charAt(0).toUpperCase())).join(' ')

        return {
          value: parts.join('-'),
          label: display,
          children: c.kits ? c.kits.map(k => ({ value: k, label: k.replace(k.charAt(0), k.charAt(0).toUpperCase()) })) : []
        }
      })
    }
  })
  .value()

function App() {
  const [keyboardNames, setKeyboardNames] = useState([])
  const [keyboard, setKeyboard] = useState({})
  const [keymaps, setKeymaps] = useState({ layout: [] })
  const [colorway, setColorway] = useState({})
  const [kit, setKit] = useState(null)
  // const [modClw, setModClw] = useState("")

  useEffect(() => {
    fetch('http://localhost:3000/keyboards.json')
      .then(res => res.json())
      .then(res => {
        setKeyboardNames(res)
      })
  }, [])

  const getLayout = (layout_name, additional) => {
    fetch(`http://localhost:3000/layouts/${layout_name}.json`)
      .then(res => res.json())
      .then(res => {
        const kbLayout = {...res, ...additional}
        setKeymaps(kbLayout)
      })
  }

  const selectBoard = (keyboard_name) => {
    fetch(`http://localhost:3000/keyboards/${keyboard_name}.json`)
      .then(res => res.json())
      .then(res => {
        setKeyboard(res)

        const layout = Object.keys(res.layouts)[0]
        if (layout === 'default') {
          // make keyboards which still not change to new format working
          setKeymaps(res.layouts.default)
        } else {
          getLayout(layout, res.layouts[layout])
        }

        changeColorway(colorway.name ? colorway.name.split('-') : defaultColor)
      })
  }

  // const chooseLayout = (name) => {
  //   setKeymaps(keyboard.layouts[name].layout)
  // }

  const changeColorway = (name) => {
    const base = name.slice(0, 2).join('-')
    const clw = colorways.list.find(c => c.name === base)
    setColorway(clw)
    setKit(name[2])
    // if (!modClw) {
    //   setModClw(name.toLowerCase().replace(/ /g, '-'))
    // }
  }
  const changeModColorway = (name) => {
    // setModClw(name.toLowerCase().replace(/ /g, '-'))
  }

  const maxWidth = Array.isArray(keymaps.layout) && keymaps.layout.length
    ? _.max(keymaps.layout.map(k => k.x + (k.w || 1)))
    : 0
  const maxHeight = Array.isArray(keymaps.layout) && keymaps.layout.length
    ? _.max(keymaps.layout.map(k => k.y + (k.h || 1)))
    : 0

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <Card>
          <Select showSearch style={{ width: 300 }} onSelect={(e) => selectBoard(e)}>
            {
              keyboardNames.map(keyboard => {
                return <Option value={keyboard} key={keyboard}>{keyboard}</Option>
              })
            }
          </Select>
          <Cascader showSearch style={{ width: 400 }} options={colorwayNames} onChange={changeColorway} placeholder="Select colorway" />
        </Card>
        <Card style={{
          position: 'relative',
          width: 60 * maxWidth,
          height: 60 * maxHeight,
          top: 24,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          whiteSpace: 'pre-line',
        }}>
          {keymaps.layout.map((k, idx) => {
            const key = {...k, ...keymaps.override && keymaps.override[k.code]}

            return <div
              key={idx}
              id={idx}
              title={k.code}
              className={keyClasses(key, colorway, kit)}
              key-code={k.code}
              style={{
                  borderRadius: `6px`,
                  boxShadow: `inset 0 -1px 0 3px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,.3)`,
                  borderLeft: `1px solid rgba(0,0,0,.1)`,
                  borderRight: `1px solid rgba(0,0,0,.1)`,
                  // fontFamily: `Cascadia Code`,
                  fontSize: "small",
                  left: `${key.x * 60}px`,
                  top: `${key.y * 60}px`,
                  width: `${(key.w || 1) * 60 - 5}px`,
                  height: `${(key.h || 1) * 60 - 5}px`,
                  marginRight: `5px`,
                  marginBottom: `5px`,
                  ...k.z && { transform: `rotateZ(${k.z || 0}deg)` }
              }}
              >
              {keycodeMap[k.code] && keycodeMap[k.code].name}
            </div>
          })}
          {/* <Image /> */}
        </Card>
        {/* <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
      </header>
    </div>
  );
}

export default App;
