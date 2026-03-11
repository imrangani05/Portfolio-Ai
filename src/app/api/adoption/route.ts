export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import { loadPrompt } from '@/utils/promptLoader';
import AIClient from '@/utils/aiClient';
import MVP from '@/models/MVP';
import Adoption from '@/models/Adoption';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

/**
 * Route: POST /api/adoption
 * Purpose: Records usage metrics/feedback and triggers AI adoption analysis.
 * Aligned with SRS 6.5 & 7.5
 */
export const POST = withRBAC(
    Permission.UPDATE_MVP, // Executives can update MVPs, appropriate for adoption tracking
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { mvpId, usageCount, usageFrequency, satisfactionRating, feedback } = await req.json();

            if (!mvpId) {
                return NextResponse.json({ error: 'mvpId is mandatory' }, { status: 400 });
            }

            // 1. Fetch MVP for context
            const mvp = await MVP.findById(mvpId);
            if (!mvp) return NextResponse.json({ error: 'MVP not found' }, { status: 404 });

            // 2. Trigger AI Analysis
            const prompt = loadPrompt('adoption-analysis', {
                scope: mvp.scope.ai_value,
                usageCount,
                usageFrequency,
                feedback: feedback || 'No feedback provided.'
            });

            const aiResponse = await AIClient.getJSONCompletion(prompt);

            const operatorId = mongoose.Types.ObjectId.isValid(user.id)
                ? new mongoose.Types.ObjectId(user.id)
                : new mongoose.Types.ObjectId();

            // 3. Upsert Adoption Record
            const adoption = await Adoption.findOneAndUpdate(
                { mvpId },
                {
                    usageCount,
                    usageFrequency,
                    satisfactionRating,
                    adoptionStatus: {
                        ai_value: aiResponse.adoptionStatus?.value || 'Active',
                        ai_confidence: aiResponse.adoptionStatus?.confidence || 0,
                        ai_explanation: aiResponse.adoptionStatus?.explanation || '',
                        human_value: null // Manual decision required
                    },
                    trustFeedback: {
                        ai_value: aiResponse.trustFeedback?.value || 'Neutral',
                        ai_confidence: aiResponse.trustFeedback?.confidence || 0,
                        ai_explanation: aiResponse.trustFeedback?.explanation || '',
                        human_value: null // Manual decision required
                    },
                    barriersIdentified: {
                        ai_value: aiResponse.barriersIdentified?.value || {},
                        ai_confidence: aiResponse.barriersIdentified?.confidence || 0,
                        ai_explanation: aiResponse.barriersIdentified?.explanation || '',
                        human_value: null // Manual decision required
                    },
                    suggestedActions: {
                        ai_value: aiResponse.suggestedActions?.value || [],
                        ai_confidence: aiResponse.suggestedActions?.confidence || 0,
                        ai_explanation: aiResponse.suggestedActions?.explanation || '',
                        human_value: null // Manual decision required
                    },
                    scalingDecision: {
                        ai_value: aiResponse.scalingDecision?.value || 'Pending',
                        ai_confidence: aiResponse.scalingDecision?.confidence || 0,
                        ai_explanation: aiResponse.scalingDecision?.explanation || '',
                        human_value: null // Manual decision required
                    }
                },
                { upsert: true, new: true }
            );

            // 4. Audit Log
            await AuditLog.create({
                action: 'ADOPTION_METRICS_ANALYZED',
                entityType: 'Adoption',
                entityId: adoption._id,
                details: { status: adoption.adoptionStatus.ai_value, usageCount },
                actor: operatorId
            });

            return NextResponse.json({
                success: true,
                data: adoption
            });

        } catch (error: any) {
            console.error('[Adoption Engine Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
