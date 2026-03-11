import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import { loadPrompt } from '@/utils/promptLoader';
import AIClient from '@/utils/aiClient';
import AIRecommendation from '@/models/AIRecommendation';
import AIUseCase from '@/models/AIUseCase';
import mongoose from 'mongoose';

/**
 * Route: POST /api/ai/usecase-score
 * Purpose: Generates a prioritized score for a new AI Use Case and creates the record.
 * Aligned with SRS 6.3 - Deep Governance Scoring
 */
export const POST = withRBAC(
    Permission.CREATE_USE_CASE,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { title, description, businessUnit } = await req.json();

            if (!title || !description) {
                return NextResponse.json({ error: 'Title and Description are mandatory' }, { status: 400 });
            }

            // 1. Prepare deterministic prompt with new SRS fields
            const prompt = loadPrompt('use-case-scoring', { title, description, businessUnit: businessUnit || 'General' });

            // 2. Call AI Client (GPT-4o)
            const aiResponse = await AIClient.getJSONCompletion(prompt);

            // 3. Create the Use Case with full SRS schema
            const ownerId = mongoose.Types.ObjectId.isValid(user.id)
                ? new mongoose.Types.ObjectId(user.id)
                : new mongoose.Types.ObjectId();

            const useCase = await AIUseCase.create({
                title,
                description,
                businessUnit: businessUnit || 'General',
                owner: ownerId,
                status: 'Ideation',

                // Core Scoring
                priority: {
                    ai_value: aiResponse.priority?.value || 0,
                    ai_confidence: aiResponse.priority?.confidence || 0,
                    ai_explanation: aiResponse.priority?.explanation || 'No AI explanation provided.'
                },
                feasibility: {
                    ai_value: aiResponse.feasibility?.value || 0,
                    ai_confidence: aiResponse.feasibility?.confidence || 0,
                    ai_explanation: aiResponse.feasibility?.explanation || 'No AI explanation provided.'
                },
                strategicAlignment: {
                    ai_value: aiResponse.strategicAlignment?.value || 0,
                    ai_confidence: aiResponse.strategicAlignment?.confidence || 0,
                    ai_explanation: aiResponse.strategicAlignment?.explanation || 'No AI explanation provided.'
                },

                // Risk & Governance
                riskLevel: {
                    ai_value: aiResponse.riskLevel?.value || 'Medium',
                    ai_confidence: aiResponse.riskLevel?.confidence || 0,
                    ai_explanation: aiResponse.riskLevel?.explanation || 'No AI explanation provided.'
                },
                ethicalFlags: {
                    ai_value: aiResponse.ethicalFlags?.value || {},
                    ai_confidence: aiResponse.ethicalFlags?.confidence || 0,
                    ai_explanation: aiResponse.ethicalFlags?.explanation || 'No AI explanation provided.'
                },
                complianceFlags: {
                    ai_value: aiResponse.complianceFlags?.value || {},
                    ai_confidence: aiResponse.complianceFlags?.confidence || 0,
                    ai_explanation: aiResponse.complianceFlags?.explanation || 'No AI explanation provided.'
                },

                // Strategic Insights
                heatmapZone: {
                    ai_value: aiResponse.heatmapZone?.value || 'Medium',
                    ai_confidence: aiResponse.heatmapZone?.confidence || 0,
                    ai_explanation: aiResponse.heatmapZone?.explanation || 'No AI explanation provided.'
                },
                expectedValue: {
                    ai_value: aiResponse.expectedValue?.value || 0,
                    ai_confidence: aiResponse.expectedValue?.confidence || 0,
                    ai_explanation: aiResponse.expectedValue?.explanation || 'No AI explanation provided.'
                },
                modelTypeRecommended: {
                    ai_value: aiResponse.modelTypeRecommended?.value || 'LLM',
                    ai_confidence: aiResponse.modelTypeRecommended?.confidence || 0,
                    ai_explanation: aiResponse.modelTypeRecommended?.explanation || 'No AI explanation provided.'
                },

                // Metadata
                dependencies: aiResponse.dependencies || [],
                tags: aiResponse.tags || [],
                aiAssistantNotes: aiResponse.aiAssistantNotes || ''
            });

            // 4. Log the recommendation record for audit (Always On)
            const avgConf = (
                (aiResponse.priority?.confidence || 0) +
                (aiResponse.feasibility?.confidence || 0) +
                (aiResponse.strategicAlignment?.confidence || 0) +
                (aiResponse.riskLevel?.confidence || 0)
            ) / 4;

            await AIRecommendation.create({
                subjectType: 'AIUseCase',
                subjectId: useCase._id,
                recommendationText: JSON.stringify(aiResponse),
                confidence: avgConf,
                status: 'Pending',
                metadata: {
                    promptModule: 'use-case-scoring',
                    generatedBy: user.id
                }
            });

            return NextResponse.json({
                success: true,
                useCaseId: useCase._id,
                ai_data: aiResponse,
                useCase: useCase
            });

        } catch (error: any) {
            console.error('[Scoring Engine Failure]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
