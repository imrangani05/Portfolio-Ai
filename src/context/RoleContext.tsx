'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export type Role =
    | 'Executive'
    | 'Business Owner'
    | 'AI Product Owner'
    | 'Risk Officer'
    | 'Developer'
    | 'End User'
    | 'Admin'
    | 'Analyst'
    | 'Viewer';

interface UserMetadata {
    name: string;
    email: string;
    department: string;
    joinDate: string;
}

interface RoleContextType {
    role: Role;
    setRole: (role: Role) => void;
    isLoggedIn: boolean;
    user: UserMetadata | null;
    login: (role?: Role, credentials?: { username: string; password?: string }) => Promise<boolean>;
    logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRoleState] = useState<Role>('Viewer');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<UserMetadata | null>(null);

    useEffect(() => {
        const savedRole = localStorage.getItem('user-role') as Role;
        const savedAuth = localStorage.getItem('is-logged-in') === 'true';
        const savedUser = localStorage.getItem('user-data');

        if (savedRole) {
            setRoleState(savedRole);
        }
        if (savedAuth) {
            setIsLoggedIn(true);
        }
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const setRole = (newRole: Role) => {
        setRoleState(newRole);
        localStorage.setItem('user-role', newRole);
    };

    const login = async (newRole?: Role, credentials?: { username: string; password?: string }) => {
        try {
            // Call the real MongoDB auth API
            const response = await axios.post('/api/auth/login', {
                username: credentials?.username,
                password: credentials?.password || 'password', // Fallback for dev
                role: newRole
            });

            if (response.data.success) {
                const userData = response.data.user;
                const userRole = response.data.role;

                setRoleState(userRole);
                setIsLoggedIn(true);
                setUser(userData);

                localStorage.setItem('user-role', userRole);
                localStorage.setItem('is-logged-in', 'true');
                localStorage.setItem('user-data', JSON.stringify(userData));

                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Login failed:', error.response?.data?.error || error.message);
            throw new Error(error.response?.data?.error || 'Authentication failed');
        }
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('is-logged-in');
        localStorage.removeItem('user-data');
        setRoleState('Viewer');
        localStorage.setItem('user-role', 'Viewer');
    };

    return (
        <RoleContext.Provider value={{ role, setRole, isLoggedIn, user, login, logout }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (context === undefined) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};
