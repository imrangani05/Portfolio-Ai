import User from './models/User.js';
import Role from './models/Role.js';
import AIUseCase from './models/AIUseCase.js';
import MVP from './models/MVP.js';
import Adoption from './models/Adoption.js';
import ValueCost from './models/ValueCost.js';
import Override from './models/Override.js';
import AIRecommendation from './models/AIRecommendation.js';
import PortfolioSnapshot from './models/PortfolioSnapshot.js';

console.log('--- AIPDMS Model Verification ---');

const checkModel = (name: string, model: any) => {
    if (model && model.modelName) {
        console.log(`✅ ${name} model initialized: ${model.modelName}`);
    } else {
        console.log(`❌ ${name} model failed to initialize`);
    }
};

checkModel('User', User);
checkModel('Role', Role);
checkModel('AIUseCase', AIUseCase);
checkModel('MVP', MVP);
checkModel('Adoption', Adoption);
checkModel('ValueCost', ValueCost);
checkModel('Override', Override);
checkModel('AIRecommendation', AIRecommendation);
checkModel('PortfolioSnapshot', PortfolioSnapshot);

console.log('\n--- AI-Assisted Field Verification ---');
const aiUseCaseFields = AIUseCase.schema.paths;
if (aiUseCaseFields['priority.ai_value'] && aiUseCaseFields['priority.ai_confidence']) {
    console.log('✅ AIUseCase.priority follows mandatory structure');
} else {
    console.log('❌ AIUseCase.priority does NOT follow mandatory structure');
}

console.log('\nVerification complete.');
