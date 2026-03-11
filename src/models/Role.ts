import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
    name: string;
    permissions: string[];
    description?: string;
}

const roleSchema = new Schema<IRole>({
    name: { type: String, required: true, unique: true, trim: true },
    permissions: [{ type: String, required: true }],
    description: { type: String, trim: true }
}, {
    timestamps: true
});

roleSchema.index({ name: 1 });

export default mongoose.models.Role || mongoose.model<IRole>('Role', roleSchema);
