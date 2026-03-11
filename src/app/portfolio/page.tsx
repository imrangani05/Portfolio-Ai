'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PortfolioPage() {
    const [useCases, setUseCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUseCases = async () => {
            try {
                const res = await fetch('/api/use-case');
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch portfolio');
                setUseCases(data.data || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUseCases();
    }, []);

    if (loading) return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #0ea5e9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <p style={{ fontWeight: '600', color: '#64748b' }}>AGGREGATING PORTFOLIO DATA...</p>
        </div>
    );

    return (
        <div style={{ padding: '60px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '12px', color: '#0f172a' }}>
                        AI Portfolio <span style={{ color: '#0ea5e9' }}>Ledger</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                        Centralized inventory of all AI initiatives across the enterprise.
                    </p>
                </div>
                <Link href="/ideation" style={{ background: '#0f172a', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', boxShadow: '0 4px 6px -1px rgba(15,23,42,0.1)' }}>
                    + New Use Case
                </Link>
            </div>

            {error ? (
                <div style={{ padding: '40px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '16px', color: '#b91c1c', textAlign: 'center' }}>
                    <strong>Error:</strong> {error}
                </div>
            ) : useCases.length === 0 ? (
                <div style={{ padding: '80px', border: '1px dashed #e2e8f0', borderRadius: '32px', background: '#f8fafc', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                            <path d="M12 2v20m10-10H2" />
                        </svg>
                    </div>
                    <h3 style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>Portfolio Empty</h3>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>No AI Use Cases have been submitted yet.</p>
                    <Link href="/ideation" style={{ color: '#0ea5e9', fontWeight: '700' }}>Submit your first idea →</Link>
                </div>
            ) : (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Use Case</th>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Dept</th>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Priority</th>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Feasibility</th>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '20px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {useCases.map((uc) => (
                                <tr key={uc._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '24px' }}>
                                        <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{uc.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: {uc._id.slice(-6).toUpperCase()}</div>
                                    </td>
                                    <td style={{ padding: '24px' }}>
                                        <span style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600' }}>{uc.businessUnit}</span>
                                    </td>
                                    <td style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(uc.priority?.human_value || uc.priority?.ai_value || 0) * 100}%`, height: '100%', background: '#0ea5e9' }}></div>
                                            </div>
                                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{uc.priority?.human_value || uc.priority?.ai_value || '--'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(uc.feasibility?.human_value || uc.feasibility?.ai_value || 0) * 100}%`, height: '100%', background: '#10b981' }}></div>
                                            </div>
                                            <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{uc.feasibility?.human_value || uc.feasibility?.ai_value || '--'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            background: uc.status === 'Ideation' ? '#f0f9ff' : '#f0fdf4',
                                            color: uc.status === 'Ideation' ? '#0369a1' : '#166534',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            border: '1px solid',
                                            borderColor: uc.status === 'Ideation' ? '#e0f2fe' : '#dcfce7'
                                        }}>
                                            {uc.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '24px' }}>
                                        <Link
                                            href={`/analysis/${uc._id}`}
                                            style={{ color: '#0ea5e9', fontWeight: '700', fontSize: '0.85rem' }}
                                        >
                                            View Details →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
