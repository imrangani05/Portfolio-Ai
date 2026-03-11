'use client';

import React, { useEffect, useState } from 'react';

export default function GovernancePage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/governance');
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch governance ledger');
                setLogs(data.data || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const formatAction = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #0ea5e9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <p style={{ fontWeight: '600', color: '#64748b' }}>ACCESSING SECURE AUDIT LEDGER...</p>
        </div>
    );

    return (
        <div style={{ padding: '60px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '12px', color: '#0f172a' }}>
                    Policy & <span style={{ color: '#0ea5e9' }}>Audit Control</span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                    Enterprise-wide governance rules and immutable audit log review.
                </p>
            </div>

            {error ? (
                <div style={{ padding: '40px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', color: '#b91c1c', textAlign: 'center' }}>
                    <strong>System Error:</strong> {error}
                </div>
            ) : (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '40px' }}>
                    <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Immutable Governance Ledger</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time capture of AI suggestions and human governance decisions.</p>
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0ea5e9', background: '#e0f2fe', padding: '8px 16px', borderRadius: '30px' }}>
                            {logs.length} EVENTS CAPTURED
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {logs.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #e2e8f0', borderRadius: '16px' }}>
                                No audit events recorded yet.
                            </div>
                        ) : logs.map((log) => (
                            <div key={log._id} style={{
                                padding: '20px 24px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '16px',
                                fontSize: '0.85rem',
                                display: 'grid',
                                gridTemplateColumns: '150px 1fr 180px',
                                gap: '24px',
                                alignItems: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ fontWeight: '800', color: log.action.includes('OVERRIDE') ? '#92400e' : '#0ea5e9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.action.includes('OVERRIDE') ? '#f39c12' : '#0ea5e9' }}></div>
                                    {formatAction(log.action)}
                                </div>
                                <div style={{ color: '#475569', lineHeight: '1.5' }}>
                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{log.entityType} Log:</span> {JSON.stringify(log.details)}
                                </div>
                                <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600' }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
