import React, { useState } from 'react';
import './Scribble.css';
import backgroundImage from '../assets/bg.png';
import Topbar from '../Topbar';
import Sidebar from '../components/Sidebar';

function Scribble(){
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div
            className="scribble"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
            {!isSidebarOpen && (
                <button
                    className="toggle"
                    style={{ left: '20px' }}
                    onClick={() => setIsSidebarOpen(true)}>
                    ⚡
                </button>
            )}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <Topbar />
            <div className="scribble-content">
                <h1>Scribble Pad</h1>
            </div>
        </div>
    )
}

export default Scribble;