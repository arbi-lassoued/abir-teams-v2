import React, { useState } from 'react'
import { AuthContext } from './AuthContext';

// 1. Export the provider
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (userData) => {
        setUser(userData);
        console.log(`[LOGIN] User "${userData.username}" logged in at ${new Date().toLocaleString()}`);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        console.log(`[LOGOUT] User "${user?.username}" logged out at ${new Date().toLocaleString()}`);
        localStorage.removeItem('user');

    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}