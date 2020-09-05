import React, { useState, useEffect } from 'react';
import { Card, Radio, Empty, Popover } from 'antd';
import { WarningFilled } from '@ant-design/icons';
import _ from 'lodash';
import Key from './Key';

// import scss variables
import gmkabs from '../scss/color/gmk-abs.scss'
import pantone from '../scss/color/pantone.scss'
import ral from '../scss/color/ral.scss'
import spabs from '../scss/color/sp-abs.scss'
import sppbt from '../scss/color/sp-pbt.scss'

import {
  Color,
  DirectionalLight,
  GammaEncoding,
  GridHelper,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  Texture,
  WebGLRenderer,
} from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import keycodes from './keycodes';
import keysets from './keysets';

const keycodeMap = _.keyBy(keycodes, 'code');

const colorCodeMap = {...gmkabs, ...pantone, ...ral, ...spabs, ...sppbt }

const keyWidth = 55;
const keySpacing = 4;
const keyboardBezel = 15;

let maxWidth, maxHeight;
let width, height;

const unit = 19;

const stlLoader = new STLLoader();
stlLoader.setPath('./models/')

const modelNames = {
  cherry: [
    'r1_100', 'r1_200', 'r2_100', 'r2_150', 'r2-3_200vert',
    'r3_100_bar', 'r3_100_sculpted', 'r3_100', 'r3_125', 'r3_150', 'r3_175_stepped', 'r3_175', 'r3_200', 'r3_225', 'r3_iso', 'r3-4_200vert',
    'r4_100', 'r4_125', 'r4_150', 'r4_175', 'r4_200', 'r4_225', 'r4_275', 'r4_600', 'r4_625', 'r4_700'
  ],
  dsa: ['1u', '1.25u', '1.5u', '1.75u', '2u', '2.25u', '2.75u', '6.25u', '7u'], // 7u using same model as 6.25u, since I dont have
  sa: [
    'r1_100', 'r1_125', 'r1_150', 'r1_175', 'r1_200', 'r1_225', 'r1_275', 'r2_100', 'r2_125', 'r2_150', 'r2_175', 'r2_200', 'r2_225', 'r2_275',
    'r3_100', 'r3_125', 'r3_150', 'r3_175', 'r3_200', 'r3_225', 'r3_275', 'r3_625', 'r3_700', 'r4_100', 'r4_125', 'r4_150', 'r4_175', 'r4_200', 'r4_225', 'r4_275'
  ]
}

let keycapModels = {
  cherry: {},
  dsa: {},
  sa: {},
}

Object.keys(keycapModels).forEach(profile => {
  modelNames[profile].forEach(name => {
    stlLoader.load(`${profile}/${name}.stl`, geometry => {
      keycapModels[profile][name] = geometry
    }, null, err => {
      console.log('3d model missing', `${profile}/${name}.stl`)
    })
  })
})

let camera, scene, renderer;
const obj = []

const rg = new RegExp(/[a-zA-Z0-9]/)

