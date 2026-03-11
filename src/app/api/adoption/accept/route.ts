import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import Adoption from '@/models/Adoption';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

/**
 * Route: POST /api/adoption/accept
 * Purpose: Transitions an AI-suggested adoption value to the governed human value.
 */
export const POST = withRBAC(
    Permission.PERFORM_OVERRIDE,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { mvpId, field } = await req.json();

            if (!mvpId || !field) {
                return NextResponse.json({ error: 'mvpId and field are required' }, { status: 400 });
            }

            const adoption = await Adoption.findOne({ mvpId });
            if (!adoption) {
                return NextResponse.json({ error: 'Adoption record not found' }, { status: 404 });
            }

            const aiField = (adoption as any)[field];
            if (!aiField || aiField.ai_value === undefined) {
                return NextResponse.json({ error: `Field "${field}" is not a valid AI field or has no AI value.` }, { status: 400 });
            }

            const operatorId = mongoose.Types.ObjectId.isValid(user.id)
                ? new mongoose.Types.ObjectId(user.id)
                : new mongoose.Types.ObjectId();

            // Transition AI value to human value
            aiField.human_value = aiField.ai_value;
            aiField.approved_by = operatorId;
            aiField.approved_at = new Date();
            aiField.override_reason = null;

            await adoption.save();

            // Audit the acceptance
            await AuditLog.create({
                action: 'ADOPTION_AI_SUGGESTION_ACCEPTED',
                entityType: 'Adoption',
                entityId: adoption._id,
                details: { field, value: aiField.ai_value },
                actor: operatorId
            });

            return NextResponse.json({ success: true, data: adoption });

        } catch (error: any) {
            console.error('[Adoption Accept Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
