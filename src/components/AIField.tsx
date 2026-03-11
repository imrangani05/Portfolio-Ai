'use client';

import React from 'react';

interface AIFieldProps {
    label: string;
    field: string;
    data: {
        ai_value: any;
        ai_confidence: number;
        ai_explanation: string;
        human_value?: any;
        override_reason?: string | null;
    };
    onAccept: (field: string) => void;
    onOverride: (field: string, newValue: any, reason: string) => void;
    type?: 'number' | 'text' | 'select' | 'json';
    options?: string[];
}

const AIField: React.FC<AIFieldProps> = ({ label, field, data, onAccept, onOverride, type = 'number', options }) => {
    const [isOverriding, setIsOverriding] = React.useState(false);
    const [overrideValue, setOverrideValue] = React.useState(data?.human_value !== null && data?.human_value !== undefined ? data.human_value : '');
    const [reason, setReason] = React.useState(data?.override_reason || '');
    const [isSuggestingReason, setIsSuggestingReason] = React.useState(false);

    // Sync state with props
    React.useEffect(() => {
        setOverrideValue(data?.human_value !== null && data?.human_value !== undefined ? data.human_value : '');
        setReason(data?.override_reason || '');
    }, [data?.human_value, data?.override_reason]);

    if (!data) return <div style={{ color: '#ef4444', padding: '20px', border: '1px dashed #ef4444', borderRadius: '12px' }}>[Error] Missing AI Data for {label}</div>;

    const handleOverrideSubmit = () => {
        onOverride(field, overrideValue, reason);
        setIsOverriding(false);
    };

    const handleSuggestReasonAI = async () => {
        if (overrideValue === undefined || overrideValue === '') return;

        setIsSuggestingReason(true);
        try {
            const res = await fetch('/api/ai/override-suggestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    field,
                    aiValue: data.ai_value,
                    humanValue: overrideValue
                })
            });
            const result = await res.json();
            if (result.success) setReason(result.suggestion);
        } catch (error) {
            console.error('Failed to get reason suggestion:', error);
        } finally {
            setIsSuggestingReason(false);
        }
    };

    const areValuesEqual = (val1: any, val2: any) => {
        if (val1 === val2) return true;
        // Smart comparison for numbers/strings
        if ((typeof val1 === 'number' || typeof val1 === 'string') && (typeof val2 === 'number' || typeof val2 === 'string') && val1 !== '' && val2 !== '') {
            const n1 = Number(val1);
            const n2 = Number(val2);
            if (!isNaN(n1) && !isNaN(n2)) return n1 === n2;
        }
        if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
            return JSON.stringify(val1) === JSON.stringify(val2);
        }
        return false;
    };

    const isAccepted = areValuesEqual(data.human_value, data.ai_value) && (data.human_value !== null && data.human_value !== undefined);
    const isOverridden = data.human_value !== null && data.human_value !== undefined && !areValuesEqual(data.human_value, data.ai_value);

    const renderValue = (val: any) => {
        if (Array.isArray(val)) {
            return (
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem' }}>
                    {val.map((item, i) => <li key={i}>{String(item)}</li>)}
                </ul>
            );
        }
        if (typeof val === 'object' && val !== null) {
            return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {Object.entries(val).map(([k, v]) => (
                        <div key={k} style={{ fontSize: '0.75rem', padding: '4px 8px', background: '#e2e8f0', borderRadius: '6px', color: '#1e293b' }}>
                            <span style={{ fontWeight: '800' }}>{k}:</span> {String(v)}
                        </div>
                    ))}
                </div>
            );
        }
        return val;
    };

    return (
        <div style={{
            padding: '28px',
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.3s',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '800' }}>{label}</h4>
                <div style={{
                    padding: '6px 14px',
                    borderRadius: '30px',
                    background: data.ai_confidence > 0.8 ? '#f0fdf4' : '#fffbeb',
                    color: data.ai_confidence > 0.8 ? '#166534' : '#92400e',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: '1px solid transparent',
                    borderColor: data.ai_confidence > 0.8 ? '#dcfce7' : '#fef3c7'
                }}>
                    {(data.ai_confidence * 100).toFixed(0)}% AI Confidence
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' }}>
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>AI SUGGESTION</div>
                    <div style={{ fontSize: typeof data.ai_value === 'object' ? '1rem' : '1.75rem', fontWeight: '900', color: '#0f172a' }}>
                        {renderValue(data.ai_value)}
                    </div>
                </div>

                <div style={{ padding: '20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>GOVERNED VALUE</div>
                    <div style={{ fontSize: typeof data.ai_value === 'object' ? '1rem' : '1.75rem', fontWeight: '900', color: isOverridden ? '#92400e' : (isAccepted ? '#166534' : '#cbd5e1') }}>
                        {data.human_value !== null ? renderValue(data.human_value) : '--'}
                    </div>
                </div>
            </div>

            <div style={{
                padding: '16px 20px',
                background: '#f1f5f9',
                borderRadius: '12px',
                marginBottom: '24px',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: '#475569',
                borderLeft: '4px solid #0ea5e9'
            }}>
                <span style={{ fontWeight: '700', color: '#0f172a', marginRight: '8px' }}>Rationale:</span>
                {data.ai_explanation}
            </div>

            {isOverridden && data.override_reason && (
                <div style={{
                    padding: '16px 20px',
                    background: '#fffbeb',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    color: '#92400e',
                    borderLeft: '4px solid #f59e0b'
                }}>
                    <span style={{ fontWeight: '700', color: '#78350f', marginRight: '8px' }}>Override Justification:</span>
                    {data.override_reason}
                </div>
            )}

            {!isOverriding ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => onAccept(field)}
                        disabled={isAccepted}
                        style={{
                            background: isAccepted ? '#f1f5f9' : '#0f172a',
                            color: isAccepted ? '#94a3b8' : '#ffffff',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: isAccepted ? 'default' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isAccepted ? 'Suggestion Accepted' : 'Accept Suggested Value'}
                    </button>
                    <button
                        onClick={() => setIsOverriding(true)}
                        style={{
                            background: '#ffffff',
                            color: '#0f172a',
                            border: '1px solid #e2e8f0',
                            padding: '12px 24px',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        {isOverridden ? 'Modify Governance' : 'Submit Manual Value'}
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>New Value:</label>
                        {type === 'select' && options ? (
                            <select
                                value={overrideValue}
                                onChange={(e) => setOverrideValue(e.target.value)}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
                            >
                                <option value="">Select Options...</option>
                                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        ) : type === 'json' ? (
                            <textarea
                                placeholder='{"key": "value"}'
                                value={typeof overrideValue === 'object' ? JSON.stringify(overrideValue) : overrideValue}
                                onChange={(e) => setOverrideValue(e.target.value)}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '60px' }}
                            />
                        ) : (
                            <input
                                type={type === 'number' ? 'number' : 'text'}
                                value={overrideValue}
                                onChange={(e) => setOverrideValue(e.target.value)}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        )}
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Mandatory Reason for Override:</label>
                            <button
                                type="button"
                                onClick={handleSuggestReasonAI}
                                disabled={isSuggestingReason || overrideValue === undefined || overrideValue === ''}
                                style={{
                                    background: 'transparent',
                                    color: '#0ea5e9',
                                    border: 'none',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    cursor: (isSuggestingReason || overrideValue === undefined || overrideValue === '') ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    opacity: (isSuggestingReason || overrideValue === undefined || overrideValue === '') ? 0.5 : 1
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2v4M2 12h4M12 22v-4M22 12h-4" />
                                    <circle cx="12" cy="12" r="4" />
                                </svg>
                                {isSuggestingReason ? 'SUGGESTING...' : 'SUGGEST WITH AI'}
                            </button>
                        </div>
                        <textarea
                            placeholder="Provide a detailed business justification (min 5 chars)..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', minHeight: '80px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {reason.length > 0 && reason.length < 5 && (
                            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>Reason too short (min 5 chars)</span>
                        )}
                        <button onClick={() => setIsOverriding(false)} style={{ background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        <button
                            onClick={handleOverrideSubmit}
                            disabled={!reason || reason.trim().length < 5 || overrideValue === undefined || overrideValue === ''}
                            style={{
                                background: (!reason || reason.trim().length < 5 || overrideValue === undefined || overrideValue === '') ? '#cbd5e1' : '#0f172a',
                                color: '#ffffff',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                border: 'none',
                                cursor: (!reason || reason.trim().length < 5 || overrideValue === undefined || overrideValue === '') ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Commit to Ledger
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIField;
