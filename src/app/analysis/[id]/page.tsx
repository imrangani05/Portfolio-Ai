'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AIField from '@/components/AIField';
import WorkflowStep from '@/components/WorkflowStep';

export default function AnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const [useCase, setUseCase] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const steps = [
        { title: 'Submit AI Idea', subtitle: 'Completed', details: [] },
        { title: 'AI Suggests', subtitle: 'Active Analysis', details: ['GPT-4o Scoring', 'Confidence Metrics', 'Ethical Flags'] },
        { title: 'Human Review', subtitle: 'Pending', details: [] },
        { title: 'Build MVP', subtitle: 'Pending', details: [] },
        { title: 'Track Adoption', subtitle: 'Pending', details: [] },
        { title: 'Measure Value', subtitle: 'Pending', details: [] },
        { title: 'Decide', subtitle: 'Pending', details: [] },
    ];

    useEffect(() => {
        const fetchUseCase = async () => {
            try {
                const res = await fetch(`/api/use-case/${params.id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch analysis');
                setUseCase(data.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchUseCase();
    }, [params.id]);

    const handleAcceptField = async (field: string) => {
        try {
            const res = await fetch('/api/use-case/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ useCaseId: useCase._id, field })
            });
            const data = await res.json();
            if (res.ok) setUseCase(data.data);
            else throw new Error(data.error);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleOverrideField = async (field: string, newValue: any, reason: string) => {
        try {
            const res = await fetch('/api/use-case/override', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ useCaseId: useCase._id, field, humanValue: newValue, reason })
            });
            const data = await res.json();
            if (res.ok) setUseCase(data.data);
            else throw new Error(data.error);
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) return (
        <div style={{ padding: '100px', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #0ea5e9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <p style={{ fontWeight: '600', color: '#64748b' }}>SYNCHRONIZING WITH GOVERNANCE ENGINE...</p>
        </div>
    );

    if (error) return (
        <div style={{ maxWidth: '800px', margin: '80px auto', padding: '40px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '24px', textAlign: 'center' }}>
            <h2 style={{ color: '#b91c1c', marginBottom: '16px' }}>System Access Error</h2>
            <p style={{ color: '#991b1b', marginBottom: '24px' }}>{error}</p>
            <button onClick={() => router.push('/ideation')} style={{ background: '#b91c1c', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Return to Ideation</button>
        </div>
    );

    return (
        <div style={{ padding: '60px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Context Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '60px' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Analysis Ledger: #{useCase._id.slice(-6)}</div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>{useCase.title}</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '800px' }}>{useCase.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ padding: '8px 16px', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginRight: '8px' }}>OWNER:</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>{useCase.businessUnit} Unit</span>
                    </div>
                </div>
            </div>

            {/* Workflow Progress */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '60px', overflowX: 'auto', paddingBottom: '10px' }}>
                {steps.map((step, i) => (
                    <WorkflowStep
                        key={i}
                        number={i + 1}
                        title={step.title}
                        subtitle={step.subtitle}
                        details={step.details}
                        active={i === 1}
                    />
                ))}
            </div>

            {/* Governance Sections */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '60px', display: 'flex', flexDirection: 'column', gap: '60px' }}>

                {/* 1. Core Scoring */}
                <section>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '32px', height: '32px', background: '#0ea5e9', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</span>
                        Core AI Scoring
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <AIField label="Priority Score" field="priority" data={useCase.priority} onAccept={handleAcceptField} onOverride={handleOverrideField} />
                        <AIField label="Technical Feasibility" field="feasibility" data={useCase.feasibility} onAccept={handleAcceptField} onOverride={handleOverrideField} />
                        <AIField label="Strategic Alignment" field="strategicAlignment" data={useCase.strategicAlignment} onAccept={handleAcceptField} onOverride={handleOverrideField} />
                        <AIField label="Expected Value (USD)" field="expectedValue" data={useCase.expectedValue} onAccept={handleAcceptField} onOverride={handleOverrideField} />
                    </div>
                </section>

                {/* 2. Risk & Ethics */}
                <section>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '32px', height: '32px', background: '#ef4444', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</span>
                        Risk & Governance
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <AIField
                            label="Risk Level"
                            field="riskLevel"
                            data={useCase.riskLevel}
                            onAccept={handleAcceptField}
                            onOverride={handleOverrideField}
                            type="select"
                            options={['Low', 'Medium', 'High']}
                        />
                        <AIField label="Ethical Flags" field="ethicalFlags" data={useCase.ethicalFlags} onAccept={handleAcceptField} onOverride={handleOverrideField} type="json" />
                        <AIField label="Compliance Flags" field="complianceFlags" data={useCase.complianceFlags} onAccept={handleAcceptField} onOverride={handleOverrideField} type="json" />
                        <AIField
                            label="Heatmap Zone"
                            field="heatmapZone"
                            data={useCase.heatmapZone}
                            onAccept={handleAcceptField}
                            onOverride={handleOverrideField}
                            type="select"
                            options={['Low', 'Medium', 'High']}
                        />
                    </div>
                </section>

                {/* 3. Implementation Insights */}
                <section>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '32px', height: '32px', background: '#10b981', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>3</span>
                        Strategic Insights
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <AIField label="Model Recommendation" field="modelTypeRecommended" data={useCase.modelTypeRecommended} onAccept={handleAcceptField} onOverride={handleOverrideField} type="text" />
                        <div style={{ padding: '28px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px' }}>
                            <h4 style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '800' }}>Executive Rationale</h4>
                            <div style={{ fontSize: '1rem', lineHeight: '1.7', color: '#1e293b' }}>
                                {useCase.aiAssistantNotes || "No additional notes provided by AI for this use case."}
                            </div>
                        </div>
                    </div>
                </section>

                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                    <button
                        onClick={() => router.push('/')}
                        style={{ padding: '16px 32px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer' }}
                    >
                        Save Progress
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                setLoading(true);
                                const res = await fetch('/api/mvp/generate', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ useCaseId: useCase._id })
                                });
                                if (res.ok) router.push('/mvp');
                                else throw new Error(await res.text());
                            } catch (err: any) {
                                setError("MVP Generation Failed: " + err.message);
                                setLoading(false);
                            }
                        }}
                        style={{ padding: '16px 40px', borderRadius: '14px', border: 'none', background: '#0f172a', color: 'white', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(15,23,42,0.2)' }}
                    >
                        Approve Analysis & Generate MVP →
                    </button>
                </div>
            </div>
        </div>
    );
}
