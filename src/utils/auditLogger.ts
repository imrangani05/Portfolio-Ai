import AuditLog from '../models/AuditLog';
import Override from '../models/Override';
import mongoose from 'mongoose';

interface LogOverrideParams {
    target_table: string;
    field: string;
    record_id: string;
    ai_value: any;
    human_value: any;
    reason: string;
    user: string; // user_id
}

/**
 * Utility for logging AI suggestions
 */
export const logAISuggestion = async (params: {
    entityType: string;
    entityId: string;
    ai_value: any;
    confidence: number;
    explanation: string;
    user: string;
}) => {
    return await AuditLog.create({
        action: 'AI_SUGGESTION',
        entityType: params.entityType,
        entityId: new mongoose.Types.ObjectId(params.entityId),
        details: {
            ai_value: params.ai_value,
            confidence: params.confidence,
            explanation: params.explanation
        },
        actor: new mongoose.Types.ObjectId(params.user)
    });
};

/**
 * Mandatory Override Logger for Governance and Compliance
 * Enforces a reason for any human override of AI values.
 */
export const logOverride = async (params: LogOverrideParams) => {
    // CRITICAL: Enforcement of mandatory reason
    if (!params.reason || params.reason.trim().length < 5) {
        throw new Error(`Governance Violation: A detailed reason is mandatory for overriding field "${params.field}" in "${params.target_table}".`);
    }

    const userId = new mongoose.Types.ObjectId(params.user);
    const recordId = new mongoose.Types.ObjectId(params.record_id);

    // 1. Create the detailed Override record
    const overrideEntry = await Override.create({
        targetTable: params.target_table,
        recordId: recordId,
        field: params.field,
        aiValue: params.ai_value,
        humanValue: params.human_value,
        reason: params.reason,
        overriddenBy: userId
    });

    // 2. Log to the primary AuditLog for a unified timeline
    await AuditLog.create({
        action: 'HUMAN_OVERRIDE',
        entityType: params.target_table,
        entityId: recordId,
        details: {
            field: params.field,
            overrideId: overrideEntry._id,
            reason: params.reason
        },
        actor: userId
    });

    return overrideEntry;
};
