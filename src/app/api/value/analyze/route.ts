import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import { loadPrompt } from '@/utils/promptLoader';
import AIClient from '@/utils/aiClient';
import AIUseCase from '@/models/AIUseCase';
import MVP from '@/models/MVP';
import Adoption from '@/models/Adoption';
import ValueRealization from '@/models/ValueRealization';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

/**
 * Route: POST /api/value/analyze
 * Purpose: Synthesizes all lifecycle data to determine ROI and scaling decisions.
 * Aligned with SRS 6.6 & 7.6
 */
export const POST = withRBAC(
    Permission.UPDATE_USE_CASE,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { useCaseId } = await req.json();

            if (!useCaseId) {
                return NextResponse.json({ error: 'useCaseId is mandatory' }, { status: 400 });
            }

            // 1. Holistic Context Retrieval
            const useCase = await AIUseCase.findById(useCaseId);
            const mvp = await MVP.findOne({ useCaseId });
            const adoption = await Adoption.findOne({ mvpId: mvp?._id });

            if (!useCase || !mvp) {
                return NextResponse.json({ error: 'Incomplete lifecycle data. Ensure MVP stage is reached.' }, { status: 400 });
            }

            // 2. AI Value Analysis
            const prompt = loadPrompt('value-decision-analysis', {
                plannedValue: useCase.expectedValue?.ai_value || 0,
                adoptionRate: ((adoption?.usageCount || 0) / (mvp.adoptionTarget?.ai_value || 100)) * 100,
                realizedImpact: adoption?.trustFeedback?.ai_value || 'No feedback yet.',
                tco: mvp.estimatedCost?.ai_value || 0
            });

            const aiResponse = await AIClient.getJSONCompletion(prompt);

            const operatorId = mongoose.Types.ObjectId.isValid(user.id)
                ? new mongoose.Types.ObjectId(user.id)
                : new mongoose.Types.ObjectId();

            // 3. Update Value Realization Record
            const realization = await ValueRealization.findOneAndUpdate(
                { useCaseId },
                {
                    mvpId: mvp._id,
                    plannedValue: useCase.expectedValue?.ai_value || 0,
                    realizedValue: aiResponse.revenueImpact?.value || 0,
                    totalCostOfOwnership: mvp.estimatedCost?.ai_value || 0,
                    actualROI: aiResponse.actualROI?.value || 0,
                    efficiencyGains: {
                        ai_value: aiResponse.efficiencyGains?.value || 0,
                        ai_confidence: aiResponse.efficiencyGains?.confidence || 0,
                        ai_explanation: aiResponse.efficiencyGains?.explanation || ''
                    },
                    revenueImpact: {
                        ai_value: aiResponse.revenueImpact?.value || 0,
                        ai_confidence: aiResponse.revenueImpact?.confidence || 0,
                        ai_explanation: aiResponse.revenueImpact?.explanation || ''
                    },
                    scalingRecommendation: {
                        ai_value: aiResponse.scalingRecommendation?.value || 'Maintain',
                        ai_confidence: aiResponse.scalingRecommendation?.confidence || 0,
                        ai_explanation: aiResponse.scalingRecommendation?.explanation || ''
                    },
                    decisionJustification: aiResponse.decisionJustification || '',
                    status: 'Realized'
                },
                { upsert: true, new: true }
            );

            // 4. Audit Log
            await AuditLog.create({
                action: 'VALUE_REALIZATION_ANALYZED',
                entityType: 'ValueRealization',
                entityId: realization._id,
                details: { roi: realization.actualROI, decision: realization.scalingRecommendation.ai_value },
                actor: operatorId
            });

            return NextResponse.json({
                success: true,
                data: realization
            });

        } catch (error: any) {
            console.error('[Value Engine Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
