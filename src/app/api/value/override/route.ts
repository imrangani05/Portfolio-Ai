export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import ValueRealization from '@/models/ValueRealization';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

/**
 * Route: POST /api/value/override
 * Purpose: Manual override of AI-suggested ROI or scaling data.
 */
export const POST = withRBAC(
    Permission.UPDATE_USE_CASE,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { realizationId, field, value, reason } = await req.json();

            if (!realizationId || !field || value === undefined) {
                return NextResponse.json({ error: 'Missing required override parameters' }, { status: 400 });
            }

            const realization = await ValueRealization.findById(realizationId);
            if (!realization) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

            const fieldData = (realization as any)[field];
            if (!fieldData) return NextResponse.json({ error: 'Invalid field' }, { status: 400 });

            (realization as any)[field] = {
                ...fieldData,
                human_value: value,
                override_reason: reason,
                approved_by: new mongoose.Types.ObjectId(user.id),
                approved_at: new Date()
            };

            await realization.save();

            // Audit Log
            await AuditLog.create({
                action: `VALUE_OVERRIDE_${field.toUpperCase()}`,
                entityType: 'ValueRealization',
                entityId: realization._id,
                details: { field, manualValue: value, reason },
                actor: new mongoose.Types.ObjectId(user.id)
            });

            return NextResponse.json({ success: true, data: realization });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
