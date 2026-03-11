import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MVP from './src/models/MVP.js';
import AIUseCase from './src/models/AIUseCase.js';

dotenv.config();

async function debugData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const mvps = await MVP.find();
        console.log(`Found ${mvps.length} MVPs`);

        for (const mvp of mvps) {
            console.log(`Checking MVP: ${mvp._id}`);
            try {
                const populated = await MVP.findById(mvp._id).populate('useCaseId');
                if (!populated.useCaseId) {
                    console.log(`[WARNING] MVP ${mvp._id} has no useCaseId!`);
                } else {
                    console.log(`[OK] MVP ${mvp._id} links to Use Case: ${populated.useCaseId._id}`);
                }
            } catch (err) {
                console.error(`[ERROR] Failed to populate MVP ${mvp._id}:`, err.message);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Debug Script Failed:', error);
        process.exit(1);
    }
}

debugData();
