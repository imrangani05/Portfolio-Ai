'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Core Application Error:', error);
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '20px',
            textAlign: 'center',
            background: '#f8fafc'
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                Something went wrong!
            </h2>
            <p style={{ color: '#64748b', marginBottom: '32px', maxWidth: '400px' }}>
                {error.message || 'An unexpected error occurred while rendering the page.'}
            </p>
            <button
                onClick={() => reset()}
                style={{
                    padding: '12px 24px',
                    background: '#0f172a',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                Try again
            </button>
        </div>
    );
}
