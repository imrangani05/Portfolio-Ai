import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import { loadPrompt } from '@/utils/promptLoader';
import AIClient from '@/utils/aiClient';

/**
 * Route: POST /api/ai/ideation-suggestion
 * Purpose: Generates a Problem Statement and AI Solution paragraph based on limited input.
 */
export const POST = withRBAC(
    Permission.CREATE_USE_CASE,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { title, businessUnit } = await req.json();

            if (!title) {
                return NextResponse.json({ error: 'Title is mandatory' }, { status: 400 });
            }

            // 1. Prepare prompt
            const prompt = loadPrompt('ideation-suggestion', { 
                title, 
                businessUnit: businessUnit || 'General' 
            });

            // 2. Call AI Client
            const aiResponse = await AIClient.getJSONCompletion(prompt);

            return NextResponse.json({
                success: true,
                suggestion: aiResponse.suggestion
            });

        } catch (error: any) {
            console.error('[Ideation Suggestion Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
