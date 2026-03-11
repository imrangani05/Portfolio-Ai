'use client';

import React from 'react';
import { useRole } from '@/context/RoleContext';
import { RolePermissions } from '@/config/permissions';

export default function ProfilePage() {
    const { user, role, logout } = useRole();

    if (!user) {
        return (
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>Session Expired</h2>
                <p style={{ color: '#64748b', marginTop: '16px' }}>Please log in again to view your profile.</p>
                <a href="/" style={{
                    display: 'inline-block',
                    marginTop: '24px',
                    padding: '12px 24px',
                    background: '#0ea5e9',
                    color: 'white',
                    borderRadius: '10px',
                    fontWeight: '700',
                    textDecoration: 'none'
                }}>Go to Login</a>
            </div>
        );
    }

    const permissions = RolePermissions[role] || [];

    return (
        <div style={{ padding: '60px', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '60px' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                    User <span style={{ color: '#0ea5e9' }}>Profile</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Manage your account settings and view role permissions.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                {/* Profile Card */}
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '32px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        background: '#f1f5f9',
                        borderRadius: '40px',
                        margin: '0 auto 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        fontWeight: '900',
                        color: '#0ea5e9',
                        border: '2px solid #e2e8f0'
                    }}>
                        {user.name.charAt(0)}
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{user.name}</h2>
                    <p style={{ color: '#0ea5e9', fontWeight: '700', fontSize: '0.9rem', marginBottom: '24px' }}>{role.toUpperCase()}</p>

                    <div style={{ textAlign: 'left', background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '32px' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Department</label>
                            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>{user.department}</span>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Email Address</label>
                            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>{user.email}</span>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Member Since</label>
                            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>{user.joinDate}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => logout()}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Sign Out
                    </button>
                </div>

                {/* Details Section */}
                <div>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '8px', height: '24px', background: '#0ea5e9', borderRadius: '4px' }}></div>
                            Role Permissions
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                            {permissions.map((p: string, i: number) => (
                                <div key={i} style={{
                                    padding: '12px 16px',
                                    background: '#f0f9ff',
                                    border: '1px solid #bae6fd',
                                    borderRadius: '10px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    color: '#0369a1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    {p.replace(/_/g, ' ')}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: '#0f172a', padding: '40px', borderRadius: '32px', color: 'white' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px' }}>Account Security</h3>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.6' }}>
                            Your account is protected by mandatory role-based access control. All actions within the Portfolio-Ai ecosystem are strictly audited and logged to the central ledger.
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                                View Access Logs
                            </button>
                            <button style={{ padding: '12px 24px', background: 'white', color: '#0f172a', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                                Manage MFA
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
