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

export interface IMVP extends Document {
    useCaseId: mongoose.Types.ObjectId;

    // Core MVP Metadata (SRS 6.4)
    scope: IAIField<string>;
    successMetric: IAIField<string>;
    fallbackPath: IAIField<string>;

    // Stage Gate & Stats (SRS 6.4)
    stageGate: 'Proposed' | 'Approved' | 'Development' | 'Testing' | 'Pilot' | 'Completed' | 'Rejected';
    adoptionTarget: IAIField<number>; // % target
    usageFrequencyTarget: IAIField<number>; // sessions/week or similar
    estimatedCost: IAIField<number>;

    // Risk & Governance (SRS 6.3/6.4)
    ethicalFlags: IAIField<any>;
    complianceFlags: IAIField<any>;

    // Technicals
    technicalRequirements: IAIField<string[]>;
    timeline: IAIField<string>;

    // Confidence & Rationale
    aiConfidence: number;
    aiRecommendation: any; // JSON recommendations

    gateHistory: Array<{
        stage: string;
        action: 'Approved' | 'Rejected';
        actor: mongoose.Types.ObjectId;
        timestamp: Date;
        notes: string;
    }>;
}

const mvpSchema = new Schema<IMVP>({
    useCaseId: { type: Schema.Types.ObjectId, ref: 'AIUseCase', required: true, index: true },

    // Core Metadata
    scope: AIFieldSchema(String),
    successMetric: AIFieldSchema(String),
    fallbackPath: AIFieldSchema(String),

    // Stage Gates & Targets
    stageGate: {
        type: String,
        enum: ['Proposed', 'Approved', 'Development', 'Testing', 'Pilot', 'Completed', 'Rejected'],
        default: 'Proposed'
    },
    adoptionTarget: AIFieldSchema(Number),
    usageFrequencyTarget: AIFieldSchema(Number),
    estimatedCost: AIFieldSchema(Number),

    // Risk & Governance
    ethicalFlags: AIFieldSchema(Schema.Types.Mixed),
    complianceFlags: AIFieldSchema(Schema.Types.Mixed),

    // Technicals
    technicalRequirements: AIFieldSchema([String]),
    timeline: AIFieldSchema(String),

    // Intelligence
    aiConfidence: { type: Number, default: 0 },
    aiRecommendation: { type: Schema.Types.Mixed },

    gateHistory: [{
        stage: String,
        action: { type: String, enum: ['Approved', 'Rejected'] },
        actor: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        notes: String
    }]
}, {
    timestamps: true
});

// Force delete model Cache to resolve CastErrors in dev mode
if (mongoose.models.MVP) {
    delete mongoose.models.MVP;
}

const MVP = mongoose.models.MVP || mongoose.model<IMVP>('MVP', mvpSchema);
export default MVP;