function init(keymaps, colorway, kit) {
  // clear old render material
  while (obj.length > 0) {
    scene.remove(obj.shift())
  }

  // prevent multiple render
  if (!renderer) {
    // camera
    const frustumSize = 150
    const aspect = width / height;
    camera = new OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000);
    camera.position.set(0, 20, 0);

    // scene and light
    scene = new Scene();
    scene.background = new Color(0xf0f0f0)
  
    scene.add(new HemisphereLight());

    const directionalLight = new DirectionalLight(0xffeedd);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // grid
    const plane = new GridHelper(1900, 100, 0x888888, 0x888888)
    plane.position.y = -20
    scene.add(plane)

    // renderer
    renderer = new WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    renderer.outputEncoding = GammaEncoding
    renderer.gammaFactor = 2.2
  
    const container = document.getElementById("keyboard-3d")
    container && container.appendChild(renderer.domElement)
  
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0.5, 0)
  }

  keymaps.layout.forEach((k) => {
    const key = {...k, ...keymaps.override && keymaps.override[k.code]}

    const { type, modifier } = keycodeMap[key.code] || {}
    const keyset = modifier ? colorway.mod : colorway[type || 'key']

    let colorCodes = keysets[keyset.name]
    if (colorCodes && colorCodes.kits && colorCodes.kits[kit]) {
      colorCodes = {...colorCodes, ...colorCodes.kits[kit]}
    }

    const codes = colorCodes ? colorCodes[(keyset.override && keyset.override[key.code]) || type || 'key'] : []
    const legend = keycodeMap[key.code] && keycodeMap[key.code].name
  
    let size = 125
    if (keycodeMap[key.code] && keycodeMap[key.code].name.length > 1) {
      if (rg.test(keycodeMap[key.code].name.charAt(0))) {
        size = 80
      }
    }

    // create keycap texture
    const canvas = document.createElement("canvas")
    canvas.height = 256
    canvas.width = 256

    const ctx = canvas.getContext("2d")
    ctx.fillStyle = colorCodeMap[codes[0]] || codes[0] || '#2e3b51'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = `bold ${size}px Montserrat`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = colorCodeMap[codes[1]] || codes[1] || '#22aabc'
    if (legend) {
      const lines = legend.split('\n')
      if (lines.length > 1) {
        lines.forEach((line, i) => {
          ctx.font = "bold 80px Montserrat"
          ctx.fillText(line.toUpperCase(), canvas.width / 2, canvas.height / 2 + (i - 0.5) * 110)
        })
      } else {
        ctx.fillText(legend.toUpperCase(), canvas.width / 2, canvas.height / 2)
      }
    }

    const texture = new Texture(canvas)
    texture.needsUpdate = true

    // Keycap model
    if (keyset.name.startsWith('gmk') || keyset.name.startsWith('jtk')) {
      keyset.profile = 'cherry'
      keyset.row = keyset.row || [1, 1, 2, 3, 4, 4]
    } else {
      keyset.profile = keyset.name.split('-')[0]
      keyset.row = keyset.row || [1, 1, 2, 3, 4, 3]
    }

    // Keycap model (fix below later, all key have to have row_idx)
    const rowIdx = keycodeMap[key.code] ? keycodeMap[key.code].row_idx : 0

    let modelName = 'r' + keyset.row[rowIdx] + `_${(key.w || 1) * (key.h || 1) * 100}`
    switch (keyset.profile) {
      case 'cherry':
        if (key.code === 'KC_PPLS') modelName = 'r2-3_200vert';
        if (key.code === 'KC_PENT') modelName = 'r3-4_200vert';
        break;
      case 'dsa':
        modelName = (key.w || 1) * (key.h || 1) + 'u'
        break;
      case 'sa':
        if (key.code === 'KC_PPLS') modelName = 'r2_200';
        if (key.code === 'KC_PENT') modelName = 'r3_200';
        break;
      default:
        break;
    }

    const geometry = keycapModels[keyset.profile][modelName]
    if (!geometry) {
      console.log(key.code, modelName)
      return
    }

    // apply texture on keycap
    const material = new MeshStandardMaterial({
      map: texture,
      metalness: 0.5,
      roughness: 0.6,
      color: colorCodeMap[codes[0]] || codes[0] || '#2e3b51',
    });

    const mesh = new Mesh(geometry.clone(), material);

    // allocate keycap and rotate if needed
    switch (keyset.profile) {
      case 'cherry':
        mesh.position.x = key.x * unit - maxWidth * unit / 2
        mesh.position.z = key.y * unit - maxHeight * unit / 2
        // if (key.code === 'KC_PPLS' || key.code === 'KC_PENT') {
        //   mesh.position.x += unit / 2
        // }
        break;
      case 'dsa':
        mesh.position.x = (key.x + (key.w || 1) / 2) * unit - maxWidth * unit / 2
        mesh.position.z = (key.y + (key.h || 1) / 2) * unit - maxHeight * unit / 2
        if (key.w === 1.75) {
          // keycap center not correct like other keys
          mesh.position.x += 1 * unit / 2
        }
        if (key.code === 'KC_PPLS' || key.code === 'KC_PENT') {
          mesh.rotateY(Math.PI / 2)
        }
        break;
      case 'sa':
        mesh.position.x = key.x * unit - maxWidth * unit / 2
        mesh.position.z = key.y * unit - maxHeight * unit / 2
        // rotate row 4 180 degree since it's using same models with row 2
        if (rowIdx === 4) {
          mesh.rotateY(Math.PI)
          mesh.position.x += unit
          mesh.position.z += unit
        }
        // rotate spaces
        if (key.code === 'KC_SPC') {
          mesh.rotateY(Math.PI / 2)
          mesh.position.z += unit
        }
        if (key.code === 'KC_PPLS' || key.code === 'KC_PENT') {
          mesh.rotateY(Math.PI / 2)
        }
        if (key.h >= 2) {
          mesh.position.x -= unit * 3 / 8
          mesh.position.z += unit * 2
        }
        if (key.w === 1.5) {
          mesh.position.z -= unit / 8
        }
        if (key.w === 1.75) {
          if (modelName.startsWith('r4')) {
            // because we rotated
            mesh.position.x += unit * 3 / 4
            mesh.position.z += unit / 4
          } else {
            mesh.position.z -= unit / 4
          }
        }
        if (key.w === 2) {
          mesh.position.z -= unit * 3 / 8
        }
        if (modelName === 'r4_225') {
          mesh.position.x += unit * 5 / 4
          mesh.position.z += unit / 2
        }
        if (modelName === 'r4_275') {
          mesh.position.x += unit * 7 / 4
          mesh.position.z += unit * 3 / 4
        }
        if (modelName === 'r3_225') {
          mesh.position.z -= unit / 2
        }
        break;
      default:
        break;
    }

    obj.push(mesh)
    scene.add(mesh)
  })
}

