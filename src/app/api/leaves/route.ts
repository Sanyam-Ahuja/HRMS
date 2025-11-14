import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Leave from '@/models/Leave';
import LeaveBalance from '@/models/LeaveBalance';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';

// Get leaves - for both employee and admin
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());

    // Build query
    const query: any = {};
    
    // If admin requests specific employee or all, if employee requests only their own
    if (currentUser.role === 'admin') {
      if (employeeId) {
        query.employeeId = employeeId;
      }
    } else {
      query.employeeId = currentUser.userId;
    }

    if (status) {
      query.status = status;
    }

    // Filter by year
    query.startDate = {
      $gte: new Date(year, 0, 1),
      $lte: new Date(year, 11, 31)
    };

    // Get leaves with employee details
    const leaves = await Leave.find(query)
      .populate('employeeId', 'name username email')
      .populate('approvedBy', 'name username')
      .sort({ appliedDate: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      leaves: leaves.map(leave => ({
        id: leave._id,
        employee: {
          id: leave.employeeId._id,
          name: leave.employeeId.name,
          username: leave.employeeId.username,
          email: leave.employeeId.email
        },
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        totalDays: leave.totalDays,
        reason: leave.reason,
        status: leave.status,
        appliedDate: leave.appliedDate,
        approvedBy: leave.approvedBy ? {
          id: leave.approvedBy._id,
          name: leave.approvedBy.name,
          username: leave.approvedBy.username
        } : null,
        approvedDate: leave.approvedDate,
        rejectionReason: leave.rejectionReason,
        isHalfDay: leave.isHalfDay,
        halfDayPeriod: leave.halfDayPeriod
      }))
    });

  } catch (error: any) {
    console.error('Get leaves error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Apply for leave - employee only
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'employee') {
      return NextResponse.json({ error: 'Unauthorized - Employee access required' }, { status: 401 });
    }

    const body = await request.json();
    const { leaveType, startDate, endDate, reason, isHalfDay, halfDayPeriod } = body;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { error: 'Leave type, dates, and reason are required' },
        { status: 400 }
      );
    }

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = isHalfDay ? 0.5 : Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Check leave balance
    const currentYear = start.getFullYear();
    let leaveBalance = await LeaveBalance.findOne({
      employeeId: currentUser.userId,
      year: currentYear
    });

    // Create leave balance if doesn't exist
    if (!leaveBalance) {
      leaveBalance = new LeaveBalance({
        employeeId: currentUser.userId,
        year: currentYear
      });
      await leaveBalance.save();
    }

    // Check if enough balance
    const typeAllocation = leaveBalance.allocations[leaveType as keyof typeof leaveBalance.allocations];
    if (typeAllocation.remaining < totalDays) {
      return NextResponse.json(
        { error: `Insufficient ${leaveType} leave balance. Available: ${typeAllocation.remaining} days` },
        { status: 400 }
      );
    }

    // Create leave application
    const leave = new Leave({
      employeeId: currentUser.userId,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      isHalfDay,
      halfDayPeriod: isHalfDay ? halfDayPeriod : undefined
    });

    await leave.save();

    // Create audit log
    await createAuditLog({
      adminId: currentUser.userId,
      action: AUDIT_ACTIONS.CREATE_EMPLOYEE, // We'll add APPLY_LEAVE later
      targetId: leave._id.toString(),
      before: null,
      after: {
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Leave application submitted successfully',
      leaveId: leave._id,
      leave: {
        id: leave._id,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        totalDays: leave.totalDays,
        reason: leave.reason,
        status: leave.status,
        appliedDate: leave.appliedDate,
        isHalfDay: leave.isHalfDay,
        halfDayPeriod: leave.halfDayPeriod
      }
    });

  } catch (error: any) {
    console.error('Apply leave error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
