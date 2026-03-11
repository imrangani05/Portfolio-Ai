import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import MVP from '@/models/MVP';

/**
 * Route: GET /api/mvp
 * Purpose: Fetches all listed MVPs with their associated Use Cases.
 */
export const GET = withRBAC(
    Permission.VIEW_PORTFOLIO,
    async (req: NextRequest) => {
        try {
            const mvps = await MVP.find()
                .populate('useCaseId')
                .sort({ updatedAt: -1 });

            return NextResponse.json({
                success: true,
                data: mvps
            });
        } catch (error: any) {
            console.error('[MVP Fetch Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
