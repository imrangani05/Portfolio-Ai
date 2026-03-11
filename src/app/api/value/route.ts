export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import ValueRealization from '@/models/ValueRealization';

/**
 * Route: GET /api/value
 * Purpose: Fetches all value realization records with associated Use Cases.
 */
export const GET = withRBAC(
    Permission.VIEW_PORTFOLIO,
    async (req: NextRequest) => {
        try {
            const realizations = await ValueRealization.find()
                .populate('useCaseId')
                .sort({ actualROI: -1 }); // Rank by ROI

            return NextResponse.json({
                success: true,
                data: realizations
            });
        } catch (error: any) {
            console.error('[Value Fetch Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
