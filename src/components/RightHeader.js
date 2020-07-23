import React from 'react';

function RightHeader() {
  return <div style={{
    float: 'right',
    height: '100%',
    overflow: 'hidden',
    marginRight: 24
  }}>
    <a href={process.env.REACT_APP_REPO}>Github</a>
  </div>
}

export default RightHeader;