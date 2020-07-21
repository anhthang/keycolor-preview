import React from 'react';
import _ from 'lodash';
import keycodes from './keycodes';

// let substitute = Object.assign(
//   {},
//   colorways.iconCodes,
//   colorways.platformIcons(window.navigator.platform)
// );

const keycodeMap = _.keyBy(keycodes, 'code')

const rg = new RegExp(/[a-zA-Z0-9]/)
const keyWidth = 55
const keySpacing = 4

function keyClasses(key, colorway, kit) {
  const classes = ['key']

  if (colorway && colorway.name) {
    classes.push(colorway.name.split('-')[0])
  }
  if (kit) {
    classes.push(kit)
  }
  if (keycodeMap[key.code] && keycodeMap[key.code].name.length > 1) {
    if (rg.test(keycodeMap[key.code].name.charAt(0))) {
      classes.push('smaller')
    } else {
      classes.push('special-chars')
    }
  }
  if (key.display === false) {
    classes.push('hidden-key')
  }
  if (colorway.override && colorway.override[key.code]) {
    // Colorway specific overrides by keycode
    classes.push(
      `${colorway.name}-${colorway.override[key.code]}`
    );
  } else if (keycodeMap[key.code]) {
    // everything else
    classes.push(`${colorway.name}-${keycodeMap[key.code].type}`);
  } else {
    // keycode dont have any mapping
    console.log('missing key', key.code)
  }

  return classes.join(' ')
}

function getDisplayText(code, bilingual = {}) {
  let tl = keycodeMap[code] && keycodeMap[code].name

  const sub = []
  Object.keys(bilingual).forEach(position => {
    switch (position) {
      case 'TL':
        tl = (keycodeMap[code] && keycodeMap[code][bilingual[position]]) || tl
        break;
      default:
        sub.push({
          className: `bilingual-${position}`,
          text: keycodeMap[code] && keycodeMap[code][bilingual[position]]
        })
        break;
    }
  })

  return sub.length
    ? (
      <>
        {tl}
        {sub.map(p => (<div key={p.className} className={p.className}>{p.text}</div>))}
      </>
    )
    : tl
}

function Key({info, colorway, kit}) {
  return <div
    id={info.code}
    title={info.code}
    className={keyClasses(info, colorway, kit)}
    key-code={info.code}
    style={{
      left: `${info.x * keyWidth}px`,
      top: `${info.y * keyWidth}px`,
      width: `${(info.w || 1) * keyWidth - keySpacing}px`,
      height: `${(info.h || 1) * keyWidth - keySpacing}px`,
      ...info.z && { transform: `rotateZ(${info.z || 0}deg)` }
    }}
    >
    {getDisplayText(info.code, colorway.kits && colorway.kits[kit])}
  </div>
}

export default Key;