import React from 'react'
import './Login.css'
import backgroundImage from '../assets/bg.png'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
    const navigate = useNavigate()

    const handleSubmit = (event) => {
        event.preventDefault()
        navigate('/home')
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
                
                <input
                    type='text'
                    placeholder='Username'
                    required
                />
                
                <input
                    type='password'
                    placeholder='Password'
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
