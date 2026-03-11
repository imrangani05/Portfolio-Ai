'use client';

import React, { useEffect, useState } from 'react';
import AIField from '@/components/AIField';

export default function ValueRealizationPage() {
    const [realizations, setRealizations] = useState<any[]>([]);
    const [selectedRealization, setSelectedRealization] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRealizations();
    }, []);

    const fetchRealizations = async () => {
        try {
            const res = await fetch('/api/value'); // Need to create this GET route
            const data = await res.json();
            if (res.ok) setRealizations(data.data);
            else throw new Error(data.error);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRunValueAnalysis = async (useCaseId: string) => {
        try {
            const res = await fetch('/api/value/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ useCaseId })
            });
            const data = await res.json();
            if (res.ok) {
                await fetchRealizations();
                setSelectedRealization(data.data);
            } else throw new Error(data.error);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleAccept = async (field: string) => {
        if (!selectedRealization) return;
        try {
            const res = await fetch('/api/value/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ realizationId: selectedRealization._id, field })
            });
            const data = await res.json();
            if (res.ok) {
                setSelectedRealization(data.data);
                await fetchRealizations();
            } else throw new Error(data.error);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleOverride = async (field: string, newValue: any, reason: string) => {
        if (!selectedRealization) return;
        try {
            const res = await fetch('/api/value/override', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    realizationId: selectedRealization._id,
                    field,
                    value: newValue,
                    reason
                })
            });
            const data = await res.json();
            if (res.ok) {
                setSelectedRealization(data.data);
                await fetchRealizations();
            } else throw new Error(data.error);
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Synthesizing Value Metrics...</div>;

    return (
        <div style={{ padding: '60px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '60px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Value <span style={{ color: '#0ea5e9' }}>Realization</span></h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Measure realized ROI and make data-driven scaling decisions for the AI portfolio.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '40px' }}>
                {/* Initiatives for Value Review */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Investment Portfolio</h3>
                    {realizations.length === 0 ? (
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>No realized value entries yet.</p>
                    ) : (
                        realizations.map(r => (
                            <div
                                key={r._id}
                                onClick={() => setSelectedRealization(r)}
                                style={{
                                    padding: '20px',
                                    background: selectedRealization?._id === r._id ? '#0f172a' : '#ffffff',
                                    color: selectedRealization?._id === r._id ? '#ffffff' : '#0f172a',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontWeight: '700' }}>{r.useCaseId?.title}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>ROI: {r.actualROI}%</div>
                            </div>
                        ))
                    )}
                </div>

                {/* ROI & Decision Hub */}
                {selectedRealization ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* 1. Value Comparison Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <div style={{ padding: '30px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>PLANNED VALUE</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>${selectedRealization.plannedValue.toLocaleString()}</div>
                            </div>
                            <div style={{ padding: '30px', background: '#f0fdf4', borderRadius: '24px', border: '1px solid #dcfce7' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#166534', marginBottom: '8px' }}>REALIZED VALUE</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#166534' }}>${selectedRealization.realizedValue.toLocaleString()}</div>
                            </div>
                            <div style={{ padding: '30px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>ACTUAL ROI</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: selectedRealization.actualROI > 100 ? '#166534' : '#0f172a' }}>{selectedRealization.actualROI.toFixed(1)}%</div>
                            </div>
                        </div>

                        {/* 2. AI Decision Hub */}
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '60px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '900' }}>AI <span style={{ color: '#0ea5e9' }}>Decision Recommendation</span></h3>
                                <p style={{ color: '#64748b' }}>Strategic direction based on realized financial and adoption data.</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                <AIField label="Recommendation" field="scalingRecommendation" data={selectedRealization.scalingRecommendation} onAccept={handleAccept} onOverride={handleOverride} type="select" options={['Scale', 'Maintain', 'Optimize', 'Retire']} />
                                <AIField label="Efficiency Gains" field="efficiencyGains" data={selectedRealization.efficiencyGains} onAccept={handleAccept} onOverride={handleOverride} type="number" />
                            </div>

                            {(selectedRealization.status === 'Tracking' || !selectedRealization.actualROI) && (
                                <button
                                    onClick={() => handleRunValueAnalysis(selectedRealization.useCaseId?._id || selectedRealization.useCaseId)}
                                    disabled={loading}
                                    style={{
                                        padding: '20px',
                                        background: '#0ea5e9',
                                        color: 'white',
                                        borderRadius: '16px',
                                        fontWeight: '800',
                                        fontSize: '1.1rem',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {loading ? 'Analyzing Impact...' : 'Analyze ROI & Strategic Impact →'}
                                </button>
                            )}

                            <div style={{ padding: '30px', background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Scaling Justification</h4>
                                <div style={{ fontSize: '1rem', lineHeight: '1.7', color: '#1e293b' }}>
                                    {selectedRealization.decisionJustification || 'Strategic justification will appear after AI analysis.'}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px' }}>
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💎</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Value Review Required</h2>
                            <p style={{ color: '#64748b', marginTop: '8px' }}>Select an initiative to see its financial performance and scaling roadmap.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
