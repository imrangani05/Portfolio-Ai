import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import AIUseCase from '@/models/AIUseCase';

/**
 * Route: GET /api/use-case/[id]
 * Purpose: Retrieves a single AI Use Case by ID.
 * The handler signature must match withRBAC expectation: (req, user, context)
 */
export const GET = withRBAC(
    Permission.VIEW_PORTFOLIO,
    async (req: NextRequest, user: { id: string; role: Role }, context: { params: { id: string } }) => {
        try {
            const id = context?.params?.id;

            if (!id) {
                return NextResponse.json({ error: 'Missing Use Case ID' }, { status: 400 });
            }

            const useCase = await AIUseCase.findById(id);

            if (!useCase) {
                return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true, data: useCase });

        } catch (error: any) {
            console.error('[Get Use Case Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
