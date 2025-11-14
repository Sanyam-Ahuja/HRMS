import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Leave from '@/models/Leave';
import LeaveBalance from '@/models/LeaveBalance';
import { getUserFromRequest } from '@/lib/auth';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';

// Update leave status - admin only
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ leaveId: string }> }
) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { leaveId } = await params;
    const body = await request.json();
    const { action, rejectionReason } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (approve/reject) is required' },
        { status: 400 }
      );
    }

    // Find the leave application
    const leave = await Leave.findById(leaveId).populate('employeeId', 'name username email');
    if (!leave) {
      return NextResponse.json({ error: 'Leave application not found' }, { status: 404 });
    }

    if (leave.status !== 'pending') {
      return NextResponse.json(
        { error: 'Leave application has already been processed' },
        { status: 400 }
      );
    }

    const oldStatus = leave.status;

    if (action === 'approve') {
      // Update leave balance
      const leaveBalance = await LeaveBalance.findOne({
        employeeId: leave.employeeId,
        year: leave.startDate.getFullYear()
      });

      if (leaveBalance) {
        const typeAllocation = leaveBalance.allocations[leave.leaveType as keyof typeof leaveBalance.allocations];
        
        // Double-check balance
        if (typeAllocation.remaining < leave.totalDays) {
          return NextResponse.json(
            { error: 'Insufficient leave balance for approval' },
            { status: 400 }
          );
        }

        // Update balance
        typeAllocation.used += leave.totalDays;
        typeAllocation.remaining -= leave.totalDays;
        leaveBalance.lastUpdated = new Date();
        
        await leaveBalance.save();
      }

      // Update leave status
      leave.status = 'approved';
      leave.approvedBy = currentUser.userId;
      leave.approvedDate = new Date();
    } else {
      // Reject leave
      leave.status = 'rejected';
      leave.rejectionReason = rejectionReason || 'No reason provided';
      leave.approvedBy = currentUser.userId;
      leave.approvedDate = new Date();
    }

    await leave.save();

    // Create audit log
    await createAuditLog({
      adminId: currentUser.userId,
      action: AUDIT_ACTIONS.UPDATE_EMPLOYEE, // We'll add APPROVE_LEAVE/REJECT_LEAVE later
      targetId: leaveId,
      before: { status: oldStatus },
      after: { 
        status: leave.status,
        approvedBy: currentUser.userId,
        rejectionReason: action === 'reject' ? rejectionReason : undefined
      }
    });

    return NextResponse.json({
      success: true,
      message: `Leave application ${action}d successfully`,
      leave: {
        id: leave._id,
        employee: {
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
        approvedDate: leave.approvedDate,
        rejectionReason: leave.rejectionReason,
        isHalfDay: leave.isHalfDay,
        halfDayPeriod: leave.halfDayPeriod
      }
    });

  } catch (error: any) {
    console.error('Update leave error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Get specific leave details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leaveId: string }> }
) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leaveId } = await params;

    const leave = await Leave.findById(leaveId)
      .populate('employeeId', 'name username email')
      .populate('approvedBy', 'name username');

    if (!leave) {
      return NextResponse.json({ error: 'Leave application not found' }, { status: 404 });
    }

    // Check access rights
    if (currentUser.role === 'employee' && leave.employeeId._id.toString() !== currentUser.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      leave: {
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
      }
    });

  } catch (error: any) {
    console.error('Get leave details error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
