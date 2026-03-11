import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    userID: string;
    username: string;
    email: string;
    password?: string;
    fullName: string;
    role:
    | 'Executive'
    | 'Business Owner'
    | 'AI Product Owner'
    | 'Risk Officer'
    | 'Developer'
    | 'End User'
    | 'Admin'
    | 'Analyst'
    | 'Viewer';
    department?: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    userID: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    fullName: { type: String, required: true },
    role: {
        type: String,
        enum: [
            'Executive',
            'Business Owner',
            'AI Product Owner',
            'Risk Officer',
            'Developer',
            'End User',
            'Admin',
            'Analyst',
            'Viewer'
        ],
        required: true
    },
    department: String
}, {
    timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
