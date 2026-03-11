import mongoose, { Schema, Document } from 'mongoose';
import { IAIField } from './AIUseCase';

const AIFieldSchema = (type: any) => ({
    ai_value: { type: type, required: true },
    ai_confidence: { type: Number, required: true, min: 0, max: 1 },
    ai_explanation: { type: String, required: true },
    human_value: { type: type, default: null },
    override_reason: { type: String, default: null },
    approved_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    approved_at: { type: Date, default: null }
});

export interface IValueCost extends Document {
    useCaseId: mongoose.Types.ObjectId;
    estimatedValue: IAIField<number>;
    actualValue?: number;
    cost: {
        infrastructure: number;
        development: number;
        license: number;
        operational: number;
    };
    currency: string;
    roi?: number;
    roiProjection: IAIField<number>;
    valueLeakageRisk: IAIField<string>;
}

const valueCostSchema = new Schema<IValueCost>({
    useCaseId: { type: Schema.Types.ObjectId, ref: 'AIUseCase', required: true, unique: true, index: true },
    estimatedValue: AIFieldSchema(Number),
    actualValue: Number,
    cost: {
        infrastructure: { type: Number, default: 0 },
        development: { type: Number, default: 0 },
        license: { type: Number, default: 0 },
        operational: { type: Number, default: 0 }
    },
    currency: { type: String, default: 'USD' },
    roi: Number,
    roiProjection: AIFieldSchema(Number),
    valueLeakageRisk: AIFieldSchema(String)
}, {
    timestamps: true
});

export default mongoose.models.ValueCost || mongoose.model<IValueCost>('ValueCost', valueCostSchema);
