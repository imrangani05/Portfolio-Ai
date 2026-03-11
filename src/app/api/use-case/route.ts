export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import { filterProtectedFields } from '@/utils/rbacHelper';
import AIUseCase from '@/models/AIUseCase';

/**
 * Route: GET /api/use-case
 * Purpose: Retrieves all AI Use Cases for the portfolio view.
 */
export const GET = withRBAC(
    Permission.VIEW_PORTFOLIO,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const useCases = await AIUseCase.find().sort({ createdAt: -1 });
            return NextResponse.json({ success: true, data: useCases });
        } catch (error: any) {
            console.error('[Get All Use Cases Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);

/**
 * Route: PUT /api/use-case
 * Purpose: Protected Update Use Case Route
 */
export const PUT = withRBAC(
    Permission.UPDATE_USE_CASE,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { id, ...updateData } = await req.json();

            // Apply field-level protection
            const sanitizedData = filterProtectedFields(user.role, updateData);

            const updatedUseCase = await AIUseCase.findByIdAndUpdate(
                id,
                { $set: sanitizedData },
                { new: true }
            );

            if (!updatedUseCase) {
                return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                data: updatedUseCase,
                ignoredFields: Object.keys(updateData).filter(key => !(key in sanitizedData))
            });

        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
