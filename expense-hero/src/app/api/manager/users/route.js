// src/app/api/manager/users/route.js
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import { withManagerAuth } from '../../../../lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const generateTempPassword = () => {
    // Basic alphanumeric password generation
    return Math.random().toString(36).slice(-8);
};

// --- GET: Fetch all employees managed by this manager ---
async function GET_HANDLER(request) {
    await dbConnect();
    const authUser = request.user; // Data attached by withManagerAuth middleware
    
    try {
        // Find users in the same company whose managerId is the authenticated user's ID
        const users = await User.find({ companyId: authUser.companyId, managerId: authUser.userId })
            .select('-password');

        return NextResponse.json(users, { status: 200 });
        
    } catch (error) {
        console.error("Manager GET users error:", error);
        return NextResponse.json({ message: 'Failed to fetch team members.' }, { status: 500 });
    }
}

// --- POST: Create New Employee (Manager only) ---
async function POST_HANDLER(request) {
    await dbConnect();
    const authUser = request.user; // Data attached by withManagerAuth middleware
    
    try {
        const { name, email } = await request.json();

        // Manager can only create 'employee' role and they are automatically the manager
        const role = 'employee';
        const managerId = authUser.userId;
        
        const tempPassword = generateTempPassword(); 
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        const newUser = await User.create({
            name, email,
            password: hashedPassword,
            role, 
            companyId: authUser.companyId,
            managerId, // Automatically assign the authenticated manager's ID
        });
        
        // In a real application, tempPassword would be securely emailed
        return NextResponse.json({ 
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, tempPassword } 
        }, { status: 201 });

    } catch (error) {
        console.error("Manager POST user error:", error);
        if (error.code === 11000) return NextResponse.json({ message: 'User with this email already exists.' }, { status: 400 });
        return NextResponse.json({ message: 'Failed to create employee.' }, { status: 500 });
    }
}

export const GET = withManagerAuth(GET_HANDLER);
export const POST = withManagerAuth(POST_HANDLER);