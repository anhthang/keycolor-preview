import React, { useEffect, useState } from 'react';
import './App.scss';
import 'antd/dist/antd.css';

import * as fetch from 'node-fetch';
import { Select, Card, Cascader, Row, Col, Form, Checkbox, Empty } from 'antd';
import { SketchPicker } from 'react-color';
import BasicLayout, { PageContainer } from '@ant-design/pro-layout';
import { GithubOutlined } from '@ant-design/icons';

import Key from './components/Key';
// import RightHeader from './components/RightHeader';
import Footer from './components/Footer';
import _ from 'lodash';
import colorways from './components/colorways';

const defaultCaseColor = '#e0e0e0'

const { Option } = Select

const apiUrl = 'https://keycolor.xyz'

const keyWidth = 55
const keySpacing = 4
const keyboardBezel = 15

const colorwayNames = _(colorways.list)
  .groupBy(i => i.name.split('-')[0])
  .map((list, manufacturer) => {
    return {
      value: manufacturer,
      label: manufacturer.toUpperCase(),
      children: list.map(c => {
        const parts = c.name.split('-')
        parts.shift()
        const display = parts.map((n) => n.replace(n.charAt(0), n.charAt(0).toUpperCase())).join(' ')

        return {
          value: parts.join('-'),
          label: display,
          children: c.kits ? Object.keys(c.kits).map(k => ({ value: k, label: k.replace(k.charAt(0), k.charAt(0).toUpperCase()) })) : []
        }
      })
    }
  })
  .value()

