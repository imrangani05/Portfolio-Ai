import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import Adoption from '@/models/Adoption';
import { logOverride } from '@/utils/auditLogger';
import mongoose from 'mongoose';

/**
 * Route: POST /api/adoption/override
 * Purpose: Manually overrides an AI-suggested adoption metric with human governance.
 */
export const POST = withRBAC(
    Permission.PERFORM_OVERRIDE,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { mvpId, field, value, reason } = await req.json();

            if (!mvpId || !field || value === undefined) {
                return NextResponse.json({ error: 'Missing parameters (mvpId, field, value)' }, { status: 400 });
            }

            if (!reason || reason.trim().length < 5) {
                return NextResponse.json({ error: 'A valid business justification (min 5 characters) is required for overrides.' }, { status: 400 });
            }

            const adoption = await Adoption.findOne({ mvpId });
            if (!adoption) {
                return NextResponse.json({ error: 'Adoption record not found' }, { status: 404 });
            }

            const aiField = (adoption as any)[field];
            if (!aiField) {
                return NextResponse.json({ error: `Field "${field}" not found in Adoption model.` }, { status: 400 });
            }

            const originalAiValue = aiField.ai_value;

            // Handle potential JSON strings for complex fields
            let processedValue = value;
            if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                try {
                    processedValue = JSON.parse(value);
                } catch (e) {
                    // Fallback to string if parsing fails
                }
            }

            const operatorId = mongoose.Types.ObjectId.isValid(user.id)
                ? new mongoose.Types.ObjectId(user.id)
                : new mongoose.Types.ObjectId();

            // Update record
            aiField.human_value = processedValue;
            aiField.override_reason = reason;
            aiField.approved_by = operatorId;
            aiField.approved_at = new Date();

            await adoption.save();

            // Compliance Audit
            await logOverride({
                target_table: 'Adoption',
                field: field,
                record_id: adoption._id.toString(),
                ai_value: originalAiValue,
                human_value: processedValue,
                reason: reason,
                user: user.id
            });

            return NextResponse.json({ success: true, data: adoption });

        } catch (error: any) {
            console.error('[Adoption Override Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
