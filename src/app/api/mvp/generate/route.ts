import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission, Role } from '@/config/permissions';
import { loadPrompt } from '@/utils/promptLoader';
import AIClient from '@/utils/aiClient';
import AIUseCase from '@/models/AIUseCase';
import MVP from '@/models/MVP';
import mongoose from 'mongoose';

/**
 * Route: POST /api/mvp/generate
 * Purpose: Generates an MVP definition from an approved AI Use Case.
 * Aligned with SRS 7.4
 */
export const POST = withRBAC(
    Permission.CREATE_MVP,
    async (req: NextRequest, user: { id: string; role: Role }) => {
        try {
            const { useCaseId } = await req.json();

            if (!useCaseId) {
                return NextResponse.json({ error: 'useCaseId is mandatory' }, { status: 400 });
            }

            // 1. Fetch Use Case
            const useCase = await AIUseCase.findById(useCaseId);
            if (!useCase) {
                return NextResponse.json({ error: 'Use case not found' }, { status: 404 });
            }

            // 2. Load Prompt and call AI
            const prompt = loadPrompt('mvp-generation', {
                title: useCase.title,
                description: useCase.description,
                businessUnit: useCase.businessUnit,
                priority: useCase.priority.ai_value,
                feasibility: useCase.feasibility.ai_value,
                riskLevel: useCase.riskLevel?.ai_value || 'Medium'
            });

            const aiResponse = await AIClient.getJSONCompletion(prompt);

            // 3. Create MVP record in 'Proposed' state
            // Explicitly mapping to AIField structure to resolve CastErrors
            const mvp = await MVP.create({
                useCaseId: useCase._id,
                scope: {
                    ai_value: aiResponse.scope?.value || '',
                    ai_confidence: aiResponse.scope?.confidence || 0,
                    ai_explanation: aiResponse.scope?.explanation || 'AI generated scope.'
                },
                successMetric: {
                    ai_value: aiResponse.successMetric?.value || 'TBD',
                    ai_confidence: aiResponse.successMetric?.confidence || 0,
                    ai_explanation: aiResponse.successMetric?.explanation || 'AI generated metric.'
                },
                fallbackPath: {
                    ai_value: aiResponse.fallbackPath?.value || '',
                    ai_confidence: aiResponse.fallbackPath?.confidence || 0,
                    ai_explanation: aiResponse.fallbackPath?.explanation || 'AI generated fallback.'
                },
                adoptionTarget: {
                    ai_value: aiResponse.adoptionTarget?.value || 0,
                    ai_confidence: aiResponse.adoptionTarget?.confidence || 0,
                    ai_explanation: aiResponse.adoptionTarget?.explanation || 'AI generated target.'
                },
                usageFrequencyTarget: {
                    ai_value: aiResponse.usageFrequencyTarget?.value || 0,
                    ai_confidence: aiResponse.usageFrequencyTarget?.confidence || 0,
                    ai_explanation: aiResponse.usageFrequencyTarget?.explanation || 'AI generated target.'
                },
                estimatedCost: {
                    ai_value: aiResponse.estimatedCost?.value || 0,
                    ai_confidence: aiResponse.estimatedCost?.confidence || 0,
                    ai_explanation: aiResponse.estimatedCost?.explanation || 'AI generated cost.'
                },
                technicalRequirements: {
                    ai_value: aiResponse.technicalRequirements?.value || [],
                    ai_confidence: aiResponse.technicalRequirements?.confidence || 0,
                    ai_explanation: aiResponse.technicalRequirements?.explanation || 'AI identified requirements.'
                },
                timeline: {
                    ai_value: aiResponse.timeline?.value || 'TBD',
                    ai_confidence: aiResponse.timeline?.confidence || 0,
                    ai_explanation: aiResponse.timeline?.explanation || 'AI generated timeline.'
                },
                ethicalFlags: useCase.ethicalFlags, // Carry over from Use Case
                complianceFlags: useCase.complianceFlags, // Carry over from Use Case
                aiConfidence: typeof aiResponse.aiConfidence === 'object' ? aiResponse.aiConfidence.value : (aiResponse.aiConfidence || 0),
                aiRecommendation: aiResponse.aiRecommendation || {},
                stageGate: 'Proposed'
            });

            return NextResponse.json({
                success: true,
                mvpId: mvp._id,
                data: mvp
            });

        } catch (error: any) {
            console.error('[MVP Generation Failure]:', error);
            // Return full error in dev mode to help user, but normally would be more generic
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
