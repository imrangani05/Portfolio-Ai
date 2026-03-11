import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    action: string;
    entityType: string;
    entityId: mongoose.Types.ObjectId;
    details: Schema.Types.Mixed;
    actor: mongoose.Types.ObjectId;
    timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    details: { type: Schema.Types.Mixed },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true }
}, {
    // Enforce "Immutability" by disabling updates via Mongoose options where possible
    // and using caps/indexing. Note: True immutability is handled by app logic.
    versionKey: false,
    timestamps: false
});

// Prevention of accidental updates
auditLogSchema.pre('save', function (next) {
    if (!this.isNew) {
        return next(new Error('Audit logs are immutable and cannot be updated.'));
    }
    next();
});

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
