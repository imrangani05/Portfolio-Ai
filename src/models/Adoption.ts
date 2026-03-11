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

export interface IAdoption extends Document {
    mvpId: mongoose.Types.ObjectId; // Linked to MVP as per SRS 6.5

    // Usage Metrics (SRS 6.5)
    usageCount: number;
    usageFrequency: number; // Avg sessions/time
    adoptionStatus: IAIField<'Active' | 'Inactive' | 'Friction'>;

    // User Sentiment (SRS 6.5)
    trustFeedback: IAIField<string>; // Classified sentiment
    satisfactionRating: number;

    // AI Interventions (SRS 6.5)
    barriersIdentified: IAIField<any>; // JSON of friction points
    suggestedActions: IAIField<any>; // JSON of recommended interventions
    scalingDecision: IAIField<'Scaling' | 'Pivoting' | 'Sunsetting' | 'Pending'>;

    humanOverrideNotes?: string;
}

const adoptionSchema = new Schema<IAdoption>({
    mvpId: { type: Schema.Types.ObjectId, ref: 'MVP', required: true, index: true },

    usageCount: { type: Number, default: 0 },
    usageFrequency: { type: Number, default: 0 },
    adoptionStatus: AIFieldSchema(String),

    trustFeedback: AIFieldSchema(String),
    satisfactionRating: { type: Number, min: 1, max: 5 },

    barriersIdentified: AIFieldSchema(Schema.Types.Mixed),
    suggestedActions: AIFieldSchema(Schema.Types.Mixed),
    scalingDecision: AIFieldSchema(String),

    humanOverrideNotes: String
}, {
    timestamps: true
});

export default mongoose.models.Adoption || mongoose.model<IAdoption>('Adoption', adoptionSchema);
