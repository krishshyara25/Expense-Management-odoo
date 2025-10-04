// src/app/api/admin/users/route.js
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import { withAdminAuth, parseUserFromRequest } from '../../../../lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8);
};

// --- GET: Fetch all Users (Admin only) ---
async function GET_HANDLER(request) {
    await dbConnect();
    const authUser = parseUserFromRequest(request);

    try {
        const users = await User.find({ companyId: authUser.companyId })
            .select('-password')
            .populate('managerId', 'name email');

        return NextResponse.json(users, { status: 200 });
        
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch users.' }, { status: 500 });
    }
}

// --- POST: Create New Employee/Manager (Admin only) ---
async function POST_HANDLER(request) {
    await dbConnect();
    const authUser = parseUserFromRequest(request);
    
    try {
        const { name, email, role, managerEmail } = await request.json();

        if (role === 'Admin') return NextResponse.json({ message: 'Cannot create new Admin via this route.' }, { status: 403 });

        let managerId = null;
        if (managerEmail) {
            const manager = await User.findOne({ email: managerEmail, companyId: authUser.companyId, role: 'Manager' });
            if (manager) managerId = manager._id;
        }

        const tempPassword = generateTempPassword(); 
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        const newUser = await User.create({
            name, email,
            password: hashedPassword,
            role,
            companyId: authUser.companyId,
            managerId, 
        });
        
        return NextResponse.json({ 
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, tempPassword } 
        }, { status: 201 });

    } catch (error) {
        if (error.code === 11000) return NextResponse.json({ message: 'User with this email already exists.' }, { status: 400 });
        return NextResponse.json({ message: 'Failed to create user.' }, { status: 500 });
    }
}

// --- PUT: Update User Role/Manager (Admin only) ---
async function PUT_HANDLER(request) {
    await dbConnect();
    const authUser = parseUserFromRequest(request);

    try {
        const { userId, role, managerEmail } = await request.json();
        const update = {};

        if (role) update.role = role;

        if (managerEmail || managerEmail === "") {
            let newManagerId = null;
            if (managerEmail) {
                const newManager = await User.findOne({ email: managerEmail, companyId: authUser.companyId, role: 'Manager' });
                if (newManager) newManagerId = newManager._id;
            }
            update.managerId = newManagerId;
        }

        const userToUpdate = await User.findOneAndUpdate(
            { _id: userId, companyId: authUser.companyId },
            update,
            { new: true }
        ).select('-password');
        
        if (!userToUpdate) return NextResponse.json({ message: 'User not found.' }, { status: 404 });

        return NextResponse.json({ user: userToUpdate }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: 'Failed to update user.' }, { status: 500 });
    }
}

// --- DELETE: Delete User (Admin only) ---
async function DELETE_HANDLER(request) {
    await dbConnect();
    const authUser = parseUserFromRequest(request);

    try {
        const { userId } = await request.json();
        
        const result = await User.deleteOne({ _id: userId, companyId: authUser.companyId });
        
        if (result.deletedCount === 0) return NextResponse.json({ message: 'User not found.' }, { status: 404 });

        return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete user.' }, { status: 500 });
    }
}


export const GET = withAdminAuth(GET_HANDLER);
export const POST = withAdminAuth(POST_HANDLER);
export const PUT = withAdminAuth(PUT_HANDLER);
export const DELETE = withAdminAuth(DELETE_HANDLER);