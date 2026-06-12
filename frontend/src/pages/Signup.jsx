import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Signup.css'

function Signup() {
    const navigate = useNavigate()

    const handleSubmit = (event) => {
        event.preventDefault()
        navigate('/home')
    }

    return (
    <div className="signup-container">
            <form className="signup-box" onSubmit={handleSubmit}>
            <h1>Campus Mate</h1>

            <input
                type="text"
                placeholder="Username"
                required
            />

            <input
                type="password"
                placeholder="Password"
                required
            />

            <button type="submit">
                Sign Up
            </button>
            <p>
                Already have an account? <Link to="/">Login</Link>
            </p>
        </form>
    </div>
    );
}

export default Signup;
