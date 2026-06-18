/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function checkAuth() {
        try {
            const { data } = await api.get('/auth/me');
            if (data.success) {
                setUser(data.data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.success) {
                setUser(data.data.user);
                return data;
            }
            throw new Error(data.message || 'Login failed');
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Login failed', { cause: error });
        }
    };

    const register = async (name, username, email, password) => {
        try {
            const { data } = await api.post('/auth/register', { name, username, email, password });
            if (data.success) {
                return data;
            }
            throw new Error(data.message || 'Registration failed');
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Registration failed', { cause: error });
        }
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
