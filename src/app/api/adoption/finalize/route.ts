export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import MVP from '@/models/MVP';
import AIUseCase from '@/models/AIUseCase';
import ValueRealization from '@/models/ValueRealization';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

/**
 * Route: POST /api/adoption/finalize
 * Purpose: Finalizes the adoption analysis and transitions MVP to 'Completed'.
 */
export const POST = withRBAC(
    Permission.UPDATE_MVP,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { mvpId } = await req.json();

            if (!mvpId) {
                return NextResponse.json({ error: 'mvpId is mandatory' }, { status: 400 });
            }

            const mvp = await MVP.findById(mvpId);
            if (!mvp) return NextResponse.json({ error: 'MVP not found' }, { status: 404 });

            // 1. Update MVP stage to 'Completed'
            mvp.stageGate = 'Completed';

            // Log in history
            mvp.gateHistory.push({
                stage: 'Pilot',
                action: 'Approved',
                actor: new mongoose.Types.ObjectId(user.id),
                timestamp: new Date(),
                notes: 'Finalized Adoption & Scaling Decision.'
            });

            await mvp.save();

            // 2. Initialize Value Realization Record
            const useCase = await AIUseCase.findById(mvp.useCaseId);
            await ValueRealization.findOneAndUpdate(
                { useCaseId: mvp.useCaseId },
                {
                    mvpId: mvp._id,
                    plannedValue: useCase?.expectedValue?.ai_value || 0,
                    status: 'Tracking',
                    // Provide placeholders for mandatory AI Fields (SRS 6.6 validation)
                    efficiencyGains: {
                        ai_value: 0,
                        ai_confidence: 0,
                        ai_explanation: 'Awaiting realized performance data.'
                    },
                    revenueImpact: {
                        ai_value: 0,
                        ai_confidence: 0,
                        ai_explanation: 'Awaiting realized performance data.'
                    },
                    scalingRecommendation: {
                        ai_value: 'Maintain',
                        ai_confidence: 0,
                        ai_explanation: 'Awaiting ROI analysis.'
                    }
                },
                { upsert: true, new: true }
            );

            // 3. Audit Log
            await AuditLog.create({
                action: 'ADOPTION_FINALIZED',
                entityType: 'MVP',
                entityId: mvp._id,
                details: { decision: 'Scaled to Organization' },
                actor: new mongoose.Types.ObjectId(user.id)
            });

            return NextResponse.json({
                success: true,
                message: 'Adoption finalized and initiative transitioned to Value Realization.'
            });

        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