function animate() {
  requestAnimationFrame(animate);
  renderer && renderer.render(scene, camera);
}

function Keyboard({keyboard, caseColor, colorway, kit, keymaps, loading}) {
  const [renderMode, setRenderMode] = useState('2d')

  useEffect(() => {
    if (renderMode === '3d') render3DKeyboard(renderMode)
  }, [colorway]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setRenderMode('2d')
    renderer = undefined
  }, [keyboard])

  maxWidth = Array.isArray(keymaps.layout) && keymaps.layout.length
    ? _.max(keymaps.layout.map(k => k.x + (k.w || 1)))
    : 0
  maxHeight = Array.isArray(keymaps.layout) && keymaps.layout.length
    ? _.max(keymaps.layout.map(k => k.y + (k.h || 1)))
    : 0

  width = keyWidth * maxWidth + keyboardBezel * 2 - keySpacing
  height = keyWidth * maxHeight + keyboardBezel * 2 - keySpacing

  const only2D = colorway.key.name.startsWith('kat')

  const render3DKeyboard = (mode) => {
    setRenderMode(mode)

    const kb2d = document.getElementById("keyboard-2d")
    const kb3d = document.getElementById("keyboard-3d")

    if (mode === '3d') {
      init(keymaps, colorway, kit);
      animate();

      kb2d.classList.add("hidden")
      kb3d.classList.remove("hidden")
    } else {
      kb2d.classList.remove("hidden")
      kb3d.classList.add("hidden")
    }
  }

  return (
    <Card
      size="small"
      loading={loading}
      title="Keyboard"
      className="keyboard-box"
    >
      {keyboard && keyboard.keyboard_name
        ? (
          <>
            <Card className="display-center" bordered={false}>
              <Radio.Group
                disabled={!keyboard || !keyboard.keyboard_name}
                onChange={e => render3DKeyboard(e.target.value)}
                value={renderMode}
                key={renderMode}
                buttonStyle="solid"
                className="display-center"
              >
                <Radio.Button value={'2d'}>2D</Radio.Button>
                <Radio.Button value={'3d'} disabled={only2D}>
                  <Popover
                    placement="bottom"
                    content="This feature is being developed. It may cause your browser to be slow due to heavy load, so please consider before starting it."
                  >
                    <WarningFilled style={{ color: "orange" }} />
                  </Popover> 3D
                </Radio.Button>
              </Radio.Group>
            </Card>
            <Card id="keyboard-3d" className="display-center hidden" bordered={false}></Card>
            <Card
              id="keyboard-2d"
              style={{
                width,
                height,
                border: `${keyboardBezel}px solid ${caseColor}`,
                borderRadius: 6,
                backgroundColor: `${caseColor}`
              }}>
              {keymaps.layout.map((k, idx) => {
                const key = {...k, ...keymaps.override && keymaps.override[k.code]}

                return <Key key={idx} info={key} colorway={colorway} kit={kit} />
              })}
            </Card>
          </>
        )
        : <Empty
            image='./logo256.png'
            imageStyle={{ height: 'auto' }}
            description='No keyboard selected or missing info'
          />
      }
    </Card>
  )
}

export default Keyboard;
