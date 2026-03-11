'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import LoginComponent from '@/components/LoginComponent';

export default function UnifiedLoginPage() {
    const router = useRouter();
    const { login } = useRole();

    const branding = {
        title: 'Enterprise AI Portal',
        description: 'Secure access to governed portfolio analytics and strategic AI insights.',
        accentColor: '#0f172a'
    };

    const handleLogin = async (username: string, password?: string) => {
        await login(undefined, { username, password });
        router.push('/');
    };

    return (
        <LoginComponent
            role="Viewer" // Default UI context, will be overridden by DB role
            onLogin={handleLogin}
            branding={branding}
        />
    );
}
