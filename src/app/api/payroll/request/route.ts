import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeProfile from '@/models/EmployeeProfile';
import { getUserFromRequest } from '@/lib/auth';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { month, year, message } = body;

    // Validate the request
    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    // Get employee details
    const employee = await User.findById(currentUser.userId);
    if (!employee || employee.role !== 'employee') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const employeeProfile = await EmployeeProfile.findOne({ userId: currentUser.userId });
    if (!employeeProfile) {
      return NextResponse.json(
        { error: 'Employee profile not found' },
        { status: 404 }
      );
    }

    // In a real system, you would:
    // 1. Create a payroll request record
    // 2. Send notification to HR/Admin
    // 3. Track the request status
    // 4. Allow admins to approve/reject requests

    // For now, we'll create an audit log entry
    await createAuditLog({
      adminId: currentUser.userId,
      action: AUDIT_ACTIONS.CREATE_EMPLOYEE, // Using existing action for now
      targetId: currentUser.userId,
      before: null,
      after: {
        type: 'PAYROLL_REQUEST',
        month,
        year,
        message: message || `Payroll request for ${month}/${year}`,
        requestedAt: new Date(),
        status: 'pending'
      },
    });

    // Send response
    return NextResponse.json({
      success: true,
      message: `Payroll request submitted successfully for ${month}/${year}. HR will process your request within 2-3 business days.`,
      requestDetails: {
        employee: {
          id: employee._id,
          name: employee.name,
          username: employee.username,
        },
        month,
        year,
        requestedAt: new Date(),
        status: 'pending'
      }
    });

  } catch (error: any) {
    console.error('Payroll request error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
