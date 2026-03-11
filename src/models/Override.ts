import mongoose, { Schema, Document } from 'mongoose';

export interface IOverride extends Document {
    targetTable: string;
    recordId: mongoose.Types.ObjectId;
    field: string;
    aiValue: any;
    humanValue: any;
    reason: string;
    overriddenBy: mongoose.Types.ObjectId;
    timestamp: Date;
}

const overrideSchema = new Schema<IOverride>({
    targetTable: { type: String, required: true, index: true },
    recordId: { type: Schema.Types.ObjectId, required: true, index: true },
    field: { type: String, required: true },
    aiValue: { type: Schema.Types.Mixed },
    humanValue: { type: Schema.Types.Mixed },
    reason: { type: String, required: true },
    overriddenBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: false
});

overrideSchema.index({ timestamp: -1 });

export default mongoose.models.Override || mongoose.model<IOverride>('Override', overrideSchema);
