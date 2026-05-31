import React from 'react'

function Sidebar({isOpen, onClose}){
    return (
        <div
        style={{
                display: "flex",
                flexDirection: "column",
                width: "250px",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.85)",
                backdropFilter: "blur(10px)",
                position: "fixed",
                top: 0,
                left: 0,
                transform: isOpen ? "translateX(0)" : "translateX(-100%)",
                opacity: isOpen ? 1 : 0,
                visibility: isOpen ? "visible" : "hidden",
                color: "white",
                padding: "20px",
                gap: "15px",
                transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
                boxShadow: "2px 0 12px rgba(0, 0, 0, 0.4)",
                zIndex: 900,
                boxSizing: "border-box",
                pointerEvents: isOpen ? "auto" : "none",
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.18)',
                        border: '1px solid rgba(255,255,255,0.75)',
                        color: 'white',
                        borderRadius: '12px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                    }}>
                    ⚡
                </button>
            </div>
            <button>Events & tasks</button>
            <button>Attendance</button>
            <button>Projects & collaborations</button>
            <button>scribble Pad</button>
        </div>
    )
}

export default Sidebar