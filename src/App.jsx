import React from 'react'
import backgroundImage from './assets/bg.png'

function App() {

  return (
    <div
      style = {{
        backgroundImage:`url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        color: 'white',
      }}>
        <h1>Campus Mate</h1>
    </div>
  )
}

export default App
