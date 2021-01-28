import React from 'react'

export const Image = ({ src, ...imgProps }) => (
  <img src={browser.runtime.getURL(src)} {...imgProps} />
)
