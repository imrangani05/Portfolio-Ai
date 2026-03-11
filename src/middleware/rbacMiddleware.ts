import { NextRequest, NextResponse } from 'next/server';
import { Role, Permission } from '../config/permissions';
import { hasPermission } from '../utils/rbacHelper';
import connectDB from '../db/database';

// Mock function to extract user from token (assuming same pattern as bidbayt)
async function getAuthenticatedUser(request: NextRequest) {
    // 1. Check for Auto-Login during development
    if (process.env.NODE_ENV === 'development' && process.env.DEV_AUTO_LOGIN === 'true') {
        return {
            id: '000000000000000000000000', // Valid 24-char hex
            role: 'Admin' as Role
        };
    }

    const token = request.cookies.get('accessToken')?.value;
    if (!token) return null;

    // JWT verification placeholder
    return {
        id: 'user_123',
        role: 'Analyst' as Role
    };
}

/**
 * Middleware helper for Next.js Route Handlers
 * Updated to support dynamic route context
 */
export function withRBAC(
    permission: Permission,
    handler: (req: NextRequest, user: { id: string, role: Role }, context?: any) => Promise<NextResponse>
) {
    return async (request: NextRequest, context?: any) => {
        // Ensure DB connection is active for all API requests
        await connectDB();

        const user = await getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!hasPermission(user.role, permission)) {
            return NextResponse.json({ error: 'Forbidden: Insufficient Permissions' }, { status: 403 });
        }

        return handler(request, user, context);
    };
}
