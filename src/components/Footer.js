import React from 'react';
import { DefaultFooter } from '@ant-design/pro-layout';
import { GithubOutlined } from '@ant-design/icons';

function Footer() {
  return <DefaultFooter
    style={{
      padding: '0px 24px 24px',
      textAlign: 'center'
    }}
    copyright="2020 - Hosted on Github Pages"
    links={[
      {
        key: 'GitHub',
        title: <GithubOutlined style={{ fontSize: 32 }} />,
        href: 'https://github.com/anhthang/keyboard-colorway-editor',
        blankTarget: true,
      },
    ]}
  />
}

export default Footer;