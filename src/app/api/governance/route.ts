export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import AuditLog from '@/models/AuditLog';

/**
 * Route: GET /api/governance
 * Purpose: Retrieves the unified governance audit ledger.
 */
export const GET = withRBAC(
    Permission.VIEW_GOVERNANCE,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const logs = await AuditLog.find()
                .sort({ timestamp: -1 })
                .limit(50); // Show last 50 events

            return NextResponse.json({ success: true, data: logs });
        } catch (error: any) {
            console.error('[Get Governance Audit Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
