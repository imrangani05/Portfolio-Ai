'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AIField from '@/components/AIField';

export default function MVPManagementPage() {
    const [mvps, setMvps] = useState<any[]>([]);
    const [selectedMvp, setSelectedMvp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchMVPs();
    }, []);

    const fetchMVPs = async () => {
        try {
            const res = await fetch('/api/mvp');
            const data = await res.json();
            if (res.ok) setMvps(data.data);
            else throw new Error(data.error);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStageGateAction = async (mvpId: string, action: 'Approved' | 'Rejected') => {
        const notes = window.prompt(`Enter ${action.toLowerCase()} notes for audit trail (optional):`) || '';
        try {
            const res = await fetch('/api/mvp/stage-gate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mvpId, action, notes })
            });
            const data = await res.json();
            if (res.ok) {
                // Refresh list and selection
                await fetchMVPs();
                if (selectedMvp?._id === mvpId) setSelectedMvp(data.data);
            } else throw new Error(data.error);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleAccept = async (field: string) => {
        if (!selectedMvp) return;
        try {
            const res = await fetch('/api/mvp/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mvpId: selectedMvp._id, field })
            });
            const data = await res.json();
            if (res.ok) {
                setSelectedMvp(data.data);
                setMvps(mvps.map(m => m._id === data.data._id ? data.data : m));
            } else throw new Error(data.error);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleOverride = async (field: string, newValue: any, reason: string) => {
        if (!selectedMvp) return;
        try {
            const res = await fetch('/api/mvp/override', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mvpId: selectedMvp._id, field, humanValue: newValue, reason })
            });
            const data = await res.json();
            if (res.ok) {
                setSelectedMvp(data.data);
                setMvps(mvps.map(m => m._id === data.data._id ? data.data : m));
            } else throw new Error(data.error);
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Synchronizing Stage Gates...</div>;

    return (
        <div style={{ padding: '60px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '60px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>MVP <span style={{ color: '#0ea5e9' }}>Stage Gates</span></h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Manage formal transitions from approved AI ideas to production pilots.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '40px' }}>
                {/* MVP List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Initiatives</h3>
                    {mvps.length === 0 ? (
                        <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '20px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>No MVPs proposed yet.</p>
                        </div>
                    ) : (
                        mvps.map(mvp => (
                            <div
                                key={mvp._id}
                                onClick={() => setSelectedMvp(mvp)}
                                style={{
                                    padding: '20px',
                                    background: selectedMvp?._id === mvp._id ? '#0f172a' : '#ffffff',
                                    color: selectedMvp?._id === mvp._id ? '#ffffff' : '#0f172a',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: selectedMvp?._id === mvp._id ? '0 10px 15px -3px rgba(15,23,42,0.2)' : 'none'
                                }}
                            >
                                <div style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.7, marginBottom: '4px' }}>{mvp.useCaseId?.title || 'Unknown Use Case'}</div>
                                <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '12px' }}>{mvp.scope.ai_value.slice(0, 40)}...</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>{mvp.stageGate}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>${mvp.estimatedCost.ai_value.toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* MVP Details & Governance */}
                {selectedMvp ? (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '60px' }}>
                        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Stage Gate: {selectedMvp.stageGate}</div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a' }}>{selectedMvp.useCaseId?.title}</h2>
                                <p style={{ color: '#64748b', marginTop: '8px' }}>AI-assisted MVP scope and targets for business unit {selectedMvp.useCaseId?.businessUnit}.</p>
                                <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                                    <div style={{ padding: '8px 16px', background: '#f0f9ff', borderRadius: '10px', border: '1px solid #e0f2fe' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#0369a1', display: 'block' }}>PREDICTED ROI</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0c4a6e' }}>{selectedMvp.useCaseId?.expectedValue?.ai_value ? `$${selectedMvp.useCaseId.expectedValue.ai_value.toLocaleString()}` : '--'}</span>
                                    </div>
                                    <div style={{ padding: '8px 16px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#166534', display: 'block' }}>AI CONFIDENCE</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#14532d' }}>{(selectedMvp.aiConfidence * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => handleStageGateAction(selectedMvp._id, 'Rejected')}
                                    style={{ padding: '12px 24px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    Reject Phase
                                </button>
                                {selectedMvp.stageGate !== 'Completed' && (
                                    <button
                                        onClick={() => handleStageGateAction(selectedMvp._id, 'Approved')}
                                        style={{
                                            padding: '12px 24px',
                                            background: '#0f172a',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: '700',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {selectedMvp.stageGate === 'Proposed' ? 'Approve for Dev' : 'Next Gate →'}
                                    </button>
                                )}
                                {selectedMvp.stageGate === 'Completed' && (
                                    <button
                                        onClick={() => router.push('/adoption')}
                                        style={{
                                            padding: '12px 24px',
                                            background: '#10b981',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        Track Adoption →
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
                            <AIField label="MVP Scope" field="scope" data={selectedMvp.scope} onAccept={handleAccept} onOverride={handleOverride} type="text" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                <AIField label="Ethical Considerations" field="ethicalFlags" data={selectedMvp.ethicalFlags} onAccept={handleAccept} onOverride={handleOverride} type="json" />
                                <AIField label="Compliance Flags" field="complianceFlags" data={selectedMvp.complianceFlags} onAccept={handleAccept} onOverride={handleOverride} type="json" />
                            </div>
                            <AIField label="Success Metric" field="successMetric" data={selectedMvp.successMetric} onAccept={handleAccept} onOverride={handleOverride} type="text" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                <AIField label="Timeline" field="timeline" data={selectedMvp.timeline} onAccept={handleAccept} onOverride={handleOverride} type="text" />
                                <AIField label="Fallback Path" field="fallbackPath" data={selectedMvp.fallbackPath} onAccept={handleAccept} onOverride={handleOverride} type="text" />
                                <AIField label="Adoption Target (%)" field="adoptionTarget" data={selectedMvp.adoptionTarget} onAccept={handleAccept} onOverride={handleOverride} />
                                <AIField label="Estimated Cost (USD)" field="estimatedCost" data={selectedMvp.estimatedCost} onAccept={handleAccept} onOverride={handleOverride} />
                                <AIField label="Usage Frequency" field="usageFrequencyTarget" data={selectedMvp.usageFrequencyTarget} onAccept={handleAccept} onOverride={handleOverride} />
                                <AIField label="Technical Requirements" field="technicalRequirements" data={selectedMvp.technicalRequirements} onAccept={handleAccept} onOverride={handleOverride} type="json" />
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', padding: '30px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px' }}>
                            <h4 style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>Gate Audit History</h4>
                            {selectedMvp.gateHistory?.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No history entries yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {selectedMvp.gateHistory.map((h: any, i: number) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                            <span style={{ color: '#0f172a', fontWeight: '700' }}>{h.stage} ⮕ {h.action}</span>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: '#64748b' }}>{new Date(h.timestamp).toLocaleString()}</div>
                                                <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#94a3b8', marginTop: '2px' }}>"{h.notes}"</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px' }}>
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛡️</div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>Governance Selection Required</h2>
                            <p style={{ color: '#64748b', marginTop: '8px' }}>Select an MVP initiative from the sidebar to review stage gates.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
