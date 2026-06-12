import React from 'react'
import { useNavigate } from 'react-router-dom'

function Sidebar({isOpen, onClose}){
    const navigate = useNavigate()

    const goTo = (path) => {
        navigate(path)
        onClose()
    }

    return (
        <aside className={"sidebar" + (isOpen ? " open" : "") }>
            <div className="sidebar-header">
                <div className="sidebar-title">
                <button className="sidebar-badge" type="button" onClick={onClose} aria-label="Close menu">⚡</button>
                <div>
                    <span className="sidebar-label">Menu</span>
                    <div className="sidebar-divider" />
                </div>
            </div>
        </div>

            <button className="sidebar-item" type="button" onClick={() => goTo('/tasks')}>
                <span className="sidebar-item-icon">📅</span>
                Events & Tasks
            </button>
            <button className="sidebar-item" type="button" onClick={() => goTo('/projects')}>
                <span className="sidebar-item-icon">🤝</span>
                Projects & Collaborations
            </button>
            <button className="sidebar-item" type="button" onClick={() => goTo('/scribble')}>
                <span className="sidebar-item-icon">📝</span>
                Scribble Pad
            </button>
            <button className="sidebar-item" type="button" onClick={() => goTo('/attendance')}>
                <span className="sidebar-item-icon">📋</span>
                Attendance
            </button>
        </aside>
    )
}

export default Sidebar
