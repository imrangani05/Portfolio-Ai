import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import Adoption from '@/models/Adoption';

/**
 * Route: GET /api/adoption/[id]
 * Purpose: Fetches adoption metrics for a specific MVP.
 */
export const GET = withRBAC(
    Permission.VIEW_PORTFOLIO,
    async (req: NextRequest, context: any) => {
        try {
            const { id } = context.params;
            const adoption = await Adoption.findOne({ mvpId: id });

            if (!adoption) {
                return NextResponse.json({ error: 'Adoption data not found for this MVP' }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                data: adoption
            });
        } catch (error: any) {
            console.error('[Adoption Get Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
