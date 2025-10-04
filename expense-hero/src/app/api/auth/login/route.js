// src/app/api/auth/login/route.js
import dbConnect from '../../../../lib/dbConnect';
import User from '../../../../models/User';
import { generateAuthToken } from '../../../../lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    await dbConnect();

    try {
        const { email, password } = await request.json();
        
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
        }

        const token = generateAuthToken(user);
        
        return NextResponse.json({ 
            user: { id: user._id, email: user.email, name: user.name, role: user.role, companyId: user.companyId },
            token 
        }, { status: 200 });

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: 'An error occurred during login.' }, { status: 500 });
    }
}