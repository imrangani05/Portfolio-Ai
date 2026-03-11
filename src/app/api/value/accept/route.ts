export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import ValueRealization from '@/models/ValueRealization';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

/**
 * Route: POST /api/value/accept
 * Purpose: Manual acceptance of AI-suggested scaling decisions or metrics.
 */
export const POST = withRBAC(
    Permission.UPDATE_USE_CASE, // Re-using permission for ROI/Value updates
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { realizationId, field } = await req.json();

            if (!realizationId || !field) {
                return NextResponse.json({ error: 'realizationId and field are required' }, { status: 400 });
            }

            const realization = await ValueRealization.findById(realizationId);
            if (!realization) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

            // Accept logic: Move ai_value to human_value
            const fieldData = (realization as any)[field];
            if (!fieldData) return NextResponse.json({ error: 'Invalid field' }, { status: 400 });

            (realization as any)[field] = {
                ...fieldData,
                human_value: fieldData.ai_value,
                approved_by: new mongoose.Types.ObjectId(user.id),
                approved_at: new Date()
            };

            await realization.save();

            // Audit Log
            await AuditLog.create({
                action: `VALUE_ACCEPT_${field.toUpperCase()}`,
                entityType: 'ValueRealization',
                entityId: realization._id,
                details: { field, acceptedValue: fieldData.ai_value },
                actor: new mongoose.Types.ObjectId(user.id)
            });

            return NextResponse.json({ success: true, data: realization });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
