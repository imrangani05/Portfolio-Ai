import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import { loadPrompt } from '@/utils/promptLoader';
import AIClient from '@/utils/aiClient';

/**
 * Route: POST /api/ai/override-suggestion
 * Purpose: Generates a professional justification for a manual override.
 */
export const POST = withRBAC(
    Permission.UPDATE_USE_CASE,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { field, aiValue, humanValue } = await req.json();

            if (!field || aiValue === undefined || humanValue === undefined) {
                return NextResponse.json({ error: 'Missing parameters for suggestion engine.' }, { status: 400 });
            }

            // 1. Prepare prompt
            const prompt = loadPrompt('override-suggestion', {
                field,
                aiValue: JSON.stringify(aiValue),
                humanValue: JSON.stringify(humanValue)
            });

            // 2. Call AI Client
            const aiResponse = await AIClient.getJSONCompletion(prompt);

            return NextResponse.json({
                success: true,
                suggestion: aiResponse.suggestion
            });

        } catch (error: any) {
            console.error('[Override Suggestion Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
