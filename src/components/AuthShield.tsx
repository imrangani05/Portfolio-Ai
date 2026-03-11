'use client';

import React from 'react';
import { useRole, Role } from '@/context/RoleContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AuthShield({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, role } = useRole();
    const pathname = usePathname();

    // Allow access to login pages without authentication
    if (pathname?.startsWith('/login')) {
        return <>{children}</>;
    }

    if (!isLoggedIn) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at top right, #f8fafc, #e2e8f0)',
                padding: '40px'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '600px',
                    textAlign: 'center',
                    animation: 'fadeIn 0.8s ease-out'
                }}>
                    <div style={{ marginBottom: '60px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: '#0f172a',
                            color: 'white',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: '800',
                            margin: '0 auto 24px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                        }}>
                            P
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                            Enterprise AI <span style={{ color: '#0ea5e9' }}>Portal</span>
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
                            Access the governed AI portfolio and strategic ROI metrics through your enterprise credentials.
                        </p>
                    </div>

                    <Link
                        href="/login"
                        style={{
                            textDecoration: 'none',
                            background: '#0f172a',
                            color: 'white',
                            padding: '24px 48px',
                            borderRadius: '100px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 25px 30px -5px rgba(15, 23, 42, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(15, 23, 42, 0.2)';
                        }}
                    >
                        Sign In to Dashboard
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    </Link>
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

    return <>{children}</>;
}
