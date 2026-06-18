import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Signup.css'
import { useAuth } from '../context/AuthContext'

function Signup() {
    const navigate = useNavigate()
    const { register: registerUser } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        try {
            await registerUser(name, username, email, password)
            navigate('/')
        } catch (err) {
            setError(err.message || 'Registration failed')
        }
    }

    return (
    <div className="signup-container">
            <form className="signup-box" onSubmit={handleSubmit}>
            <h1>Campus Mate</h1>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            
            <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
