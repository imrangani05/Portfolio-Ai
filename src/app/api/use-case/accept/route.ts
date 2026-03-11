import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import AIUseCase from '@/models/AIUseCase';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

/**
 * API Route: Accept AI Suggestion
 * Purpose: Transitions an AI-generated value to a governed human value.
 */
export const POST = withRBAC(
    Permission.UPDATE_USE_CASE,
    async (req: NextRequest, user) => {
        try {
            const { useCaseId, field } = await req.json();

            if (!useCaseId || !field) {
                return NextResponse.json({ error: 'Missing required parameters: useCaseId and field' }, { status: 400 });
            }

            const useCase = await AIUseCase.findById(useCaseId);
            if (!useCase) {
                return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
            }

            const aiField = (useCase as any)[field];
            if (!aiField || aiField.ai_value === undefined) {
                return NextResponse.json({ error: `Field "${field}" is not an AI-assisted field.` }, { status: 400 });
            }

            const operatorId = mongoose.Types.ObjectId.isValid(user.id)
                ? new mongoose.Types.ObjectId(user.id)
                : new mongoose.Types.ObjectId(); // Fallback for dev

            // Transition AI value to human value
            aiField.human_value = aiField.ai_value;
            aiField.approved_by = operatorId;
            aiField.approved_at = new Date();
            aiField.override_reason = null; // Reset if it was previously overridden

            await useCase.save();

            // Audit the acceptance
            await AuditLog.create({
                action: 'AI_SUGGESTION_ACCEPTED',
                entityType: 'AIUseCase',
                entityId: useCase._id,
                details: { field, value: aiField.ai_value },
                actor: operatorId
            });

            return NextResponse.json({ success: true, data: useCase });

        } catch (error: any) {
            console.error('[Accept Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
