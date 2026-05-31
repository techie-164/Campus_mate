import React from 'react'

function Sidebar({isOpen}){
    return (
        <div
        style={{
                display: isOpen ? "block" : "none",
                width: "250px",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                padding: "20px",
                flexDirection: "column",
                gap: "15px"
        }}>
            <h3>Menu</h3>

            <button>Events & tasks</button>
            <button>Attendance</button>
            <button>Projects & collaborations</button>
            <button>scribble Pad</button>
        </div>
    )
}

export default Sidebar