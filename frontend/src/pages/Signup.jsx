import React from 'react'
import './signup.css'

function Signup() {
    return (
    <div className="signup-container">
            <div className="signup-box">
            <h1>Campus Mate</h1>

            <input
                type="text"
                placeholder="Username"
            />

            <input
                type="password"
                placeholder="Password"
            />

            <button>
                Sign Up
            </button>
        </div>
    </div>
    );
}

export default Signup;