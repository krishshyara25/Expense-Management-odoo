// src/app/api/admin/rules/route.js
import dbConnect from '../../../../lib/dbConnect';
import ApprovalRule from '../../../../models/ApprovalRule';
import { withAdminAuth, parseUserFromRequest } from '../../../../lib/auth';
import { NextResponse } from 'next/server';

// GET: Fetch all approval rules for the company
async function GET_HANDLER(request) {
    await dbConnect();
    const authUser = parseUserFromRequest(request);
    
    const rules = await ApprovalRule.find({ companyId: authUser.companyId });
    return NextResponse.json(rules, { status: 200 });
}

// POST: Create a new approval rule
async function POST_HANDLER(request) {
    await dbConnect();
    const authUser = parseUserFromRequest(request);
    
    try {
        const data = await request.json();
        
        const newRule = await ApprovalRule.create({
            ...data,
            companyId: authUser.companyId,
        });
        
        return NextResponse.json(newRule, { status: 201 });
    } catch (error) {
        console.error("Rule creation error:", error);
        return NextResponse.json({ message: 'Failed to create approval rule.' }, { status: 500 });
    }
}

// PUT: Update an existing rule
async function PUT_HANDLER(request) {
    await dbConnect();
    const authUser = parseUserFromRequest(request);

    try {
        const data = await request.json();
        const { ruleId, ...updateData } = data;

        const updatedRule = await ApprovalRule.findOneAndUpdate(
            { _id: ruleId, companyId: authUser.companyId },
            updateData,
            { new: true }
        );

        if (!updatedRule) return NextResponse.json({ message: 'Rule not found.' }, { status: 404 });

        return NextResponse.json(updatedRule, { status: 200 });
    } catch (error) {
        console.error("Rule update error:", error);
        return NextResponse.json({ message: 'Failed to update rule.' }, { status: 500 });
    }
}

// DELETE: Delete a rule
async function DELETE_HANDLER(request) {
    await dbConnect();
    const authUser = parseUserFromRequest(request);

    try {
        const { ruleId } = await request.json();
        
        const result = await ApprovalRule.deleteOne({ _id: ruleId, companyId: authUser.companyId });
        
        if (result.deletedCount === 0) return NextResponse.json({ message: 'Rule not found.' }, { status: 404 });

        return NextResponse.json({ message: 'Rule deleted successfully.' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete rule.' }, { status: 500 });
    }
}

export const GET = withAdminAuth(GET_HANDLER);
export const POST = withAdminAuth(POST_HANDLER);
export const PUT = withAdminAuth(PUT_HANDLER);
export const DELETE = withAdminAuth(DELETE_HANDLER);