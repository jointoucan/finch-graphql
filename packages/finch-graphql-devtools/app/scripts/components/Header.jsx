import React from 'react'
import { Image } from './Image';
export const Header = () => {
  return (
    <header className="finch-header topBar">
      <Image className="finch-logo" src="images/finch-graphql.svg" alt="Finch Logo" width="65.304px" height="40px" />
      <div className="title"><span>Graph<em>i</em>QL</span></div>
    </header>
  )
}
//1.6326530612 