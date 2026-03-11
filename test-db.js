import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio-ai';
    console.log('Testing connection to:', uri);
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ SUCCESS: Connected to MongoDB');
        process.exit(0);
    } catch (err) {
        console.error('❌ FAILURE: Could not connect to MongoDB');
        console.error(err);
        process.exit(1);
    }
}

testConnection();
