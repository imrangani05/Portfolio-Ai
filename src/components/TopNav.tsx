'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';

export default function TopNav({ children }: { children?: React.ReactNode }) {
    const { user, role, logout, isLoggedIn } = useRole();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isLoggedIn) return null;

    const initials = user?.name
        ? user.name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
        : '??';

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 60px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--background)',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            <Link href="/" style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--foreground)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                    P
                </div>
                Portfolio<span style={{ color: '#0ea5e9' }}>Ai</span>
            </Link>

            <div style={{ display: 'flex', gap: '32px' }}>
                <Link href="/" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '700', fontSize: '0.9rem' }}>Dashboard</Link>
                <Link href="/ideation" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '700', fontSize: '0.9rem' }}>Ideation</Link>
                <Link href="/mvp" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '700', fontSize: '0.9rem' }}>MVP Gates</Link>
                <Link href="/adoption" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '700', fontSize: '0.9rem' }}>Adoption Desk</Link>
                <Link href="/value" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '700', fontSize: '0.9rem' }}>Value HUB</Link>
                <Link href="/portfolio" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '700', fontSize: '0.9rem' }}>Portfolio</Link>
                <Link href="/governance" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '700', fontSize: '0.9rem' }}>Audit Ledger</Link>
            </div>

            <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '6px 8px 6px 18px',
                        borderRadius: '100px',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s',
                        background: isDropdownOpen ? '#f0f9ff' : 'white',
                        cursor: 'pointer',
                        borderColor: isDropdownOpen ? '#0ea5e9' : '#e2e8f0',
                        outline: 'none',
                        height: '48px'
                    }}
                >
                    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', lineHeight: '1', whiteSpace: 'nowrap' }}>
                        {user?.name.split(' ')[0]}
                    </span>
                    <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#0ea5e9',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        boxShadow: '0 2px 4px rgba(14, 165, 233, 0.2)',
                        lineHeight: '1',
                        flexShrink: 0
                    }}>
                        {initials}
                    </div>
                </button>

                {isDropdownOpen && (
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 12px)',
                        right: 0,
                        width: '280px',
                        background: 'white',
                        borderRadius: '24px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        padding: '24px',
                        zIndex: 100,
                        animation: 'slideIn 0.2s ease-out'
                    }}>
                        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{user?.name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', marginBottom: '12px' }}>{user?.email}</div>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                background: '#f0f9ff',
                                color: '#0ea5e9',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {role}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Link href="/profile" onClick={() => setIsDropdownOpen(false)} style={{
                                textDecoration: 'none',
                                color: '#475569',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                padding: '12px',
                                borderRadius: '12px',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0ea5e9'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                Account Settings
                            </Link>

                            <button
                                onClick={() => { logout(); setIsDropdownOpen(false); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    width: '100%',
                                    textAlign: 'left',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {children}
        </nav>
    );
}
