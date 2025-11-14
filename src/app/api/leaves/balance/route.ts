import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LeaveBalance from '@/models/LeaveBalance';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());

    // Determine which employee's balance to get
    let targetEmployeeId = currentUser.userId;
    if (currentUser.role === 'admin' && employeeId) {
      targetEmployeeId = employeeId;
    }

    // Find or create leave balance for the year
    let leaveBalance = await LeaveBalance.findOne({
      employeeId: targetEmployeeId,
      year: year
    }).populate('employeeId', 'name username email');

    // Create if doesn't exist
    if (!leaveBalance) {
      leaveBalance = new LeaveBalance({
        employeeId: targetEmployeeId,
        year: year
      });
      await leaveBalance.save();
      await leaveBalance.populate('employeeId', 'name username email');
    }

    return NextResponse.json({
      success: true,
      balance: {
        employeeId: leaveBalance.employeeId._id,
        employee: {
          name: leaveBalance.employeeId.name,
          username: leaveBalance.employeeId.username,
          email: leaveBalance.employeeId.email
        },
        year: leaveBalance.year,
        allocations: leaveBalance.allocations,
        lastUpdated: leaveBalance.lastUpdated
      }
    });

  } catch (error: any) {
    console.error('Get leave balance error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Update leave allocations - admin only
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { employeeId, year, allocations } = body;

    if (!employeeId || !year || !allocations) {
      return NextResponse.json(
        { error: 'Employee ID, year, and allocations are required' },
        { status: 400 }
      );
    }

    // Find or create leave balance
    let leaveBalance = await LeaveBalance.findOne({ employeeId, year });
    
    if (!leaveBalance) {
      leaveBalance = new LeaveBalance({ employeeId, year });
    }

    // Update allocations
    Object.keys(allocations).forEach(leaveType => {
      if (leaveBalance.allocations[leaveType as keyof typeof leaveBalance.allocations]) {
        const allocation = allocations[leaveType];
        leaveBalance.allocations[leaveType as keyof typeof leaveBalance.allocations] = {
          total: allocation.total || 0,
          used: allocation.used || 0,
          remaining: (allocation.total || 0) - (allocation.used || 0)
        };
      }
    });

    leaveBalance.lastUpdated = new Date();
    await leaveBalance.save();

    return NextResponse.json({
      success: true,
      message: 'Leave balance updated successfully',
      balance: {
        employeeId: leaveBalance.employeeId,
        year: leaveBalance.year,
        allocations: leaveBalance.allocations,
        lastUpdated: leaveBalance.lastUpdated
      }
    });

  } catch (error: any) {
    console.error('Update leave balance error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
