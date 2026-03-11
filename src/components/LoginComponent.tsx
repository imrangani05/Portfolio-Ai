'use client';

import React, { useState } from 'react';
import { Role } from '@/context/RoleContext';

interface LoginComponentProps {
    role: Role;
    onLogin: (username: string, password?: string) => void;
    branding: {
        title: string;
        description: string;
        accentColor: string;
    };
}

export default function LoginComponent({ role, onLogin, branding }: LoginComponentProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await onLogin(username, password);
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '440px',
                background: 'white',
                padding: '40px',
                borderRadius: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 24px',
                    background: branding.accentColor,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    boxShadow: `0 10px 15px -3px ${branding.accentColor}40`
                }}>
                    P
                </div>

                <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                    {branding.title}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '32px' }}>
                    {branding.description}
                </p>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        borderRadius: '12px',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={`Enter ${role} ID`}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = branding.accentColor}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                                outline: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = branding.accentColor}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: branding.accentColor,
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: isLoading ? 0.7 : 1,
                            boxShadow: `0 10px 15px -3px ${branding.accentColor}40`
                        }}
                    >
                        {isLoading ? 'Verifying...' : `Secure Sign In`}
                    </button>
                </form>

                <div style={{ marginTop: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                        Enterprise Role: <span style={{ fontWeight: '700', color: branding.accentColor }}>{role}</span>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
