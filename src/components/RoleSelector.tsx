'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRole, Role } from '@/context/RoleContext';

const roles: Role[] = [
    'Executive',
    'Business Owner',
    'AI Product Owner',
    'Risk Officer',
    'Developer',
    'End User',
    'Admin',
    'Analyst',
    'Viewer'
];

export default function RoleSelector() {
    const { role, setRole, logout } = useRole();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
            >
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role:</span>
                {role}
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '200px',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                    padding: '8px',
                    zIndex: 100,
                    animation: 'slideIn 0.2s ease-out'
                }}>
                    {roles.map((r) => (
                        <button
                            key={r}
                            onClick={() => {
                                setRole(r);
                                setIsOpen(false);
                            }}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: r === role ? '700' : '500',
                                color: r === role ? '#0ea5e9' : '#0f172a',
                                background: r === role ? '#f0f9ff' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.1s'
                            }}
                        >
                            {r}
                        </button>
                    ))}

                    <div style={{ margin: '8px -8px 0', borderTop: '1px solid #f1f5f9', padding: '8px' }}>
                        <button
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                color: '#dc2626',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.1s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Log Out
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
