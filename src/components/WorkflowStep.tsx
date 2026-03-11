'use client';

import React from 'react';

interface WorkflowStepProps {
    number: number;
    title: string;
    subtitle: string;
    details: string[];
    active: boolean;
    onClick?: () => void;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({ number, title, subtitle, details, active, onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                width: '180px',
                padding: '20px',
                borderRadius: '20px',
                background: active ? '#ffffff' : '#f8fafc',
                border: '2px solid',
                borderColor: active ? '#0ea5e9' : '#e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: active ? '0 10px 15px -3px rgba(14, 165, 233, 0.1), 0 4px 6px -4px rgba(14, 165, 233, 0.1)' : 'none',
                transform: active ? 'translateY(-4px)' : 'none'
            }}
        >
            {/* Number Badge */}
            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: active ? '#0ea5e9' : '#e2e8f0',
                color: active ? '#ffffff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '0.85rem',
                marginBottom: '4px'
            }}>
                {number}
            </div>

            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: active ? '#0f172a' : '#64748b', lineHeight: '1.2' }}>
                {title}
            </div>

            <div style={{ fontSize: '0.7rem', color: active ? '#0ea5e9' : '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {subtitle}
            </div>

            {/* Hover/Active Details */}
            <div style={{
                marginTop: '8px',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '8px',
                display: active ? 'block' : 'none'
            }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {details.map((detail, i) => (
                        <li key={i} style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#0ea5e9' }}></div>
                            {detail}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WorkflowStep;
