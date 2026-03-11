import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import { loadPrompt } from '@/utils/promptLoader';
import AIClient from '@/utils/aiClient';
import AIRecommendation from '@/models/AIRecommendation';

/**
 * Route: POST /api/ai/mvp-stagegate
 * Purpose: Audits MVP readiness for scaling/stage-gate transition.
 */
export const POST = withRBAC(
    Permission.MANAGE_STAGE_GATES,
    async (req: NextRequest, user) => {
        try {
            const { useCaseDescription, scope, technicalRequirements, successCriteria, mvpId } = await req.json();

            const prompt = loadPrompt('mvp-stage-gate', {
                useCaseDescription,
                scope,
                technicalRequirements,
                successCriteria
            });

            const aiResponse = await AIClient.getJSONCompletion(prompt);

            const recommendation = await AIRecommendation.create({
                subjectType: 'MVP',
                subjectId: mvpId || null,
                recommendationText: JSON.stringify(aiResponse),
                confidence: aiResponse.readyForNextStage?.confidence || 0,
                status: 'Proposed',
                metadata: {
                    promptModule: 'mvp-stage-gate',
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
