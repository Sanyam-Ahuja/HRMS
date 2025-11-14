import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Payroll from '@/models/Payroll';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query
    let query: any = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    // Get payroll records with employee details
    const payrolls = await Payroll.find(query)
      .populate({
        path: 'employeeId',
        select: 'name username email',
        model: User
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Payroll.countDocuments(query);

    // Get current month count
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const currentMonthCount = await Payroll.countDocuments({
      month: currentMonth,
      year: currentYear
    });

    // Format response
    const formattedPayrolls = payrolls.map(payroll => ({
      id: payroll._id,
      employee: {
        id: payroll.employeeId._id,
        name: payroll.employeeId.name,
        username: payroll.employeeId.username,
        email: payroll.employeeId.email,
      },
      month: payroll.month,
      year: payroll.year,
      basicSalary: payroll.basicSalary,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      finalSalary: payroll.finalSalary,
      createdAt: payroll.createdAt,
      updatedAt: payroll.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      payrolls: formattedPayrolls,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
        totalRecords: total,
      },
      stats: {
        currentMonthGenerated: currentMonthCount,
        totalGenerated: total,
      }
    });

  } catch (error: any) {
    console.error('List payrolls error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
