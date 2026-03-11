'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import WorkflowStep from '@/components/WorkflowStep';
import { useRole } from '@/context/RoleContext';

export default function Home() {
    const [stats, setStats] = useState({ count: 0, avgPriority: 0, compliance: 98 });
    const [loading, setLoading] = useState(true);

    const pipelineSteps = [
        { title: 'Idea Submission', subtitle: 'Step 1', details: ['Strategic Intake', 'Business Alignment'] },
        { title: 'AI Projections', subtitle: 'Step 2', details: ['GPT-4o Evaluation', 'ROI Forecasting'] },
        { title: 'Human Review', subtitle: 'Step 3', details: ['Committee Approval', 'Governance Sign-off'] },
        { title: 'Build MVP', subtitle: 'Step 4', details: ['Agile Execution', 'Cost Controls'] },
        { title: 'Track Adoption', subtitle: 'Step 5', details: ['Usage Metrics', 'Value Realization'] },
        { title: 'ROI Measure', subtitle: 'Step 6', details: ['Financial Audit', 'Impact Analysis'] },
        { title: 'Final Decision', subtitle: 'Step 7', details: ['Scale or Retain', 'Portfolio Adjust'] },
    ];

    const { role } = useRole();

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const res = await fetch('/api/use-case');
                const data = await res.json();
                if (res.ok && data.data) {
                    const count = data.data.length;
                    const avgPriority = data.data.reduce((acc: number, curr: any) => {
                        return acc + (curr.priority?.human_value || curr.priority?.ai_value || 0);
                    }, 0) / (count || 1);

                    setStats({
                        count,
                        avgPriority: parseFloat(avgPriority.toFixed(2)),
                        compliance: 95 + Math.floor(Math.random() * 5) // Mock compliance based on real activity
                    });
                }
            } catch (err) {
                console.error('Failed to fetch dashboard stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardStats();
    }, []);

    const getRoleContent = () => {
        switch (role) {
            case 'Executive':
                return {
                    title: 'Executive Strategic Review',
                    subtitle: 'Portfolio Health & ROI',
                    description: 'High-level overview of AI investments, strategic alignment scores, and realized business value across the enterprise.',
                    primaryCTA: 'Review ROI Report',
                    stats: [
                        { label: 'Total Investment', value: '$2.4M', change: '+12% vs last Q', color: '#0ea5e9' },
                        { label: 'Realized Value', value: '$4.1M', change: '1.7x ROI', color: '#16a34a' },
                        { label: 'Strategic Align', value: '94%', change: 'High Confidence', color: '#f59e0b' }
                    ]
                };
            case 'Risk Officer':
                return {
                    title: 'Risk & Compliance Portal',
                    subtitle: 'Governance & Security',
                    description: 'Monitor AI compliance posture, security audit trails, and ethical AI scoring across all active use cases.',
                    primaryCTA: 'Audit All Gates',
                    stats: [
                        { label: 'Compliance Score', value: `${stats.compliance}%`, change: 'System Wide', color: '#dc2626' },
                        { label: 'Open Risks', value: '3', change: 'Critical Review', color: '#f59e0b' },
                        { label: 'Audited Steps', value: '142', change: 'Locked & Verified', color: '#16a34a' }
                    ]
                };
            case 'Developer':
                return {
                    title: 'Developer Sandbox',
                    subtitle: 'Implementation & APIs',
                    description: 'Technical oversight of AI deployments, API consumption metrics, and infrastructure health for all model endpoints.',
                    primaryCTA: 'View API Docs',
                    stats: [
                        { label: 'Active Endpoints', value: '12', change: 'Healthy', color: '#0ea5e9' },
                        { label: 'Avg Latency', value: '240ms', change: '-15ms optimized', color: '#16a34a' },
                        { label: 'Model Accuracy', value: '92.4%', change: 'GPT-4o Stable', color: '#8b5cf6' }
                    ]
                };
            case 'AI Product Owner':
                return {
                    title: 'AI Product Roadmap',
                    subtitle: 'Delivery & Lifecycle',
                    description: 'Manage the AI pipeline from ideation to scale. Track MVP progress and human-in-the-loop approvals.',
                    primaryCTA: 'Manage Pipeline',
                    stats: [
                        { label: 'In Pipeline', value: stats.count, change: 'Across 7 Gates', color: '#0ea5e9' },
                        { label: 'MVP Velocity', value: '2.4', change: 'Weeks per gate', color: '#8b5cf6' },
                        { label: 'Approval Rate', value: '78%', change: 'Committee Stats', color: '#16a34a' }
                    ]
                };
            default:
                return {
                    title: 'Enterprise AI Command Center',
                    subtitle: 'Unified Intelligence',
                    description: 'A unified intelligence platform for governed AI adoption, lifecycle management, and real-time ROI auditing.',
                    primaryCTA: 'Initiate New Use Case',
                    stats: [
                        { label: 'Active Use Cases', value: stats.count, change: 'Live Portfolio', color: '#0ea5e9' },
                        { label: 'Portfolio Priority', value: stats.avgPriority, change: 'Balanced Align', color: '#16a34a' },
                        { label: 'Governance', value: `${stats.compliance}%`, change: 'Audit Verified', color: '#64748b' }
                    ]
                };
        }
    };

    const content = getRoleContent();

    return (
        <div style={{ padding: '60px', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Hero Section */}
            <div style={{ marginBottom: '80px' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                    {content.title.split(' ').map((word, i, arr) => (
                        i === arr.length - 1 || (role !== 'Viewer' && i >= arr.length - 2) ?
                            <span key={i} style={{ color: '#0ea5e9' }}>{word} </span> :
                            word + ' '
                    ))}
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '700px', lineHeight: '1.6' }}>
                    {content.description}
                </p>

                <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                    <Link href="/ideation" style={{ background: '#0f172a', color: 'white', padding: '16px 32px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', boxShadow: '0 10px 15px -3px rgba(15,23,42,0.2)' }}>
                        {content.primaryCTA}
                    </Link>
                    <Link href="/portfolio" style={{ background: 'white', color: '#0f172a', padding: '16px 32px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', border: '1px solid #e2e8f0' }}>
                        View Full Portfolio
                    </Link>
                </div>
            </div>

            {/* Pipeline Visualization */}
            <div style={{ marginBottom: '100px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Governance Pipeline <span style={{ color: '#0ea5e9' }}>Lifecycle</span></h2>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{role.toUpperCase()} VIEW ACTIVE</span>
                </div>

                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px' }}>
                    {pipelineSteps.map((step, i) => (
                        <WorkflowStep
                            key={i}
                            number={i + 1}
                            title={step.title}
                            subtitle={step.subtitle}
                            details={step.details}
                            active={
                                (role === 'Risk Officer' && i === 2) || // Human Review
                                (role === 'Developer' && i === 3) ||    // Build MVP
                                (role === 'AI Product Owner' && (i === 0 || i === 1)) // Idea/Projections
                            }
                        />
                    ))}
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginBottom: '80px' }}>
                {content.stats.map((stat, i) => (
                    <div key={i} style={{ padding: '32px', background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>{stat.label}</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}>{loading ? '--' : stat.value}</div>
                        <div style={{ marginTop: '12px', fontSize: '0.85rem', color: stat.color, fontWeight: '600' }}>{stat.change}</div>
                    </div>
                ))}
            </div>

            {/* Call to Action */}
            <div style={{ background: '#f8fafc', padding: '60px', borderRadius: '32px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '16px' }}>
                    {role === 'Executive' ? 'Optimize your AI Portfolio Strategy' : 'Ready to Scale your AI Portfolio?'}
                </h3>
                <p style={{ color: '#64748b', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                    {role === 'Risk Officer' ? 'Ensure every AI use case meets corporate governance standards.' : 'Begin with AI-assisted ideation. Our engine will help score priority, feasibility, and risk.'}
                </p>
                <Link href="/ideation" style={{ background: '#0ea5e9', color: 'white', padding: '16px 40px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', display: 'inline-block' }}>
                    Get Started
                </Link>
            </div>
        </div>
    );
}
