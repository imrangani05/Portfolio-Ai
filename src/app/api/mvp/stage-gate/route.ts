import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import MVP from '@/models/MVP';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

/**
 * Route: POST /api/mvp/stage-gate
 * Purpose: Transitions an MVP through governance stage gates.
 * Aligned with SRS 7.4
 */
export const POST = withRBAC(
    Permission.UPDATE_MVP,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { mvpId, action, notes } = await req.json();

            if (!mvpId || !action) {
                return NextResponse.json({ error: 'mvpId and action (Approved|Rejected) are required' }, { status: 400 });
            }

            const mvp = await MVP.findById(mvpId);
            if (!mvp) {
                return NextResponse.json({ error: 'MVP not found' }, { status: 404 });
            }

            const operatorId = mongoose.Types.ObjectId.isValid(user.id)
                ? new mongoose.Types.ObjectId(user.id)
                : new mongoose.Types.ObjectId();

            const currentStage = mvp.stageGate;
            let nextStage = currentStage;

            if (action === 'Approved') {
                const stages: Array<'Proposed' | 'Approved' | 'Development' | 'Testing' | 'Pilot' | 'Completed' | 'Rejected'> =
                    ['Proposed', 'Approved', 'Development', 'Testing', 'Pilot', 'Completed'];
                const currentIndex = stages.indexOf(currentStage as any);
                if (currentIndex !== -1 && currentIndex < stages.length - 1) {
                    nextStage = stages[currentIndex + 1];
                }
            } else if (action === 'Rejected') {
                nextStage = 'Rejected';
            }

            // Update MVP
            mvp.stageGate = nextStage;
            mvp.gateHistory.push({
                stage: currentStage,
                action,
                actor: operatorId,
                timestamp: new Date(),
                notes: notes || `Transitioned from ${currentStage} to ${nextStage}`
            });

            await mvp.save();

            // RE-FETCH with population to ensure UI consistency
            const finalMvp = await MVP.findById(mvp._id).populate('useCaseId');

            // Audit Log
            await AuditLog.create({
                action: 'MVP_STAGE_GATE_TRANSITION',
                entityType: 'MVP',
                entityId: mvp._id,
                details: { from: currentStage, to: nextStage, action, notes },
                actor: operatorId
            });

            return NextResponse.json({
                success: true,
                data: finalMvp
            });

        } catch (error: any) {
            console.error('[Stage-Gate Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
