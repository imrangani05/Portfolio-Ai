'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IdeationPage() {
    const router = useRouter();
    const [idea, setIdea] = useState({ title: '', description: '', businessUnit: 'Marketing' });
    const [loading, setLoading] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSuggestAI = async () => {
        if (!idea.title) {
            setError("Please enter a title first to get an AI suggestion.");
            return;
        }

        setSuggesting(true);
        setError(null);
        try {
            const res = await fetch('/api/ai/ideation-suggestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: idea.title,
                    businessUnit: idea.businessUnit
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to get recommendation');

            setIdea({ ...idea, description: data.suggestion });
        } catch (err: any) {
            setError(err.message);
            console.error('Suggestion Failure:', err);
        } finally {
            setSuggesting(false);
        }
    };

    const handleSubmitIdea = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/ai/usecase-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(idea)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to initiate governance scan');

            // Redirect to the dynamic analysis page
            router.push(`/analysis/${data.useCaseId}`);
        } catch (err: any) {
            setError(err.message);
            console.error('Ideation Failure:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '80px auto', padding: '0 20px', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '12px', color: 'var(--foreground)' }}>
                    Submit <span style={{ color: '#0ea5e9' }}>AI Idea</span>
                </h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>
                    Describe your AI concept to initiate the enterprise governance scan and ROI projection.
                </p>
            </div>

            <div style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
            }}>
                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem' }}>
                        <strong>Governance Error:</strong> {error}
                    </div>
                )}

                <form onSubmit={handleSubmitIdea} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Use Case Title</label>
                            <input
                                value={idea.title}
                                onChange={(e) => setIdea({ ...idea, title: e.target.value })}
                                placeholder="e.g., Customer Service Automation"
                                required
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
                                onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                            <button
                                type="button"
                                onClick={handleSuggestAI}
                                disabled={suggesting || !idea.title}
                                style={{
                                    marginTop: '8px',
                                    background: 'transparent',
                                    color: '#0ea5e9',
                                    border: '1px solid #0ea5e9',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: (suggesting || !idea.title) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    opacity: (suggesting || !idea.title) ? 0.5 : 1
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 2LDis v-2M2 12h2M12 22v-2M22 12h-2" />
                                    <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
                                </svg>
                                {suggesting ? 'SUGGESTING...' : 'SUGGEST WITH AI'}
                            </button>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Target Business Unit</label>
                            <select
                                value={idea.businessUnit}
                                onChange={(e) => setIdea({ ...idea, businessUnit: e.target.value })}
                                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none', appearance: 'none' }}
                            >
                                <option value="Marketing">Marketing</option>
                                <option value="Finance">Finance</option>
                                <option value="Operations">Operations</option>
                                <option value="HR">HR</option>
                                <option value="Product">Product</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: '700', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Problem Statement & AI Solution</label>
                        <textarea
                            value={idea.description}
                            onChange={(e) => setIdea({ ...idea, description: e.target.value })}
                            placeholder="What pain point does this solve? How will AI be used?"
                            rows={6}
                            required
                            style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', background: '#f8fafc', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
                            onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: '#0f172a',
                            color: '#ffffff',
                            padding: '18px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            border: 'none',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'RUNNING GOVERNANCE SCAN...' : 'INITIATE ANALYSIS'}
                    </button>
                </form>
            </div>

            <div style={{ marginTop: '40px', padding: '24px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ padding: '8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                </div>
                <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>Governance Note</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: '1.5' }}>
                        All submissions are immediately logged to the primary audit ledger. AI projections are generated using the approved GPT-4o Enterprise model.
                    </p>
                </div>
            </div>
        </div>
    );
}
