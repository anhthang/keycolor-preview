import React from 'react';
import Icon from '@ant-design/icons';

const GitSvg = () => (
  <svg
    data-icon="line"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 1024 1024"
  >
    <path fill="#F05133" d="M110.933333 451.84L357.546667 204.8l72.106666 72.533333c-10.24 36.266667 6.4 75.946667 39.68 95.146667v236.373333c-25.6 14.506667-42.666667 42.24-42.666666 73.813334a85.333333 85.333333 0 0 0 85.333333 85.333333 85.333333 85.333333 0 0 0 85.333333-85.333333c0-31.573333-17.066667-59.306667-42.666666-73.813334V401.493333l88.32 89.173334c-2.986667 6.4-2.986667 13.653333-2.986667 21.333333a85.333333 85.333333 0 0 0 85.333333 85.333333 85.333333 85.333333 0 0 0 85.333334-85.333333 85.333333 85.333333 0 0 0-85.333334-85.333333c-7.68 0-14.933333 0-21.333333 2.986666L594.346667 320a84.48 84.48 0 0 0-49.066667-99.84c-18.346667-6.826667-37.546667-8.533333-54.613333-3.84L418.133333 144.213333l33.706667-33.28c33.28-33.706667 87.04-33.706667 120.32 0l340.906667 340.906667c33.706667 33.28 33.706667 87.04 0 120.32l-340.906667 340.906667c-33.28 33.706667-87.04 33.706667-120.32 0L110.933333 572.16c-33.706667-33.28-33.706667-87.04 0-120.32z"></path>
  </svg>
)

const GitIcon = props => <Icon component={GitSvg} {...props} />;

export default {
  name: 'sa-oblivion',
  kits: {
    oblivion: {},
    hagoromo: {}
  },
  override: {
    // KC_ESC: 'accent',
    KC_ENT: 'accent',
    KC_PENT: 'accent'
  },
  icon: {
    KC_ESC: <GitIcon style={{ fontSize: 36 }} />
  }
};