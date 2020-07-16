import React from 'react';
import _ from 'lodash';
import keycodes from '../keycodes';
import colorways from './colorways';

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
  } else if (
    // Large alpha keys (like Numpad 0)
    colorways.alphaCodes[key.code]
  ) {
    classes.push(`${colorway.name}-key`);
  } else if (
    // Mod keys
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
    {keycodeMap[info.code] && keycodeMap[info.code].name}
    {Array.isArray(colorway.bilingual) && colorway.bilingual.length && <div className="bilingual">{keycodeMap[info.code] && keycodeMap[info.code][colorway.bilingual[0]]}</div>}
  </div>
}

export default Key;