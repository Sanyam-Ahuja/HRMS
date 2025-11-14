import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeProfile from '@/models/EmployeeProfile';
import { getUserFromRequest } from '@/lib/auth';
import { updateEmployeeProfileSchema } from '@/lib/validations';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = updateEmployeeProfileSchema.parse(body);

    // Check if employee exists
    const employee = await User.findById(id);
    if (!employee || employee.role !== 'employee') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Find existing profile or create new one
    let profile = await EmployeeProfile.findOne({ userId: id });
    const isNewProfile = !profile;

    if (profile) {
      // Store old profile for audit log
      const oldProfile = profile.toObject();
      
      // Update existing profile
      Object.assign(profile, validatedData);
      await profile.save();

      // Create audit log
      await createAuditLog({
        adminId: currentUser.userId,
        action: AUDIT_ACTIONS.UPDATE_EMPLOYEE,
        targetId: id,
        before: oldProfile,
        after: validatedData,
      });
    } else {
      // Create new profile
      profile = new EmployeeProfile({
        userId: id,
        ...validatedData,
      });
      await profile.save();

      // Create audit log
      await createAuditLog({
        adminId: currentUser.userId,
        action: AUDIT_ACTIONS.CREATE_EMPLOYEE,
        targetId: id,
        before: null,
        after: validatedData,
      });
    }

    // Populate profile with user data for response
    await profile.populate('userId', 'name username email');

    return NextResponse.json({
      success: true,
      message: isNewProfile ? 'Employee profile created successfully' : 'Employee profile updated successfully',
      profile: {
        id: profile._id,
        userId: profile.userId._id,
        role: profile.role,
        department: profile.department,
        basicSalary: profile.basicSalary,
        allowances: profile.allowances,
        deductions: profile.deductions,
        joiningDate: profile.joiningDate,
        phone: profile.phone,
        address: profile.address,
        status: profile.status,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      }
    });

  } catch (error: any) {
    console.error('Update employee profile error:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return NextResponse.json(
        { error: `This ${field} is already registered with another employee` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
