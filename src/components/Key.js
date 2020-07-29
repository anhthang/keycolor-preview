import React from 'react';
import _ from 'lodash';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  AppleFilled,
  WindowsFilled,
  QqOutlined
} from '@ant-design/icons';

import keycodes from './keycodes';

function platformIcons(platform) {
  let icon;
  switch (platform) {
    case 'MacIntel':
    case 'Macintosh':
    case 'MacPPC':
    case 'iPhone':
    case 'iPad':
      icon = <AppleFilled style={{ fontSize: 20 }} />;
      break;
    case 'Linux i686':
    case 'Linux x86_64':
    case 'Linux armv7l':
      icon = <QqOutlined style={{ fontSize: 20 }} />;
      break;
    case 'Win32':
      icon = <WindowsFilled style={{ fontSize: 20 }} />;
      break;
    default:
      // fall back to text if we can't detect
      icon = undefined;
  }
  return {
    KC_LGUI: icon,
    KC_RGUI: icon
  };
}

const iconCodes = {
  KC_UP: <ArrowUpOutlined style={{ fontSize: 16 }} />,
  KC_DOWN: <ArrowDownOutlined style={{ fontSize: 16 }} />,
  KC_LEFT: <ArrowLeftOutlined style={{ fontSize: 16 }} />,
  KC_RGHT: <ArrowRightOutlined style={{ fontSize: 16 }} />,
  ...platformIcons(window.navigator.platform)
};

const platformCodes = ['KC_LGUI', 'KC_RGUI'];
const keycodeMap = _.keyBy(keycodes, 'code');

const rg = new RegExp(/[a-zA-Z0-9]/)
const keyWidth = 55
const keySpacing = 4

function keyClasses(key, keyset, kit) {
  const classes = ['key']

  if (keyset && keyset.name) {
    classes.push(keyset.name.split('-')[0])
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
  if (platformCodes.includes(key.code)) {
    classes.push('icon-key')
  }
  if (key.display === false) {
    classes.push('hidden-key')
  }
  if (keyset.override && keyset.override[key.code]) {
    // Colorway specific overrides by keycode
    classes.push(
      `${keyset.name}-${keyset.override[key.code]}`
    );
  } else if (keycodeMap[key.code]) {
    // everything else
    classes.push(`${keyset.name}-${keycodeMap[key.code].type}`);
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
  const { type, modifier } = keycodeMap[info.code] || {}
  const keyset = modifier ? colorway.mod : colorway[type || 'key']

  return <div
    id={info.code}
    title={info.code}
    className={keyClasses(info, keyset, kit)}
    key-code={info.code}
    style={{
      left: `${info.x * keyWidth}px`,
      top: `${info.y * keyWidth}px`,
      width: `${(info.w || 1) * keyWidth - keySpacing}px`,
      height: `${(info.h || 1) * keyWidth - keySpacing}px`,
      ...info.z && { transform: `rotateZ(${info.z || 0}deg)` }
    }}
    >
    {iconCodes[info.code] || (keyset && keyset.icon && keyset.icon[info.code]) || getDisplayText(info.code, keyset.kits && keyset.kits[kit])}
  </div>
}

export default Key;