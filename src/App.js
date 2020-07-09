import React, { useEffect, useState } from 'react';
// import logo from './logo.svg';
import './App.css';
import './App.scss';
import 'antd/dist/antd.css';

import * as fetch from 'node-fetch';
import { Select, Card } from 'antd';
import keyBy from 'lodash.keyby';
import max from 'lodash.max';
import keycodes from './keycodes';

import colorways from './components/colorways';

// let substitute = Object.assign(
//   {},
//   colorways.iconCodes,
//   colorways.platformIcons(window.navigator.platform)
// );

const keycodeMap = keyBy(keycodes, 'code')

const { Option } = Select

function keyClasses(keycode, colorway) {
  const classes = []
  if (colorway.override && colorway.override[keycode]) {
    // Colorway specific overrides by keycode
    classes.push(
      `${colorway.name}-${colorway.override[keycode]}`
    );
  } else if (
    // Large alpha keys (like Numpad 0)
    colorways.alphaCodes[keycode]
  ) {
    classes.push(`${colorway.name}-key`);
  } else if (
    // Mod keys
    // colorways.modCodes[keycode] ||
    // (this.w <= KEY_WIDTH * 3 &&
    //   (this.w > KEY_WIDTH || this.h > KEY_HEIGHT))
    colorways.modCodes[keycode]
  ) {
    classes.push('mod');
    classes.push(`${colorway.name}-mod`);
  } else {
    // everything else
    classes.push(`${colorway.name}-key`);
  }

  return classes.join(' ')
}


const colorwayNames = colorways.list.map(c => {
  const display = c.name.split('-').map((n, i) => {
    return i === 0 ? n.toUpperCase() : n.replace(n.charAt(0), n.charAt(0).toUpperCase())
  }).join(' ')

  return {
    value: c.name,
    text: display
  }
})

function App() {
  const [keyboardNames, setKeyboardNames] = useState([])
  const [keyboard, setKeyboard] = useState({})
  const [keymaps, setKeymaps] = useState([])
  const [colorway, setColorway] = useState({})
  // const [modClw, setModClw] = useState("")

  useEffect(() => {
    fetch('http://localhost:3000/keyboards.json')
      .then(res => res.json())
      .then(res => {
        setKeyboardNames(res)
      })
  }, [])

  const selectBoard = (keyboard_name) => {
    fetch(`http://localhost:3000/keyboards/${keyboard_name.replace(/\//g, "_")}.json`)
      .then(res => res.json())
      .then(res => {
        setKeyboard(res)
        setKeymaps(res.layouts.default.layout)
      })
  }

  // const chooseLayout = (name) => {
  //   setKeymaps(keyboard.layouts[name].layout)
  // }

  const changeColorway = (name) => {
    const clw = colorways.list.find(c => c.name === name)
    setColorway(clw)
    // if (!modClw) {
    //   setModClw(name.toLowerCase().replace(/ /g, '-'))
    // }
  }
  const changeModColorway = (name) => {
    // setModClw(name.toLowerCase().replace(/ /g, '-'))
  }

  const maxWidth = keyboard.layouts
    ? max(keyboard.layouts.default.layout.map(k => k.x + (k.w || 1)))
    : 0
  const maxHeight = keyboard.layouts
    ? max(keyboard.layouts.default.layout.map(k => k.y + (k.h || 1)))
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
          {/* <Select style={{ width: 300 }} onSelect={chooseLayout}>
            {
              keyboard.layouts && Object.keys(keyboard.layouts).map(layout => {
                return <Option value={layout} key={layout}>{layout}</Option>
              })
            }
          </Select> */}
          <Select showSearch style={{ width: 300 }} onChange={changeColorway}>
            {
              colorwayNames.map(clw => {
                return <Option value={clw.value} key={clw.value}>{clw.text}</Option>
              })
            }
          </Select>
          <Select showSearch style={{ width: 300 }} onChange={changeModColorway}>
            {
              colorwayNames.map(clw => {
                return <Option value={clw.value} key={clw.value}>{clw.text}</Option>
              })
            }
          </Select>
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
          {keymaps.map((k, idx) => {
            return <div
              key={idx}
              id={idx}
              title={k.code}
              className={keyClasses(k.code, colorway)}
              key-code={k.code}
              style={{
                  borderRadius: `6px`,
                  boxShadow: `inset 0 -1px 0 3px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,.3)`,
                  borderLeft: `1px solid rgba(0,0,0,.1)`,
                  borderRight: `1px solid rgba(0,0,0,.1)`,
                  fontFamily: `Cascadia Code`,
                  fontSize: "small",
                  left: `${k.x * 60}px`,
                  top: `${k.y * 60}px`,
                  width: `${(k.w || 1) * 60 - 5}px`,
                  height: `${(k.h || 1) * 60 - 5}px`,
                  position: `absolute`,
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
