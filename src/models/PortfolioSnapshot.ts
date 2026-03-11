import mongoose, { Schema, Document } from 'mongoose';
import { IAIField } from './AIUseCase';

export interface IPortfolioSnapshot extends Document {
    snapshotDate: Date;
    totalUseCases: number;
    activeUseCases: number;
    aggregateValue: {
        estimated: number;
        actual: number;
    };
    statusDistribution: Map<string, number>;
    businessUnitDistribution: Map<string, number>;
    topPerformers: Array<{
        useCaseId: mongoose.Types.ObjectId;
        roi: number;
    }>;
    aggregateRoi: IAIField<number>;
    costEfficiency: IAIField<number>;
    strategicAlignmentScore: IAIField<number>;
}

const AIFieldSchema = (type: any) => ({
    ai_value: { type: type, required: true },
    ai_confidence: { type: Number, required: true, min: 0, max: 1 },
    ai_explanation: { type: String, required: true },
    human_value: { type: type, default: null },
    override_reason: { type: String, default: null },
    approved_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    approved_at: { type: Date, default: null }
});

const portfolioSnapshotSchema = new Schema<IPortfolioSnapshot>({
    snapshotDate: { type: Date, default: Date.now, index: true },
    totalUseCases: Number,
    activeUseCases: Number,
    aggregateValue: {
        estimated: Number,
        actual: Number
    },
    statusDistribution: { type: Map, of: Number },
    businessUnitDistribution: { type: Map, of: Number },
    topPerformers: [{
        useCaseId: { type: Schema.Types.ObjectId, ref: 'AIUseCase' },
        roi: Number
    }],
    aggregateRoi: AIFieldSchema(Number),
    costEfficiency: AIFieldSchema(Number),
    strategicAlignmentScore: AIFieldSchema(Number)
}, {
    timestamps: true
});

export default mongoose.models.PortfolioSnapshot || mongoose.model<IPortfolioSnapshot>('PortfolioSnapshot', portfolioSnapshotSchema);
