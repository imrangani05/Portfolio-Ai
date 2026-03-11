import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import AIUseCase from '@/models/AIUseCase';
import { logOverride } from '@/utils/auditLogger';
import mongoose from 'mongoose';

/**
 * API Route: Override AI Field
 * Purpose: Allows a human to explicitly override an AI-generated value.
 */
export const POST = withRBAC(
    Permission.UPDATE_USE_CASE,
    async (req: NextRequest, user) => {
        try {
            const body = await req.json();
            const { useCaseId, field, humanValue, value, reason } = body;

            // Support both 'humanValue' and 'value' for compatibility
            const finalHumanValue = humanValue !== undefined ? humanValue : value;

            console.log(`[Override Request] User: ${user.id}, Field: ${field}, Value: ${finalHumanValue}`);

            if (!useCaseId || !field || finalHumanValue === undefined || !reason) {
                const missing = [];
                if (!useCaseId) missing.push('useCaseId');
                if (!field) missing.push('field');
                if (finalHumanValue === undefined) missing.push('humanValue');
                if (!reason) missing.push('reason');

                return NextResponse.json({
                    error: `Missing parameters: ${missing.join(', ')}. Ensure all governance requirements are met.`
                }, { status: 400 });
            }

            if (reason.trim().length < 5) {
                return NextResponse.json({ error: 'Governance Requirement: Override reason must be a detailed business justification (at least 5 characters).' }, { status: 400 });
            }

            const useCase = await AIUseCase.findById(useCaseId);
            if (!useCase) {
                return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
            }

            const aiField = (useCase as any)[field];
            if (!aiField) {
                return NextResponse.json({ error: `Field "${field}" not found in Use Case model.` }, { status: 400 });
            }

            const originalAiValue = aiField.ai_value;

            // Numeric enforcement for scoring fields
            const numericFields = ['priority', 'feasibility', 'strategicAlignment', 'expectedValue'];
            const processedValue = numericFields.includes(field)
                ? Number(finalHumanValue)
                : finalHumanValue;

            if (numericFields.includes(field) && isNaN(processedValue as any)) {
                return NextResponse.json({ error: `Value for ${field} must be a valid number for governance scoring.` }, { status: 400 });
            }

            // 1. Update the record
            aiField.human_value = processedValue;
            aiField.override_reason = reason;

            const operatorId = mongoose.Types.ObjectId.isValid(user.id)
                ? new mongoose.Types.ObjectId(user.id)
                : new mongoose.Types.ObjectId(); // Fallback for dev

            aiField.approved_by = operatorId;
            aiField.approved_at = new Date();

            await useCase.save();

            // 2. Log to centralized Override/Audit system
            await logOverride({
                target_table: 'AIUseCase',
                field: field,
                record_id: useCaseId,
                ai_value: originalAiValue,
                human_value: processedValue,
                reason: reason,
                user: user.id
            });

            return NextResponse.json({ success: true, data: useCase });

        } catch (error: any) {
            console.error('[Override Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }
);
