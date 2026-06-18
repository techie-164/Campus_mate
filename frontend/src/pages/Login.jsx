import React, { useState } from 'react'
import './Login.css'
import backgroundImage from '../assets/bg.png'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        try {
            await login(email, password)
            navigate('/home')
        } catch (err) {
            setError(err.message || 'Login failed')
        }
    }

    return (
        <div className='login-container'
        style = {{
                backgroundImage:`url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh',
                color: 'white',
              }}
        >
            <form className='login-box' onSubmit={handleSubmit}>
                <h1>Campus Mate</h1>
                
                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                <input
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                
                <input
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                
                <button type="submit">
                    Login
                </button>
                
                <p>
                    New user? <Link to="/signup">Sign Up</Link>
                </p>
            </form>
        </div>
    )
}

export default Login
