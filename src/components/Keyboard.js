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
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import keycodes from './keycodes';
import keysets from './keysets';

const keycodeMap = _.keyBy(keycodes, 'code');

const colorCodeMap = {...gmkabs, ...pantone, ...ral, ...spabs, ...sppbt }

const keyWidth = 55;
const keySpacing = 4;
const keyboardBezel = 15;

const stlLoader = new STLLoader();
stlLoader.setPath('./models/')

// let pcb
// stlLoader.load('pcb.stl', stl => {
//   pcb = stl
// })

const tdsLoader = new TDSLoader();
tdsLoader.setPath('./models/')

const keycapModels = {
  'DSA': 'dsa.3ds',
  'XDA': 'xda.3ds',
  // 'SA R1': 'sa-1u-r1.stl',
  // 'SA R2': 'sa-1u-r2.stl',
  // 'SA R3': 'sa-1u-r3.3ds',
  // 'SA R4': 'sa-1u-r4.stl',
  // 'SA SPACE': 'sa-7u-space.stl',
  // 'Cherry R1': 'cherry-r1.stl',
  // 'Cherry R2': 'cherry-r2.stl',
  // 'Cherry R3': 'cherry-r3.stl',
  // 'Cherry R4': 'cherry-r4.stl',
  // 'Cherry SPACE': 'cherry-space.stl'
}

Object.keys(keycapModels).forEach(kc => {
  tdsLoader.load(keycapModels[kc], obj => {
    obj.traverse(function (child) {
      if (child instanceof Mesh) {
        child.geometry.computeBoundingBox()
      }
    })

    keycapModels[kc] = obj
  })
})

const centerX = ({w = 1, h = 1, z = 0, x = 0, y = 0}) => {
  return x + Math.cos(z) * w / 2 - Math.sin(z) * h / 2
}

const centerY = ({w = 1, h = 1, z = 0, x = 0, y = 0}) => {
  return y + Math.sin(z) * w / 2 + Math.cos(z) * h / 2
}

const scaleW = ({w = 1, h = 1, z = 0, x = 0, y = 0}) => {
  return w * 19 / 18.5 - 1 / 18.5
}

const scaleH = ({w = 1, h = 1, z = 0, x = 0, y = 0}) => {
  return h * 19 / 18.5 - 1 / 18.5
}

const width = 1153.5;
const height = 383.5;
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
    var frustumSize = 150
    var aspect = width / height;
    camera = new OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000);
    camera.position.set(0, 200, 0);

    // scene and light
    scene = new Scene();
    scene.background = new Color(0xf0f0f0)
  
    scene.add(new HemisphereLight());

    var directionalLight = new DirectionalLight(0xffeedd);
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
  
    var controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0.5, 0)
  }

  keymaps.layout.forEach((k) => {
    const key = {...k, ...keymaps.override && keymaps.override[k.code]}

    const { type, modifier } = keycodeMap[key.code] || {}
    const keyset = modifier ? colorway.mod : colorway[type || 'key']

    const codes = keysets[keyset.name] ? keysets[keyset.name][(keyset.override && keyset.override[key.code]) || type || 'key'] : []
    const legend = keycodeMap[key.code] && keycodeMap[key.code].name
  
    let size = 125
    if (keycodeMap[key.code] && keycodeMap[key.code].name.length > 1) {
      if (rg.test(keycodeMap[key.code].name.charAt(0))) {
        size = 80
      }
    }

    // create keycap texture
    var canvas = document.createElement("canvas")
    canvas.height = 256
    canvas.width = 256

    var context = canvas.getContext("2d")
    context.fillStyle = colorCodeMap[codes[0]] || codes[0] || '#2e3b51'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.font = `bold ${size}px Montserrat`
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillStyle = colorCodeMap[codes[1]] || codes[1] || '#22aabc'
    if (legend) {
      const lines = legend.split('\n')
      if (lines.length > 1) {
        lines.forEach((line, i) => {
          context.font = "bold 80px Montserrat"
          context.fillText(line.toUpperCase(), canvas.width / 2, canvas.height / 2 + (i - 0.5) * 110)
        })
      } else {
        context.fillText(legend.toUpperCase(), canvas.width / 2, canvas.height / 2)
      }
    }

    var texture = new Texture(canvas)
    texture.needsUpdate = true

    // Keycap model
    var geometry = keycapModels["DSA"]
    var kc = geometry.clone()

    // apply texture on keycap
    var material = new MeshStandardMaterial({
      map : texture, 
      metalness: 0.5, 
      roughness: 0.6,
    })
    kc.traverse(function(child) {
      if (child instanceof Mesh) {
        child.material = material
      }
    })

    // allocate keycap
    kc.position.x = centerX(key) * 19 - width/6
    kc.position.z = centerY(key) * 19 - height/6
    kc.scale.x = scaleW(key)
    kc.scale.z = scaleH(key)
    // kc.rotation.y = -key.z // if dont have z, have to comment, or maybe find another way
    obj.push(kc)
    scene.add(kc)

    // var pcbMmaterial = new MeshStandardMaterial({color: 0x533d45, metalness: 0.5, roughness: 0.7})
    // var pcb1 = new Mesh(pcb, pcbMmaterial)
    // var sx = (key.w || 1) * 19 / 23 + 4 / 23
    // var sz = (key.h || 1) * 19 / 23 + 4 / 23
    // pcb1.position.x = centerX(key) * 19 - width/6
    // pcb1.position.y = -7
    // pcb1.position.z = centerY(key) * 19 - height/6
    // pcb1.scale.x = sx
    // pcb1.scale.z = sz
    // // pcb1.rotation.y = -key.z // if dont have z, have to comment, or maybe find another way
    // obj.push(pcb1)
    // scene.add(pcb1)
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
  }, [colorway])

  useEffect(() => {
    setRenderMode('2d')
    renderer = undefined
  }, [keyboard])

  const maxWidth = Array.isArray(keymaps.layout) && keymaps.layout.length
    ? _.max(keymaps.layout.map(k => k.x + (k.w || 1)))
    : 0
  const maxHeight = Array.isArray(keymaps.layout) && keymaps.layout.length
    ? _.max(keymaps.layout.map(k => k.y + (k.h || 1)))
    : 0

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
                <Radio.Button value={'3d'}>
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
