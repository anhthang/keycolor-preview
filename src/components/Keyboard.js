import React, { useState } from 'react';
import { Card, Radio, Empty } from 'antd';
import _ from 'lodash';
import Key from './Key';

import {
  Scene,
  Mesh,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  AmbientLight,
  PointLight,
  GridHelper,
  MeshStandardMaterial,
  Texture,
  GammaEncoding
} from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { TDSLoader } from 'three/examples/jsm/loaders/TDSLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import keycodes from './keycodes';
const keycodeMap = _.keyBy(keycodes, 'code');

const keyWidth = 55;
const keySpacing = 4;
const keyboardBezel = 15;

const stlLoader = new STLLoader();
stlLoader.setPath('./models/')

let pcb
stlLoader.load('pcb.stl', stl => {
  pcb = stl
})

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

const width = 960;
const height = 540;
let camera, scene, renderer;
const obj = []

function init(keymaps, colorway, kit) {
  // clear old render material
  while (obj.length > 0) {
    scene.remove(obj.shift())
  }

  if (!renderer) {
    // prevent multiple render
    camera = new PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 600, 0);
    
    scene = new Scene();
  
    renderer = new WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    renderer.outputEncoding = GammaEncoding
    renderer.gammaFactor = 2.2
  
    const container = document.getElementById("keyboard-3d")
    container && container.appendChild(renderer.domElement)
  
    var controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0.5, 0)
  
    scene.background = new Color(0xf0f0f0)
  
    scene.add(new AmbientLight(0x404040))
    const pointLight = new PointLight(0xffffff, 1)
    pointLight.position.set(100, 2000, 300)
    scene.add(pointLight)        
  
    const plane = new GridHelper(1900, 100, 0x888888, 0x888888)
    plane.position.y = -20
    scene.add(plane)
  }

  keymaps.layout.forEach((k) => {
    const key = {...k, ...keymaps.override && keymaps.override[k.code]}

    const { type, modifier } = keycodeMap[key.code] || {}
    const keyset = modifier ? colorway.mod : colorway[type || 'key']

    const colorCodes = keyset.color_codes ? keyset.color_codes[type === 'key' ? 'alpha' : 'mod'] : []

    // create keycap texture
    var canvas = document.createElement("canvas")
    canvas.height = 256
    canvas.width = 256
    var context = canvas.getContext("2d")
    // var size = 15 * key.f
    var size = 15 * 3
    context.fillStyle = colorCodes[0] || '#2e3b51'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.font = size + "px Montserrat"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillStyle = colorCodes[1] || '#22aabc'
    context.fillText(key.code, canvas.width / 2, canvas.height / 2)
    var texture = new Texture(canvas)
    // texture.offset = new THREE.Vector2(0.5, 0.5)
    texture.needsUpdate = true

    // Keycap model
    var geometry = keycapModels["DSA"]
    var kc = geometry.clone()

    // apply texture on keycap
    var material = new MeshStandardMaterial({
      map : texture, 
      metalness: 0.5, 
      roughness: 0.6
    })
    kc.traverse(function(child) {
      if (child instanceof Mesh) {
        child.material = material
      }
    })

    // allocate keycap
    kc.position.x = centerX(key) * 19
    kc.position.z = centerY(key) * 19
    kc.scale.x = scaleW(key)
    kc.scale.z = scaleH(key)
    // kc.rotation.y = -key.z // if dont have z, have to comment, or maybe find another way
    obj.push(kc)
    scene.add(kc)

    var pcbMmaterial = new MeshStandardMaterial({color: 0x533d45, metalness: 0.5, roughness: 0.7})
    var pcb1 = new Mesh(pcb, pcbMmaterial)
    var sx = (key.w || 1) * 19 / 23 + 4 / 23
    var sz = (key.h || 1) * 19 / 23 + 4 / 23
    pcb1.position.x = centerX(key) * 19
    pcb1.position.y = -7
    pcb1.position.z = centerY(key) * 19
    pcb1.scale.x = sx
    pcb1.scale.z = sz
    // pcb1.rotation.y = -key.z // if dont have z, have to comment, or maybe find another way
    obj.push(pcb1)
    scene.add(pcb1)
  })
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function Keyboard({keyboard, caseColor, colorway, kit, keymaps, loading}) {
  const [renderMode, setRenderMode] = useState('2d')

  const maxWidth = Array.isArray(keymaps.layout) && keymaps.layout.length
    ? _.max(keymaps.layout.map(k => k.x + (k.w || 1)))
    : 0
  const maxHeight = Array.isArray(keymaps.layout) && keymaps.layout.length
    ? _.max(keymaps.layout.map(k => k.y + (k.h || 1)))
    : 0

  const render3DKeyboard = (mode) => {
    setRenderMode(mode)

    const kb2d = document.getElementById("keyboard-drawer")
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
      extra={[
        <Radio.Group disabled={!keyboard || !keyboard.keyboard_name} onChange={e => render3DKeyboard(e.target.value)} value={renderMode} key={renderMode}>
          <Radio value={'2d'}>2D</Radio>
          <Radio value={'3d'}>3D (WIP)</Radio>
        </Radio.Group>
      ]}
    >
      <div id="keyboard-3d"></div>
      {keyboard && keyboard.keyboard_name
        ? <Card
          id="keyboard-drawer"
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
            imageStyle={{ height: 'auto' }}
            description='No keyboard selected or missing info'
          />
      }
    </Card>
  )
}

export default Keyboard;
