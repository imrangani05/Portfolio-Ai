'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRole, Role } from '@/context/RoleContext';
import LoginComponent from '@/components/LoginComponent';

const roleBranding: Record<Role, { title: string; description: string; accentColor: string }> = {
    'Admin': {
        title: 'System Administrator',
        description: 'Complete platform control and infrastructure management.',
        accentColor: '#0f172a'
    },
    'Executive': {
        title: 'Executive Strategic Portal',
        description: 'Portfolio ROI metrics and strategic alignment oversight.',
        accentColor: '#0ea5e9'
    },
    'AI Product Owner': {
        title: 'AI Product Command',
        description: 'Lifecycle management and pipeline velocity tracking.',
        accentColor: '#8b5cf6'
    },
    'Risk Officer': {
        title: 'Governance & Compliance',
        description: 'Strict audit trails and ethical AI risk management.',
        accentColor: '#dc2626'
    },
    'Developer': {
        title: 'Engineering Sandbox',
        description: 'Technical implementation, APIs, and model health.',
        accentColor: '#16a34a'
    },
    'Analyst': {
        title: 'Intelligence Hub',
        description: 'Deep-dive data analysis and performance auditing.',
        accentColor: '#f59e0b'
    },
    'Business Owner': {
        title: 'Business Value Desk',
        description: 'KPI tracking and business impact realization.',
        accentColor: '#ec4899'
    },
    'End User': {
        title: 'AI Adoption Portal',
        description: 'Interactive tools and feedback loops.',
        accentColor: '#6366f1'
    },
    'Viewer': {
        title: 'Portfolio Viewer',
        description: 'Transparent overview of the AI ecosystem.',
        accentColor: '#64748b'
    }
};

export default function RoleLoginPage() {
    const router = useRouter();
    const params = useParams();
    const { login } = useRole();

    // Map URL slugs back to Role enum
    const rawRole = params.role as string;
    const roleMap: Record<string, Role> = {
        'executive': 'Executive',
        'business-owner': 'Business Owner',
        'ai-product-owner': 'AI Product Owner',
        'risk-officer': 'Risk Officer',
        'developer': 'Developer',
        'end-user': 'End User',
        'admin': 'Admin',
        'analyst': 'Analyst',
        'viewer': 'Viewer'
    };

    const formattedRole = roleMap[rawRole] || 'Viewer' as Role;

    const branding = roleBranding[formattedRole] || roleBranding['Viewer'];

    const handleLogin = async (username: string, password?: string) => {
        await login(formattedRole, { username, password });
        router.push('/');
    };

    return (
        <LoginComponent
            role={formattedRole}
            onLogin={handleLogin}
            branding={branding}
        />
    );
}
