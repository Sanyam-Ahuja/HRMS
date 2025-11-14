import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Payroll from '@/models/Payroll';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Check permissions
    if (currentUser.role === 'employee' && currentUser.userId !== id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Verify employee exists
    const employee = await User.findById(id);
    if (!employee || employee.role !== 'employee') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Build query
    let query: any = { employeeId: id };
    
    if (year) {
      query.year = parseInt(year);
    }
    
    if (month) {
      query.month = parseInt(month);
    }

    // Get payroll records
    const payrolls = await Payroll.find(query)
      .populate('employeeId', 'name username email')
      .sort({ year: -1, month: -1 });

    return NextResponse.json({
      success: true,
      payrolls: payrolls.map(payroll => ({
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
      })),
    });
  } catch (error: any) {
    console.error('Get employee payroll error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
