import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import { loadPrompt } from '@/utils/promptLoader';
import AIClient from '@/utils/aiClient';
import AIRecommendation from '@/models/AIRecommendation';

/**
 * Route: POST /api/ai/value-cost
 * Purpose: Projects ROI and identifies value leakage risks.
 */
export const POST = withRBAC(
    Permission.VIEW_PORTFOLIO,
    async (req: NextRequest, user) => {
        try {
            const { estimatedValue, infra, dev, license, ops, timeline, valueCostId } = await req.json();

            const prompt = loadPrompt('value-cost-roi', {
                estimatedValue,
                infra,
                dev,
                license,
                ops,
                timeline
            });

            const aiResponse = await AIClient.getJSONCompletion(prompt);

            const recommendation = await AIRecommendation.create({
                subjectType: 'ValueCost',
                subjectId: valueCostId || null,
                recommendationText: JSON.stringify(aiResponse),
                confidence: aiResponse.roi?.confidence || 0,
                status: 'Proposed',
                metadata: {
                    promptModule: 'value-cost-roi',
                    generatedBy: user.id
                }
            });

            return NextResponse.json({
                success: true,
                recommendationId: recommendation._id,
                ai_data: aiResponse
            });

        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
