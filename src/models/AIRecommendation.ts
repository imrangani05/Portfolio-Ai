import mongoose, { Schema, Document } from 'mongoose';

export interface IAIRecommendation extends Document {
    subjectType: 'AIUseCase' | 'Portfolio' | 'ValueCost';
    subjectId: mongoose.Types.ObjectId;
    recommendationText: string;
    confidence: number;
    status: 'Pending' | 'Accepted' | 'Rejected';
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

const aiRecommendationSchema = new Schema<IAIRecommendation>({
    subjectType: {
        type: String,
        enum: ['AIUseCase', 'Portfolio', 'ValueCost'],
        required: true
    },
    subjectId: { type: Schema.Types.ObjectId, required: true, index: true },
    recommendationText: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    metadata: Schema.Types.Mixed
}, {
    timestamps: true
});

export default mongoose.models.AIRecommendation || mongoose.model<IAIRecommendation>('AIRecommendation', aiRecommendationSchema);
