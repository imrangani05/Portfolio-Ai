import { NextRequest, NextResponse } from 'next/server';
import { logOverride } from '@/utils/auditLogger';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import MVP from '@/models/MVP';

/**
 * API Route: Handle MVP Cost Override
 * Demonstrates the centralized audit and override logging system.
 */
export const POST = withRBAC(
    Permission.PERFORM_OVERRIDE,
    async (req: NextRequest, user) => {
        try {
            const { mvpId, field, ai_value, human_value, reason } = await req.json();

            // 1. Logic to perform the update on the target model
            // (This is just a mock update for the example)
            const updatedMvp = await MVP.findByIdAndUpdate(
                mvpId,
                { $set: { [field]: human_value } },
                { new: true }
            );

            if (!updatedMvp) {
                return NextResponse.json({ error: 'MVP record not found' }, { status: 404 });
            }

            // 2. COMPLIANCE STEP: Log the override
            // This will throw an error if "reason" is missing.
            await logOverride({
                target_table: 'MVP',
                field: field,
                record_id: mvpId,
                ai_value: ai_value,
                human_value: human_value,
                reason: reason,
                user: user.id
            });

            return NextResponse.json({
                success: true,
                message: 'Value overridden and audit logged successfully.',
                data: updatedMvp
            });

        } catch (error: any) {
            // In a real system, you'd want to handle governance errors specifically
            return NextResponse.json({
                error: error.message,
                complianceAlert: error.message.includes('Governance Violation')
            }, { status: 400 });
        }
    }
);
