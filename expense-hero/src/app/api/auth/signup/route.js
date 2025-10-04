// src/app/api/auth/signup/route.js
import dbConnect from '../../../../lib/dbConnect';
import Company from '../../../../models/Company';
import User from '../../../../models/User';
import { generateAuthToken } from '../../../../lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    await dbConnect();
    
    try {
        // --- CRITICAL CHECK: Enforce One Admin Per System ---
        const companyCount = await Company.countDocuments();
        if (companyCount > 0) {
            // If a company exists, deny further admin creation via this route.
            return NextResponse.json({ message: 'A company already exists. Only one Admin is allowed to sign up initially for system initialization.' }, { status: 400 });
        }
        // ----------------------------------------------------

        const { email, password, name, companyName, baseCurrency } = await request.json();

        if (!email || !password || !name || !companyName || !baseCurrency) {
            return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 1. Create Company
        const newCompany = await Company.create({ 
            name: companyName, 
            baseCurrency: baseCurrency.toUpperCase() 
        });

        // 2. Create Admin User (The one and only Admin for this company)
        const newUser = await User.create({
            email,
            password: hashedPassword,
            role: 'admin', // Role is hardcoded to 'admin'
            companyId: newCompany._id,
            name,
        });
        
        // 3. Link Admin to Company
        newCompany.adminId = newUser._id;
        await newCompany.save();

        // 4. Generate Token
        const token = generateAuthToken(newUser);

        return NextResponse.json({ 
            user: { id: newUser._id, email: newUser.email, role: newUser.role, companyId: newUser.companyId },
            company: newCompany,
            token 
        }, { status: 201 });

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ message: 'Failed to create user/company.' }, { status: 500 });
    }
}
