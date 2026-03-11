export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/middleware/rbacMiddleware';
import { Permission } from '@/config/permissions';
import PortfolioSnapshot from '@/models/PortfolioSnapshot';
import AIRecommendation from '@/models/AIRecommendation';

/**
 * Route: GET /api/dashboard/executive
 * Purpose: Returns the latest portfolio status and AI strategic insights for executives.
 */
export const GET = withRBAC(
    Permission.VIEW_PORTFOLIO,
    async (req: NextRequest, user) => {
        try {
            // 1. Get the latest snapshot
            const latestSnapshot = await PortfolioSnapshot.findOne().sort({ snapshotDate: -1 });

            if (!latestSnapshot) {
                return NextResponse.json({ error: 'No snapshots available. Trigger an aggregation first.' }, { status: 404 });
            }

            // 2. Get recent high-level AI recommendations
            const recommendations = await AIRecommendation.find({
                metadata: { promptModule: 'portfolio-recommendation' }
            }).sort({ createdAt: -1 }).limit(3);

            return NextResponse.json({
                success: true,
                summary: {
                    snapshotDate: latestSnapshot.snapshotDate,
                    totalProjects: latestSnapshot.totalUseCases,
                    activeProjects: latestSnapshot.activeUseCases,
                    financials: latestSnapshot.aggregateValue,
                    statusHeatmap: Object.fromEntries(latestSnapshot.statusDistribution as any),
                    unitDistribution: Object.fromEntries(latestSnapshot.businessUnitDistribution as any)
                },
                aiGovernance: {
                    aggregateRoiRating: latestSnapshot.aggregateRoi,
                    costEfficiency: latestSnapshot.costEfficiency,
                    strategicAlignmentScore: latestSnapshot.strategicAlignmentScore
                },
                strategicInsights: recommendations.map(r => ({
                    text: JSON.parse(r.recommendationText),
                    confidence: r.confidence,
                    date: r.createdAt
                }))
            });

        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
);
