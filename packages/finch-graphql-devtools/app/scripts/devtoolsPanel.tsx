import React from 'react'
import ReactDOM from 'react-dom'
import { DevtoolsApp } from './components/DevtoolsApp'
import { DevtoolsTheme } from './components/DevtoolsTheme'

ReactDOM.render(
  <DevtoolsTheme>
    <DevtoolsApp />
  </DevtoolsTheme>,
  document.getElementById('root'),
)
