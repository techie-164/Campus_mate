import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Topbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="topbar">
            <h1 className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>Campus Mate</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {user && (
                    <button 
                        onClick={handleLogout}
                        style={{ background: 'transparent', color: 'white', border: '1px solid white', padding: '5px 15px', borderRadius: '15px', cursor: 'pointer' }}
                    >
                        Logout
                    </button>
                )}
                <div className="profile-circle" title={user?.name || 'User'}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
            </div>
        </div>
    );
}

export default Topbar;