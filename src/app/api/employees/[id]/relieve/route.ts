import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeProfile from '@/models/EmployeeProfile';
import { getUserFromRequest } from '@/lib/auth';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';

// Relieve an employee - admin only
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { relievingReason, relievingDate } = body;

    if (!relievingReason) {
      return NextResponse.json(
        { error: 'Relieving reason is required' },
        { status: 400 }
      );
    }

    // Find the employee
    const employee = await User.findById(id);
    if (!employee || employee.role !== 'employee') {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    if (employee.isRelieved) {
      return NextResponse.json(
        { error: 'Employee is already relieved' },
        { status: 400 }
      );
    }

    const oldEmployeeData = {
      isRelieved: employee.isRelieved,
      relievingDate: employee.relievingDate,
      relievingReason: employee.relievingReason
    };

    // Update employee status
    employee.isRelieved = true;
    employee.relievingDate = relievingDate ? new Date(relievingDate) : new Date();
    employee.relievingReason = relievingReason;
    employee.relievedBy = currentUser.userId;

    await employee.save();

    // Update employee profile status
    const employeeProfile = await EmployeeProfile.findOne({ userId: id });
    if (employeeProfile) {
      employeeProfile.status = 'Relieved';
      await employeeProfile.save();
    }

    // Create audit log
    await createAuditLog({
      adminId: currentUser.userId,
      action: AUDIT_ACTIONS.UPDATE_EMPLOYEE, // We'll add RELIEVE_EMPLOYEE later
      targetId: id,
      before: oldEmployeeData,
      after: {
        isRelieved: true,
        relievingDate: employee.relievingDate,
        relievingReason: employee.relievingReason,
        relievedBy: currentUser.userId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Employee relieved successfully',
      employee: {
        id: employee._id,
        name: employee.name,
        username: employee.username,
        email: employee.email,
        isRelieved: employee.isRelieved,
        relievingDate: employee.relievingDate,
        relievingReason: employee.relievingReason,
        relievedBy: currentUser.userId
      }
    });

  } catch (error: any) {
    console.error('Relieve employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Get relieving details - admin only
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { id } = await params;

    const employee = await User.findById(id)
      .populate('relievedBy', 'name username')
      .select('name username email isRelieved relievingDate relievingReason relievedBy');

    if (!employee || employee.role !== 'employee') {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      employee: {
        id: employee._id,
        name: employee.name,
        username: employee.username,
        email: employee.email,
        isRelieved: employee.isRelieved,
        relievingDate: employee.relievingDate,
        relievingReason: employee.relievingReason,
        relievedBy: employee.relievedBy ? {
          name: employee.relievedBy.name,
          username: employee.relievedBy.username
        } : null
      }
    });

  } catch (error: any) {
    console.error('Get relieving details error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Rejoin employee (undo relieving) - admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { id } = await params;

    // Find the employee
    const employee = await User.findById(id);
    if (!employee || employee.role !== 'employee') {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    if (!employee.isRelieved) {
      return NextResponse.json(
        { error: 'Employee is not relieved' },
        { status: 400 }
      );
    }

    const oldEmployeeData = {
      isRelieved: employee.isRelieved,
      relievingDate: employee.relievingDate,
      relievingReason: employee.relievingReason,
      relievedBy: employee.relievedBy
    };

    // Rejoin employee
    employee.isRelieved = false;
    employee.relievingDate = undefined;
    employee.relievingReason = undefined;
    employee.relievedBy = undefined;

    await employee.save();

    // Update employee profile status back to Active
    const employeeProfile = await EmployeeProfile.findOne({ userId: id });
    if (employeeProfile) {
      employeeProfile.status = 'Active';
      await employeeProfile.save();
    }

    // Create audit log
    await createAuditLog({
      adminId: currentUser.userId,
      action: AUDIT_ACTIONS.UPDATE_EMPLOYEE, // We'll add REJOIN_EMPLOYEE later
      targetId: id,
      before: oldEmployeeData,
      after: {
        isRelieved: false,
        relievingDate: null,
        relievingReason: null,
        relievedBy: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Employee rejoined successfully',
      employee: {
        id: employee._id,
        name: employee.name,
        username: employee.username,
        email: employee.email,
        isRelieved: employee.isRelieved
      }
    });

  } catch (error: any) {
    console.error('Rejoin employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