function App() {
  const [keyboardNames, setKeyboardNames] = useState([])
  const [keyboard, setKeyboard] = useState({})
  const [caseColor, setCaseColor] = useState(null)
  const [keymaps, setKeymaps] = useState({ layout: [] })

  const randomKeyset = _.sample(colorways.list)
  const [colorway, setColorway] = useState({
    key: randomKeyset,
    mod: randomKeyset
  })

  const [kit, setKit] = useState(null)
  const [changeModifier, setChangeModifier] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${apiUrl}/keyboard_folders.json`)
      .then(res => res.json())
      .then(res => {
        const keyboards = _(res)
          .groupBy('manufacturer')
          .map((list, manufacturer) => {
            return {
              value: manufacturer,
              label: manufacturer,
              children: list.map(board => ({
                value: board.keyboard_folder,
                label: board.keyboard_name,
              }))
            }
          })
          .value()

        setKeyboardNames(keyboards)
      })
  }, [])

  const getLayout = (layout_name, additional) => {
    fetch(`${apiUrl}/layouts/${layout_name}.json`)
      .then(res => res.json())
      .then(res => {
        const kbLayout = {...res, ...additional}
        setKeymaps(kbLayout)
      })
  }

  const selectBoard = (keyboard_name) => {
    setLoading(true)
    fetch(`${apiUrl}/keyboards/${keyboard_name[1]}.json`)
      .then(res => res.json())
      .then(res => {
        setCaseColor((res.colors && res.colors[0].color) || defaultCaseColor)
        setKeyboard(res)

        const layout = Object.keys(res.layouts)[0]
        if (layout === 'default') {
          // make keyboards which still not change to new format working
          setKeymaps(res.layouts.default)
        } else {
          getLayout(layout, res.layouts[layout])
        }

        // fix bug color name has more than 2 words
        changeColorway(colorway.key.name.replace('-', '/').split('/'))
        setLoading(false)
      })
      .catch(err => {
        setLoading(false)
        setKeyboard({})
      })
  }

  const changeColorway = (name, isModifier) => {
    const base = name.slice(0, 2).join('-')
    const keyset = colorways.list.find(c => c.name === base)

    setColorway({
      key: isModifier ? colorway.key : keyset,
      mod: (isModifier || !changeModifier) ? keyset : colorway.mod
    })

    if (!isModifier) {
      setKit(name[2])
    }
  }

  const maxWidth = Array.isArray(keymaps.layout) && keymaps.layout.length
    ? _.max(keymaps.layout.map(k => k.x + (k.w || 1)))
    : 0
  const maxHeight = Array.isArray(keymaps.layout) && keymaps.layout.length
    ? _.max(keymaps.layout.map(k => k.y + (k.h || 1)))
    : 0

  return (
    <BasicLayout
      title="KeyColor Viewer"
      layout="top"
      logo={false}
      headerRender={false}
      footerRender={Footer}
      // rightContentRender={RightHeader}
    >
      <PageContainer
        style={{ minHeight: '100vh', margin: 24 }}
        extra={[
          <a key="github" href="https://github.com/anhthang/keycolor-viewer" target="blank" title="Github"><GithubOutlined style={{ fontSize: 32 }} /></a>
        ]}  
      >
        <Row gutter={16}>
          <Col md={5}>
            <Card className="keyboard-box" title="Options" size="small">
              <Form layout="vertical">
                <Form.Item label="Keyboard">
                  <Cascader showSearch options={keyboardNames} onChange={selectBoard} placeholder="Select Keyboard" />
                </Form.Item>
                {
                  Array.isArray(keyboard.colors) && keyboard.colors.length && (
                    <Form.Item label="Case Color">
                      <Select
                        showSearch
                        // disabled={!Array.isArray(keyboard.colors) || !keyboard.colors.length}
                        defaultValue={caseColor}
                        defaultActiveFirstOption
                        onSelect={(e) => setCaseColor(e)}
                        placeholder="Select Case Color">
                        {
                          (keyboard.colors || []).map(c => {
                            return <Option value={c.color} key={c.color}>{c.name}</Option>
                          })
                        }
                      </Select>
                    </Form.Item>
                  )
                }
                <Form.Item label="Customize Case Color">
                  <SketchPicker
                    color={caseColor || defaultCaseColor}
                    disableAlpha={true}
                    onChange={c => setCaseColor(c.hex)}
                  />
                </Form.Item>
                <Form.Item label="Keyset">
                  <Cascader
                    showSearch
                    defaultValue={colorway.key.name.replace('-', '/').split('/')}
                    options={colorwayNames}
                    onChange={e => changeColorway(e, false)}
                    placeholder="Select Colorway"
                  />
                </Form.Item>
                <Form.Item>
                  <Checkbox defaultChecked={false} onChange={(e) => {
                    setChangeModifier(e.target.checked)
                    if (!e.target.checked) {
                      setColorway({
                        key: colorway.key,
                        mod: colorway.key
                      })
                    }
                  }}>Change Modifier Colorway</Checkbox>
                </Form.Item>
                {
                  changeModifier && (
                    <Form.Item label="Modifier Colorway">
                      <Cascader
                        showSearch
                        options={colorwayNames}
                        placeholder="Select Modifier Colorway"
                        onChange={e => changeColorway(e, true)}
                      />
                    </Form.Item>
                  )
                }
              </Form>
            </Card>
          </Col>
          <Col md={19}>
            <Card
              size="small"
              loading={loading}
              title="Keyboard"
              className="keyboard-box"
            >
              {keyboard && keyboard.keyboard_name
                ? <Card
                  className="keyboard-drawer"
                  style={{
                    width: keyWidth * maxWidth + keyboardBezel * 2 - keySpacing,
                    height: keyWidth * maxHeight + keyboardBezel * 2 - keySpacing,
                    border: `${keyboardBezel}px solid ${caseColor}`,
                    borderRadius: 6,
                    backgroundColor: `${caseColor}`
                  }}>
                  {keymaps.layout.map((k, idx) => {
                    const key = {...k, ...keymaps.override && keymaps.override[k.code]}

                    return <Key key={idx} info={key} colorway={colorway} kit={kit} />
                  })}
                </Card>
                : <Empty
                    image='./logo256.png'
                    imageStyle={{ height: 'auto'}}
                    description='No keyboard selected or missing info'
                  />
              }
            </Card>
          </Col>
        </Row>
        
      </PageContainer>
    </BasicLayout>
  )
}

export default App;
