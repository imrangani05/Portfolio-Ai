import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import { loadPrompt } from '@/utils/promptLoader';
import AIClient from '@/utils/aiClient';
import AIRecommendation from '@/models/AIRecommendation';

/**
 * Route: POST /api/ai/portfolio
 * Purpose: Strategic advisor for the entire AI portfolio.
 */
export const POST = withRBAC(
    Permission.EXPORT_REPORTS,
    async (req: NextRequest, user) => {
        try {
            const { totalUseCases, statusDistribution, aggregateRoi, topUnit } = await req.json();

            const prompt = loadPrompt('portfolio-recommendation', {
                totalUseCases,
                statusDistribution,
                aggregateRoi,
                topUnit
            });

            const aiResponse = await AIClient.getJSONCompletion(prompt);

            const recommendation = await AIRecommendation.create({
                subjectType: 'PortfolioSnapshot',
                subjectId: null, // Global recommendation
                recommendationText: JSON.stringify(aiResponse),
                confidence: aiResponse.strategy?.confidence || 0,
                status: 'Proposed',
                metadata: {
                    promptModule: 'portfolio-recommendation',
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
