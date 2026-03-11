import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import { loadPrompt } from '@/utils/promptLoader';
import AIClient from '@/utils/aiClient';
import AIRecommendation from '@/models/AIRecommendation';

/**
 * Route: POST /api/ai/adoption-analysis
 * Purpose: Analyzes user engagement and feedback metrics.
 */
export const POST = withRBAC(
    Permission.VIEW_PORTFOLIO,
    async (req: NextRequest, user) => {
        try {
            const { userCount, frequency, satisfactionScore, feedback, adoptionId } = await req.json();

            const prompt = loadPrompt('adoption-analysis', {
                userCount,
                frequency,
                satisfactionScore,
                feedback
            });

            const aiResponse = await AIClient.getJSONCompletion(prompt);

            const recommendation = await AIRecommendation.create({
                subjectType: 'Adoption',
                subjectId: adoptionId || null,
                recommendationText: JSON.stringify(aiResponse),
                confidence: aiResponse.adoptionHealth?.confidence || 0,
                status: 'Proposed',
                metadata: {
                    promptModule: 'adoption-analysis',
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
