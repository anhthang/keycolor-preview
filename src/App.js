import React, { useEffect, useState } from 'react';
// import logo from './logo.svg';
import './App.css';
import * as fetch from 'node-fetch';
import { Select } from 'antd';
import keyBy from 'lodash.keyby';
import keycodes from './keycodes';

import 'antd/dist/antd.css';
import './colorway.css';
// import alphaCodes from './key_alpha.json';
import modCodes from './key_mod.json';
import override from './override.json';

const keycodeMap = keyBy(keycodes, 'code')

const { Option } = Select

const colorways = ['SA Carbon', 'GMK 8008', 'GMK Bento', 'SA Vilebloom']

function App() {
  const [keyboardNames, setKeyboardNames] = useState([])
  const [keyboard, setKeyboard] = useState({})
  const [keymaps, setKeymaps] = useState([])
  const [clw, setClw] = useState("gmk carbon")
  const [modClw, setModClw] = useState("")

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
      })
  }

  const chooseLayout = (name) => {
    setKeymaps(keyboard.layouts[name].layout)
  }

  const changeColorway = (name) => {
    setClw(name.toLowerCase().replace(' ', '-'))
    if (!modClw) {
      setModClw(name.toLowerCase().replace(' ', '-'))
    }
  }
  const changeModColorway = (name) => {
    setModClw(name.toLowerCase().replace(' ', '-'))
  }

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <Select showSearch style={{ width: 300 }} onSelect={(e) => selectBoard(e)}>
          {
            keyboardNames.map(keyboard => {
              return <Option value={keyboard} key={keyboard}>{keyboard}</Option>
            })
          }
        </Select>
        <Select style={{ width: 300 }} onSelect={chooseLayout}>
          {
            keyboard.layouts && Object.keys(keyboard.layouts).map(layout => {
              return <Option value={layout} key={layout}>{layout}</Option>
            })
          }
        </Select>
        <Select style={{ width: 300 }} onChange={changeColorway}>
          {
            colorways.map(clw => {
              return <Option value={clw} key={clw}>{clw}</Option>
            })
          }
        </Select>
        <Select style={{ width: 300 }} onChange={changeModColorway}>
          {
            colorways.map(clw => {
              return <Option value={clw} key={clw}>{clw}</Option>
            })
          }
        </Select>
        {/* <Checkbox checked={false} onClick={() => alert("fuck")}>Different Modifiers Colorway</Checkbox> */}
        <div style={{
          position: 'relative',
          width: 60 * (keyboard.width + 1),
          height: 60 * (keyboard.height - 1),
          whiteSpace: 'pre-line',
          // border: '1px solid white'
        }}>
          {keymaps.map((k, idx) => {
            let suffix
            if (override[clw] && override[clw][k.code]) {
              suffix = override[clw][k.code]
            } else if (modCodes.includes(k.code)) {
              suffix = 'mod'
            } else {
              suffix = 'key'
            }

            let className = modCodes.includes(k.code)
              ? `${modClw}-${suffix}`
              : `${clw}-${suffix}`

            return <div
              key={idx}
              id={idx}
              title={k.code}
              className={className}
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
                  height: `${(k.h || 1) * 55}px`,
                  position: `absolute`,
                  marginRight: `5px`,
                  marginBottom: `5px`,
                  transform: `rotateZ(${k.z || 0}deg)`
              }}
              >
              {keycodeMap[k.code] && keycodeMap[k.code].name}
            </div>
          })}
          {/* <Image /> */}
        </div>
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
