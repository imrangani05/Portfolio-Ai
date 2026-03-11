import Link from 'next/link';

export default function NotFound() {
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
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                Page Not Found
            </h2>
            <p style={{ color: '#64748b', marginBottom: '32px', maxWidth: '400px' }}>
                The page you are looking for has been moved or doesn't exist.
            </p>
            <Link
                href="/"
                style={{
                    padding: '12px 24px',
                    background: '#0f172a',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: '700',
                    border: 'none',
                    textDecoration: 'none'
                }}
            >
                Return Home
            </Link>
        </div>
    );
}
