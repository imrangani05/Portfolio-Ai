import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if User model is already registered
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            userID: String,
            username: String,
            email: String,
            password: { type: String },
            fullName: String,
            role: String,
            department: String
        }, { timestamps: true }));

        const testUsers = [
            {
                userID: 'USR001',
                username: 'admin',
                email: 'admin@enterprise.ai',
                password: 'password123',
                fullName: 'Admin User',
                role: 'Admin',
                department: 'IT Infrastructure'
            },
            {
                userID: 'USR002',
                username: 'executive',
                email: 'executive@enterprise.ai',
                password: 'password123',
                fullName: 'Sarah Chen',
                role: 'Executive',
                department: 'Strategic Planning'
            },
            {
                userID: 'USR003',
                username: 'po',
                email: 'po@enterprise.ai',
                password: 'password123',
                fullName: 'Alex Rivera',
                role: 'AI Product Owner',
                department: 'Product Management'
            },
            {
                userID: 'USR004',
                username: 'risk',
                email: 'risk@enterprise.ai',
                password: 'password123',
                fullName: 'Elena Rodriguez',
                role: 'Risk Officer',
                department: 'Compliance'
            },
            {
                userID: 'USR005',
                username: 'dev',
                email: 'dev@enterprise.ai',
                password: 'password123',
                fullName: 'Jordan Smith',
                role: 'Developer',
                department: 'Engineering'
            },
            {
                userID: 'USR006',
                username: 'user',
                email: 'user@enterprise.ai',
                password: 'password123',
                fullName: 'Taylor Wong',
                role: 'End User',
                department: 'Operations'
            },
            {
                userID: 'USR007',
                username: 'analyst',
                email: 'analyst@enterprise.ai',
                password: 'password123',
                fullName: 'Morgan Freeman',
                role: 'Analyst',
                department: 'Data Intelligence'
            },
            {
                userID: 'USR008',
                username: 'business',
                email: 'business@enterprise.ai',
                password: 'password123',
                fullName: 'Chris Evans',
                role: 'Business Owner',
                department: 'Finance'
            },
            {
                userID: 'USR009',
                username: 'viewer',
                email: 'viewer@enterprise.ai',
                password: 'password123',
                fullName: 'Guest Observer',
                role: 'Viewer',
                department: 'External Audit'
            }
        ];

        console.log('🌱 Seeding users for all roles...');

        for (const user of testUsers) {
            await User.findOneAndUpdate(
                { username: user.username },
                user,
                { upsert: true, new: true }
            );
            console.log(`✅ ${user.role} (${user.username}) ready.`);
        }

        console.log('\n✨ Database seeding complete!');
        console.log('All accounts use password: password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
