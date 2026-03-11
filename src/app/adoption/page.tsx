'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AIField from '@/components/AIField';

export default function AdoptionPage() {
    const router = useRouter();
    const [mvps, setMvps] = useState<any[]>([]);
    const [selectedMvp, setSelectedMvp] = useState<any>(null);
    const [adoptionData, setAdoptionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [usageCount, setUsageCount] = useState(0);
    const [usageFrequency, setUsageFrequency] = useState(0);
    const [satisfaction, setSatisfaction] = useState(5);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        fetchMVPs();
    }, []);

    const fetchMVPs = async () => {
        try {
            const res = await fetch('/api/mvp');
            const data = await res.json();
            if (res.ok) {
                // Filter for those in Pilot or later
                const active = data.data.filter((m: any) => ['Pilot', 'Completed'].includes(m.stageGate));
                setMvps(active);
            } else throw new Error(data.error);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdoption = async (mvpId: string) => {
        try {
            const res = await fetch(`/api/adoption/${mvpId}`);
            const data = await res.json();
            if (res.ok) setAdoptionData(data.data);
            else setAdoptionData(null);
        } catch (err) {
            setAdoptionData(null);
        }
    };

    const handleMvpSelect = (mvp: any) => {
        setSelectedMvp(mvp);
        fetchAdoption(mvp._id);
        setUsageCount(0);
        setUsageFrequency(0);
        setFeedback('');
    };

    const handleAccept = async (field: string) => {
        try {
            const res = await fetch('/api/adoption/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mvpId: selectedMvp._id, field })
            });
            const data = await res.json();
            if (res.ok) setAdoptionData(data.data);
            else throw new Error(data.error);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleOverride = async (field: string, newValue: any, reason: string) => {
        try {
            const res = await fetch('/api/adoption/override', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mvpId: selectedMvp._id,
                    field,
                    value: newValue,
                    reason
                })
            });
            const data = await res.json();
            if (res.ok) setAdoptionData(data.data);
            else throw new Error(data.error);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSubmitMetrics = async () => {
        if (!selectedMvp) return;
        setLoading(true);
        try {
            const res = await fetch('/api/adoption', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mvpId: selectedMvp._id,
                    usageCount,
                    usageFrequency,
                    satisfactionRating: satisfaction,
                    feedback
                })
            });
            const data = await res.json();
            if (res.ok) {
                setAdoptionData(data.data);
                // Clear form but keep selection
                setUsageCount(0);
                setUsageFrequency(0);
                setFeedback('');
            } else throw new Error(data.error);
        } catch (err: any) {
            alert(`Submission Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalize = async () => {
        if (!selectedMvp) return;
        setLoading(true);
        try {
            const res = await fetch('/api/adoption/finalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mvpId: selectedMvp._id })
            });
            if (res.ok) {
                router.push('/value');
            } else {
                const data = await res.json();
                throw new Error(data.error);
            }
        } catch (err: any) {
            alert(`Finalization Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (error) return <div style={{ padding: '100px', textAlign: 'center', color: '#ef4444' }}>Error: {error}</div>;
    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Adoption Metrics...</div>;

    return (
        <div style={{ padding: '60px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '60px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Adoption <span style={{ color: '#10b981' }}>& Intervention</span></h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Track real-world usage and execute AI-suggested change management strategies.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '40px' }}>
                {/* List of Pilot MVPs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pilot Phase MVPs</h3>
                    {mvps.length === 0 ? (
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8', padding: '20px' }}>No MVPs currently in Pilot phase.</p>
                    ) : (
                        mvps.map(mvp => (
                            <div
                                key={mvp._id}
                                onClick={() => handleMvpSelect(mvp)}
                                style={{
                                    padding: '20px',
                                    background: selectedMvp?._id === mvp._id ? '#10b981' : '#ffffff',
                                    color: selectedMvp?._id === mvp._id ? '#ffffff' : '#0f172a',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: '700' }}>{mvp.useCaseId?.title || 'Untitled Initiative'}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Target: {mvp.adoptionTarget?.human_value || mvp.adoptionTarget?.ai_value || '--'}%</div>
                            </div>
                        ))
                    )}
                </div>

                {/* Adoption Dashboard */}
                {selectedMvp ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* 1. Metric Entry */}
                        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '40px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px' }}>Log New Metrics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>USAGE COUNT</label>
                                    <input type="number" min="0" value={usageCount} onChange={e => setUsageCount(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>FREQ (DAYS/WK)</label>
                                    <input type="number" min="0" max="7" value={usageFrequency} onChange={e => setUsageFrequency(parseFloat(e.target.value) || 0)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>SATISFACTION (1-5)</label>
                                    <input type="number" min="1" max="5" value={satisfaction} onChange={e => setSatisfaction(parseInt(e.target.value) || 5)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>USER FEEDBACK</label>
                                <textarea
                                    placeholder="Enter raw user feedback for AI analysis..."
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '80px', outline: 'none' }}
                                />
                            </div>
                            <button
                                onClick={handleSubmitMetrics}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: loading ? '#94a3b8' : '#0f172a',
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontWeight: '700',
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {loading ? 'Analyzing Adoption Health...' : 'Analyze Adoption Health →'}
                            </button>
                        </div>

                        {/* 2. AI Adoption Projections */}
                        {adoptionData && (
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <AIField label="Adoption Status" field="adoptionStatus" data={adoptionData.adoptionStatus} onAccept={handleAccept} onOverride={handleOverride} />
                                    <AIField label="Trust Sentiment" field="trustFeedback" data={adoptionData.trustFeedback} onAccept={handleAccept} onOverride={handleOverride} />
                                    <AIField label="Friction Barriers" field="barriersIdentified" data={adoptionData.barriersIdentified} onAccept={handleAccept} onOverride={handleOverride} type="json" />
                                    <AIField label="Intervention Plan" field="suggestedActions" data={adoptionData.suggestedActions} onAccept={handleAccept} onOverride={handleOverride} type="json" />
                                    <AIField label="Scaling Decision" field="scalingDecision" data={adoptionData.scalingDecision} onAccept={handleAccept} onOverride={handleOverride} type="select" options={['Scaling', 'Pivoting', 'Sunsetting', 'Pending']} />
                                </div>

                                {(() => {
                                    const fields = ['adoptionStatus', 'trustFeedback', 'barriersIdentified', 'suggestedActions', 'scalingDecision'];
                                    const isPending = fields.some(f => adoptionData[f]?.human_value === null || adoptionData[f]?.human_value === undefined);

                                    return (
                                        <div style={{ marginTop: '40px' }}>
                                            {isPending && (
                                                <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '12px', marginBottom: '16px', color: '#92400e', fontSize: '0.9rem', fontWeight: '600' }}>
                                                    ⚠️ Governance Required: Please Accept or Override all AI suggestions before finalizing.
                                                </div>
                                            )}
                                            <button
                                                onClick={handleFinalize}
                                                disabled={isPending || loading}
                                                style={{
                                                    padding: '20px',
                                                    background: isPending || loading ? '#94a3b8' : '#0ea5e9',
                                                    color: 'white',
                                                    borderRadius: '16px',
                                                    fontWeight: '800',
                                                    fontSize: '1.1rem',
                                                    border: 'none',
                                                    cursor: isPending || loading ? 'not-allowed' : 'pointer',
                                                    width: '100%',
                                                    boxShadow: isPending ? 'none' : '0 10px 15px -3px rgba(14, 165, 233, 0.3)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {loading ? 'Finalizing...' : 'Finalize Decision & Close Portfolio Item →'}
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px' }}>
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📈</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Pilot Selection Required</h2>
                            <p style={{ color: '#64748b', marginTop: '8px' }}>Select an MVP in Pilot phase to track adoption metrics.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
