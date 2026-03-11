import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import MVP from '@/models/MVP';
import { logAISuggestion } from '@/utils/auditLogger';
import mongoose from 'mongoose';

/**
 * API Route: Create MVP Proposal
 * Purpose: Creates an MVP with AI-recommended values for scope, cost, and adoption.
 */
export const POST = withRBAC(
    Permission.CREATE_USE_CASE,
    async (req: NextRequest, user) => {
        try {
            const { useCaseId, timeline, technicalRequirements, successCriteria, aiRecommendations } = await req.json();

            if (!useCaseId || !timeline) {
                return NextResponse.json({ error: 'Missing required MVP fields' }, { status: 400 });
            }

            // Create MVP with AI suggestions
            const mvp = await MVP.create({
                useCaseId: new mongoose.Types.ObjectId(useCaseId),
                timeline,
                technicalRequirements,
                successCriteria,
                scope: aiRecommendations.scope,
                costEstimate: aiRecommendations.cost,
                projectedAdoption: aiRecommendations.adoption,
                status: 'Proposed'
            });

            return NextResponse.json({
                success: true,
                data: mvp
            });

        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
