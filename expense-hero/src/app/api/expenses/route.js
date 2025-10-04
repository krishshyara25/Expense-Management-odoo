import dbConnect from '@/lib/dbConnect';
import { parseUserFromRequest } from '@/lib/auth';
import Expense from '@/models/Expense';
import User from '@/models/User';
import Company from '@/models/Company';
import { convertToCompanyBase } from '@/services/CurrencyService';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Verify authentication
    const authUser = parseUserFromRequest(request);
    if (!authUser) {
      return Response.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await User.findById(authUser.userId);
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 10, 100);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const skip = (page - 1) * limit;

    // Build query based on user role
    let query = { companyId: user.companyId };

    // Role-based filtering
    if (user.role === 'employee') {
      query.employeeId = user._id;
    } else if (user.role === 'manager') {
      // Managers can see their own expenses and their team's expenses
      const teamMembers = await User.find({ 
        $or: [
          { managerId: user._id },
          { _id: user._id }
        ]
      }).select('_id');
      
      query.employeeId = { $in: teamMembers.map(member => member._id) };
    }
    // Admins can see all company expenses

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Get expenses with user details
    const expenses = await Expense.find(query)
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalExpenses = await Expense.countDocuments(query);
    const totalPages = Math.ceil(totalExpenses / limit);

    // Calculate summary
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.convertedAmount, 0);

    return Response.json({
      success: true,
      message: 'Expenses retrieved successfully',
      data: {
        expenses,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalExpenses,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        summary: {
          totalAmount,
          currency: user.companyId?.baseCurrency || 'USD'
        }
      }
    });

  } catch (error) {
    console.error('Expense fetch error:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Verify authentication
    const authResult = await verifyToken(request);
    if (!authResult.valid) {
      return Response.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const user = await User.findById(authResult.userId);
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const company = await Company.findById(user.companyId);
    if (!company) {
      return Response.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      amount, 
      currency, 
      category, 
      date, 
      vendor, 
      receiptUrl,
      tags 
    } = body;

export async function POST(request) {
  try {
    await dbConnect();
    
    // Verify authentication
    const authUser = parseUserFromRequest(request);
    if (!authUser) {
      return Response.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await User.findById(authUser.userId);
    if (!user) {
      return Response.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const company = await Company.findById(user.companyId);
    if (!company) {
      return Response.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const { 
      description, 
      amount, 
      currency, 
      category, 
      date,
      status = 'Submitted'
    } = await request.json();

    // Validate required fields
    if (!description || !amount || !currency || !category || !date) {
      return Response.json(
        { success: false, error: 'Missing required fields: description, amount, currency, category, date' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return Response.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Create expense
    const expense = new Expense({
      employeeId: user._id,
      companyId: company._id,
      description: description.trim(),
      amount: parseFloat(amount),
      currency,
      category,
      date: new Date(date),
      status,
      submittedAt: status === 'Submitted' ? new Date() : null,
      
      // TODO: Initialize approval workflow when implementing Phase 3
      approvalSteps: [],
      currentStepIndex: 0
    });

    await expense.save();

    return Response.json({
      success: true,
      message: 'Expense submitted successfully',
      data: {
        expense: {
          id: expense._id,
          description: expense.description,
          amount: expense.amount,
          currency: expense.currency,
          category: expense.category,
          date: expense.date,
          status: expense.status,
          submittedAt: expense.submittedAt
        }
      }
    });

  } catch (error) {
    console.error('Expense submission error:', error);
    return Response.json(
      { success: false, error: 'Failed to submit expense' },
      { status: 500 }
    );
  }
}
}