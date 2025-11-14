import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeProfile from '@/models/EmployeeProfile';
import Payroll from '@/models/Payroll';
import { getUserFromRequest } from '@/lib/auth';
import { generatePayrollSchema } from '@/lib/validations';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Check if user is admin
    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = generatePayrollSchema.parse(body);
    const { employeeId, month, year, basicSalary, allowances, deductions } = validatedData;

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get employee profile
    const profile = await EmployeeProfile.findOne({ userId: employeeId });
    if (!profile) {
      return NextResponse.json(
        { error: 'Employee profile not found' },
        { status: 404 }
      );
    }

    // Check if payroll already exists for this month/year
    const existingPayroll = await Payroll.findOne({
      employeeId,
      month,
      year,
    });

    if (existingPayroll) {
      return NextResponse.json(
        { error: 'Payroll already exists for this month and year' },
        { status: 400 }
      );
    }

    // Calculate final salary
    const finalSalary = basicSalary + allowances - deductions;

    // Create payroll record
    const payroll = new Payroll({
      employeeId,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      finalSalary,
    });

    await payroll.save();

    // Update employee profile with latest salary if different
    if (profile.basicSalary !== basicSalary || 
        profile.allowances !== allowances || 
        profile.deductions !== deductions) {
      
      const beforeProfile = {
        basicSalary: profile.basicSalary,
        allowances: profile.allowances,
        deductions: profile.deductions,
      };

      await EmployeeProfile.findOneAndUpdate(
        { userId: employeeId },
        {
          basicSalary,
          allowances,
          deductions,
        }
      );

      // Create audit log for salary update
      await createAuditLog({
        adminId: currentUser.userId,
        action: AUDIT_ACTIONS.UPDATE_SALARY,
        targetId: employeeId,
        before: beforeProfile,
        after: {
          basicSalary,
          allowances,
          deductions,
        },
      });
    }

    // Create audit log for payroll generation
    await createAuditLog({
      adminId: currentUser.userId,
      action: AUDIT_ACTIONS.GENERATE_PAYROLL,
      targetId: employeeId,
      after: {
        payrollId: payroll._id,
        month,
        year,
        finalSalary,
      },
    });

    // Populate employee details for response
    await payroll.populate('employeeId', 'name username email');

    return NextResponse.json({
      success: true,
      payroll: {
        id: payroll._id,
        employee: {
          id: employee._id,
          name: employee.name,
          username: employee.username,
          email: employee.email,
        },
        month: payroll.month,
        year: payroll.year,
        basicSalary: payroll.basicSalary,
        allowances: payroll.allowances,
        deductions: payroll.deductions,
        finalSalary: payroll.finalSalary,
        createdAt: payroll.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Generate payroll error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Payroll already exists for this employee and period' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
