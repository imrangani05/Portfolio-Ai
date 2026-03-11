import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/database';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        // Find user by username or email
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // For demo/prototype purposes, we're doing a simple check.
        // In a production app, use bcrypt or a similar library to compare hashed passwords.
        if (user.password && user.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Return user data (excluding password)
        const userData = {
            name: user.fullName || user.username,
            email: user.email,
            role: user.role,
            department: user.department || 'Corporate',
            joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2026'
        };

        return NextResponse.json({
            success: true,
            user: userData,
            role: user.role
        });

    } catch (error: any) {
        console.error('Login API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
