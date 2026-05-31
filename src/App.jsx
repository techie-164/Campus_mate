import React from 'react'
import backgroundImage from './assets/bg.png'
import Sidebar from './components/Sidebar'
import { useState } from 'react'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <h1 style={{
          justifyContent: 'center',
          display: 'flex',
          fontSize: '3rem',
          fontWeight: 'bold',
        }}>Campus Mate</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}> 🗲
        </button>
        <Sidebar isOpen={isSidebarOpen} />
    </div>
  )
}

export default App
