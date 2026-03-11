import mongoose, { Schema, Document } from 'mongoose';

// Mandatory AI-assisted field structure
export interface IAIField<T> {
    ai_value: T;
    ai_confidence: number;
    ai_explanation: string;
    human_value?: T | null;
    override_reason?: string | null;
    approved_by?: mongoose.Types.ObjectId | null;
    approved_at?: Date | null;
}

const AIFieldSchema = (type: any) => ({
    ai_value: { type: type },
    ai_confidence: { type: Number, min: 0, max: 1 },
    ai_explanation: { type: String },
    human_value: { type: type, default: null },
    override_reason: { type: String, default: null },
    approved_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    approved_at: { type: Date, default: null }
});

export interface IAIUseCase extends Document {
    title: string;
    description: string;
    owner: mongoose.Types.ObjectId;
    businessUnit: string;
    status: 'Ideation' | 'In-Progress' | 'Live' | 'Archived';

    // Core Scoring (SRS 6.3)
    priority: IAIField<number>;
    feasibility: IAIField<number>;
    strategicAlignment: IAIField<number>;

    // Risk & Governance (SRS 6.3)
    riskLevel: IAIField<'Low' | 'Medium' | 'High'>;
    ethicalFlags: IAIField<any>; // JSON structure
    complianceFlags: IAIField<any>; // JSON structure

    // Strategic Insights (SRS 6.3)
    heatmapZone: IAIField<'Low' | 'Medium' | 'High'>;
    expectedValue: IAIField<number>;
    modelTypeRecommended: IAIField<string>;

    // Metadata & Taxonomy
    dependencies: string[];
    tags: string[];
    aiAssistantNotes: string;

    committeeApproval?: {
        approved: boolean;
        approvedBy: mongoose.Types.ObjectId;
        approvedAt: Date;
    };
}

const aiUseCaseSchema = new Schema<IAIUseCase>({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    businessUnit: { type: String, required: true, index: true },
    status: {
        type: String,
        enum: ['Ideation', 'In-Progress', 'Live', 'Archived'],
        default: 'Ideation'
    },

    // Core Scoring
    priority: AIFieldSchema(Number),
    feasibility: AIFieldSchema(Number),
    strategicAlignment: AIFieldSchema(Number),

    // Risk & Governance
    riskLevel: AIFieldSchema(String),
    ethicalFlags: AIFieldSchema(Schema.Types.Mixed),
    complianceFlags: AIFieldSchema(Schema.Types.Mixed),

    // Strategic Insights
    heatmapZone: AIFieldSchema(String),
    expectedValue: AIFieldSchema(Number),
    modelTypeRecommended: AIFieldSchema(String),

    // Metadata
    dependencies: [String],
    tags: [String],
    aiAssistantNotes: String,

    committeeApproval: {
        approved: { type: Boolean, default: false },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date
    }
}, {
    timestamps: true
});

aiUseCaseSchema.index({ owner: 1, status: 1 });
aiUseCaseSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.AIUseCase || mongoose.model<IAIUseCase>('AIUseCase', aiUseCaseSchema);
