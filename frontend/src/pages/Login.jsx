import React from 'react'
import './login.css'
import backgroundImage from '../assets/bg.png'
import { useNavigate } from 'react-router-dom'
import { Link } from "react-router-dom";

function Login() {
    const navigate = useNavigate()
    
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
            <div className='login-box'>
                <h1>Campus Mate</h1>
                
                <input
                    type='text'
                    placeholder='Username'
                />
                
                <input
                    type='password'
                    placeholder='Password'
                />
                
                <button>
                    Login
                </button>
                
                <p>
                    New user? <Link to="/signup">Sign Up</Link>
                </p>
            </div>
        </div>
    )
}

export default Login