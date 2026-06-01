import React from 'react'
import { useNavigate } from 'react-router-dom'

function Sidebar({isOpen, onClose}){
    const navigate = useNavigate()

    return (
        <aside className={"sidebar" + (isOpen ? " open" : "") }>
            <div className="sidebar-header">
                <div className="sidebar-title">
                <button className="sidebar-badge" onClick={onClose}>⚡</button>
                <div>
                    <span className="sidebar-label">Menu</span>
                    <div className="sidebar-divider" />
                </div>
            </div>
        </div>

            <button className="sidebar-item">
                <span className="sidebar-item-icon">📅</span>
                Events & Tasks
            </button>
            <button className="sidebar-item">
                <span className="sidebar-item-icon">👥</span>
                Attendance
            </button>
            <button className="sidebar-item">
                <span className="sidebar-item-icon">🤝</span>
                Projects & Collaborations
            </button>
            <button className="sidebar-item" onClick={() => navigate('/scribble')}>
                <span className="sidebar-item-icon">📝</span>
                Scribble Pad
            </button>
        </aside>
    )
}

export default Sidebar