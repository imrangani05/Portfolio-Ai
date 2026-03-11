import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import AIUseCase from '@/models/AIUseCase';
import ValueCost from '@/models/ValueCost';
import PortfolioSnapshot from '@/models/PortfolioSnapshot';
import AIClient from '@/utils/aiClient';
import { loadPrompt } from '@/utils/promptLoader';
import mongoose from 'mongoose';

/**
 * Route: POST /api/analytics/aggregate
 * Purpose: Aggregates current portfolio state into a snapshot and triggers AI strategic analysis.
 */
export const POST = withRBAC(
    Permission.EXPORT_REPORTS,
    async (req: NextRequest, user) => {
        try {
            // 1. Fetch Aggregated Data
            const allUseCases = await AIUseCase.find();
            const allValueCosts = await ValueCost.find();

            const totalUseCases = allUseCases.length;
            const activeUseCases = allUseCases.filter(u => u.status === 'Live' || u.status === 'In-Progress').length;

            const aggregateValue = allValueCosts.reduce((acc, vc) => ({
                estimated: acc.estimated + (vc.estimatedValue.human_value || vc.estimatedValue.ai_value || 0),
                actual: acc.actual + (vc.actualValue || 0)
            }), { estimated: 0, actual: 0 });

            const statusDistribution = new Map<string, number>();
            allUseCases.forEach(u => statusDistribution.set(u.status, (statusDistribution.get(u.status) || 0) + 1));

            const businessUnitDistribution = new Map<string, number>();
            allUseCases.forEach(u => businessUnitDistribution.set(u.businessUnit, (businessUnitDistribution.get(u.businessUnit) || 0) + 1));

            // 2. Prepare AI Strategic Advice
            const topUnit = Array.from(businessUnitDistribution.entries())
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

            const prompt = loadPrompt('portfolio-recommendation', {
                totalUseCases,
                statusDistribution: JSON.stringify(Object.fromEntries(statusDistribution)),
                aggregateRoi: (aggregateValue.actual / (aggregateValue.estimated || 1)) * 100, // Mock calculation
                topUnit
            });

            const aiResponse = await AIClient.getJSONCompletion(prompt);

            // 3. Create the Snapshot
            const snapshot = await PortfolioSnapshot.create({
                totalUseCases,
                activeUseCases,
                aggregateValue,
                statusDistribution,
                businessUnitDistribution,
                topPerformers: [], // Extend with logic if needed
                aggregateRoi: aiResponse.strategy, // Mapping the AI's strategic fields
                costEfficiency: aiResponse.allocationFocus,
                strategicAlignmentScore: aiResponse.riskConcentration
            });

            return NextResponse.json({
                success: true,
                snapshotId: snapshot._id,
                data: snapshot
            });

        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
