import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import MVP from '@/models/MVP';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

/**
 * API Route: Accept AI Suggestion for MVP
 */
export const POST = withRBAC(
    Permission.UPDATE_MVP,
    async (req: NextRequest, user) => {
        try {
            const { mvpId, field } = await req.json();

            if (!mvpId || !field) {
                return NextResponse.json({ error: 'Missing required parameters: mvpId and field' }, { status: 400 });
            }

            const mvp = await MVP.findById(mvpId);
            if (!mvp) {
                return NextResponse.json({ error: 'MVP not found' }, { status: 404 });
            }

            const aiField = (mvp as any)[field];
            if (!aiField || aiField.ai_value === undefined) {
                return NextResponse.json({ error: `Field "${field}" is not an AI-assisted field.` }, { status: 400 });
            }

            const operatorId = mongoose.Types.ObjectId.isValid(user.id)
                ? new mongoose.Types.ObjectId(user.id)
                : new mongoose.Types.ObjectId();

            // Transition AI value to human value
            aiField.human_value = aiField.ai_value;
            aiField.approved_by = operatorId;
            aiField.approved_at = new Date();
            aiField.override_reason = null;

            await mvp.save();
            const populatedMvp = await MVP.findById(mvp._id).populate('useCaseId');

            // Audit the acceptance
            await AuditLog.create({
                action: 'MVP_AI_SUGGESTION_ACCEPTED',
                entityType: 'MVP',
                entityId: mvp._id,
                details: { field, value: aiField.ai_value },
                actor: operatorId
            });

            return NextResponse.json({ success: true, data: populatedMvp });

        } catch (error: any) {
            console.error('[MVP Accept Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
