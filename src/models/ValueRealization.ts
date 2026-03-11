import mongoose, { Schema, Document } from 'mongoose';
import { IAIField } from './AIUseCase';

const AIFieldSchema = (type: any) => ({
    ai_value: { type: type },
    ai_confidence: { type: Number, min: 0, max: 1 },
    ai_explanation: { type: String },
    human_value: { type: type, default: null },
    override_reason: { type: String, default: null },
    approved_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    approved_at: { type: Date, default: null }
});

export interface IValueRealization extends Document {
    useCaseId: mongoose.Types.ObjectId;
    mvpId: mongoose.Types.ObjectId;

    // Financial Baseline vs Actual (SRS 6.6)
    plannedValue: number; // Baseline from Ideation/MVP
    realizedValue: number; // Measured value
    totalCostOfOwnership: number; // CapEx + OpEx
    actualROI: number; // ((Realized - Cost) / Cost) * 100

    // Impact Metrics (SRS 6.6)
    efficiencyGains: IAIField<number>; // % improvement
    revenueImpact: IAIField<number>; // $ contribution

    // Decision Hub (SRS 6.6)
    scalingRecommendation: IAIField<'Scale' | 'Maintain' | 'Optimize' | 'Retire'>;
    decisionJustification: string;

    status: 'Tracking' | 'Realized' | 'Decided';
}

const valueRealizationSchema = new Schema<IValueRealization>({
    useCaseId: { type: Schema.Types.ObjectId, ref: 'AIUseCase', required: true, index: true },
    mvpId: { type: Schema.Types.ObjectId, ref: 'MVP', required: true, index: true },

    plannedValue: { type: Number, default: 0 },
    realizedValue: { type: Number, default: 0 },
    totalCostOfOwnership: { type: Number, default: 0 },
    actualROI: { type: Number, default: 0 },

    efficiencyGains: AIFieldSchema(Number),
    revenueImpact: AIFieldSchema(Number),

    scalingRecommendation: AIFieldSchema(String),
    decisionJustification: String,

    status: {
        type: String,
        enum: ['Tracking', 'Realized', 'Decided'],
        default: 'Tracking'
    }
}, {
    timestamps: true
});

export default mongoose.models.ValueRealization || mongoose.model<IValueRealization>('ValueRealization', valueRealizationSchema);
