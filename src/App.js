import React, { useEffect, useState } from 'react';
// import logo from './logo.svg';
import './App.css';
import * as fetch from 'node-fetch';
import { Select } from 'antd';
import 'antd/dist/antd.css';
// import '../src/scss/sp-abs.scss';
import './colorway.css';

const { Option } = Select

const colorways = ['SA Carbon', 'GMK 8008', 'GMK Bento', 'SA Vilebloom']

function App() {
  const [keyboardNames, setKeyboardNames] = useState([])
  const [layoutNames, setLayoutNames] = useState([])
  const [layouts, setLayouts] = useState({})
  const [keymaps, setKeymaps] = useState([])
  const [width, setWidth] = useState(0)
  const [colorway, setColorway] = useState("gmk carbon")
  useEffect(() => {
    fetch('https://api.qmk.fm/v1/keyboards')
      .then(res => res.json())
      .then(res => {
        setKeyboardNames(res)
      })
  }, [])

  const selectBoard = (keyboard_name) => {
    fetch(`https://api.qmk.fm/v1/keyboards/${keyboard_name}`)
      .then(res => res.json())
      .then(res => {
        setLayoutNames(Object.keys(res.keyboards[keyboard_name].layouts))
        setLayouts(res.keyboards[keyboard_name].layouts)
        setWidth(res.keyboards[keyboard_name].width)
      })
  }

  const chooseLayout = (name) => {
    setKeymaps(layouts[name].layout)
  }

  const changeColorway = (name) => {
    setColorway(name.toLowerCase().replace(' ', '-') + '-key')
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
            layoutNames.map(layout => {
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

        <div style={{position: 'relative', width: 60 * width }}>
          {keymaps.map((k, idx) => {
            return <div
              key={idx}
              id={idx}
              title={k.label}
              className={colorway}
              style={{
                  borderRadius: `6px`,
                  boxShadow: `inset 0 -1px 0 3px rgba(0,0,0,.1), 0 0 0 1px rgba(0,0,0,.3)`,
                  borderLeft: `1px solid rgba(0,0,0,.1)`,
                  borderRight: `1px solid rgba(0,0,0,.1)`,
                  fontFamily: `Cascadia Code`,
                  fontSize: "small",
                  left: `${k.x * 60}px`,
                  top: `${k.y * 60}px`,
                  width: `${(k.w || 1) * 60}px`,
                  height: `${(k.h || 1) * 60}px`,
                  position: `absolute`,
                  marginRight: `5px`,
                  marginBottom: `5px`
              }}
              >
              {k.label}
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
