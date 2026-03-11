import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import MVP from '@/models/MVP';
import { logOverride } from '@/utils/auditLogger';
import mongoose from 'mongoose';

/**
 * API Route: Override MVP AI Field
 */
export const POST = withRBAC(
    Permission.UPDATE_MVP,
    async (req: NextRequest, user) => {
        try {
            const body = await req.json();
            const { mvpId, field, humanValue, value, reason } = body;

            const finalHumanValue = humanValue !== undefined ? humanValue : value;

            if (!mvpId || !field || finalHumanValue === undefined || !reason) {
                return NextResponse.json({ error: 'Missing parameters for MVP override.' }, { status: 400 });
            }

            if (reason.trim().length < 5) {
                return NextResponse.json({ error: 'Governance Requirement: Reason must be at least 5 characters long.' }, { status: 400 });
            }

            const mvp = await MVP.findById(mvpId);
            if (!mvp) {
                return NextResponse.json({ error: 'MVP not found' }, { status: 404 });
            }

            const aiField = (mvp as any)[field];
            if (!aiField) {
                return NextResponse.json({ error: `Field "${field}" not found in MVP model.` }, { status: 400 });
            }

            const originalAiValue = aiField.ai_value;

            // Numeric or JSON enforcement
            const numericFields = ['adoptionTarget', 'usageFrequencyTarget', 'estimatedCost'];
            let processedValue = finalHumanValue;

            if (numericFields.includes(field)) {
                processedValue = Number(finalHumanValue);
                if (isNaN(processedValue)) {
                    return NextResponse.json({ error: 'Value must be a valid number.' }, { status: 400 });
                }
            } else if (typeof finalHumanValue === 'string' && (finalHumanValue.startsWith('[') || finalHumanValue.startsWith('{'))) {
                try {
                    processedValue = JSON.parse(finalHumanValue);
                } catch (e) {
                    // If not valid JSON, keep as string (e.g. user just typed a sentence starting with [)
                }
            }

            // Update record
            aiField.human_value = processedValue;
            aiField.override_reason = reason;

            const operatorId = mongoose.Types.ObjectId.isValid(user.id)
                ? new mongoose.Types.ObjectId(user.id)
                : new mongoose.Types.ObjectId();

            aiField.approved_by = operatorId;
            aiField.approved_at = new Date();

            await mvp.save();
            const populatedMvp = await MVP.findById(mvp._id).populate('useCaseId');

            // Compliance Audit
            await logOverride({
                target_table: 'MVP',
                field: field,
                record_id: mvpId,
                ai_value: originalAiValue,
                human_value: processedValue,
                reason: reason,
                user: user.id
            });

            return NextResponse.json({ success: true, data: populatedMvp });

        } catch (error: any) {
            console.error('[MVP Override Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }
);
