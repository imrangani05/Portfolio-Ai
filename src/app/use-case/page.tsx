'use client';

import React, { useState, useEffect } from 'react';
import AIField from '@/components/AIField';

export default function UseCaseManager() {
    const [useCase, setUseCase] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Mock initial load (in real app, fetch from /api/use-case/[id])
    useEffect(() => {
        setUseCase({
            _id: 'mock_123',
            title: 'AI Smart Support',
            priority: { ai_value: 7, ai_confidence: 0.85, ai_explanation: 'High volume of similar tickets.', human_value: null },
            feasibility: { ai_value: 9, ai_confidence: 0.92, ai_explanation: 'Existing text data is high quality.', human_value: null },
            strategicAlignment: { ai_value: 6, ai_confidence: 0.7, ai_explanation: 'Medium alignment with 2024 goals.', human_value: null },
            committeeApproval: { approved: false }
        });
    }, []);

    const handleAccept = async (field: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/use-case/accept', {
                method: 'POST',
                body: JSON.stringify({ useCaseId: useCase._id, field })
            });
            const result = await res.json();
            if (result.success) setUseCase(result.data);
            else setError(result.error);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOverride = async (field: string, newValue: any, reason: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/use-case/override', {
                method: 'POST',
                body: JSON.stringify({ useCaseId: useCase._id, field, humanValue: newValue, reason })
            });
            const result = await res.json();
            if (result.success) setUseCase(result.data);
            else setError(result.error);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    if (!useCase) return <div>Loading Management Console...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif' }}>
            <h1>{useCase.title} - AI Governance Console</h1>

            {error && <div style={{ color: 'red', marginBottom: '20px' }}>Error: {error}</div>}

            <div style={{ marginBottom: '30px' }}>
                <h3>AI-Assisted Metrics</h3>
                <AIField
                    label="Priority"
                    field="priority"
                    data={useCase.priority}
                    onAccept={handleAccept}
                    onOverride={handleOverride}
                />
                <AIField
                    label="Feasibility"
                    field="feasibility"
                    data={useCase.feasibility}
                    onAccept={handleAccept}
                    onOverride={handleOverride}
                />
                <AIField
                    label="Strategic Alignment"
                    field="strategicAlignment"
                    data={useCase.strategicAlignment}
                    onAccept={handleAccept}
                    onOverride={handleOverride}
                />
            </div>

            <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
                <h3>Final Governance</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" checked={useCase.committeeApproval.approved} readOnly />
                    <label>Committee Approved</label>
                </div>
            </div>

            {loading && <p>Processing Governance Decision...</p>}
        </div>
    );
}
