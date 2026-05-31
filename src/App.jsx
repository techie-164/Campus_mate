import React from 'react'
import backgroundImage from './assets/bg.png'
import Sidebar from './components/Sidebar'
import { useState } from 'react'
import './App.css'

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
        {!isSidebarOpen && (
          <button
            className="toggle"
            style={{ left: '20px' }}
            onClick={() => setIsSidebarOpen(true)}>
            ⚡
          </button>
        )}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  )
}

export default App
