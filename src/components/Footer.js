import React from 'react';
import { DefaultFooter } from '@ant-design/pro-layout';
import { GithubOutlined } from '@ant-design/icons';

function Footer() {
  return <DefaultFooter
    className="footer"
    copyright="2020 - Hosted on Github Pages"
    links={[
      {
        key: 'GitHub',
        title: <GithubOutlined style={{ fontSize: 32 }} />,
        href: 'https://github.com/anhthang/keycolor-viewer',
        blankTarget: true,
      },
    ]}
  />
}

export default Footer;