import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeProfile from '@/models/EmployeeProfile';
import { getUserFromRequest } from '@/lib/auth';
import { updateUserSchema, updateEmployeeProfileSchema } from '@/lib/validations';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit';

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

    // Check access permissions
    if (currentUser.role === 'employee' && currentUser.userId !== id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get employee
    const employee = await User.findById(id).select('-passwordHash');
    if (!employee || employee.role !== 'employee') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get employee profile
    const profile = await EmployeeProfile.findOne({ userId: id });

    return NextResponse.json({
      success: true,
      employee: {
        id: employee._id,
        username: employee.username,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        role: employee.role,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
        profile: profile ? {
          id: profile._id,
          basicSalary: profile.basicSalary,
          allowances: profile.allowances,
          deductions: profile.deductions,
          role: profile.role,
          responsibilities: profile.responsibilities,
          grade: profile.grade,
          employmentType: profile.employmentType,
          status: profile.status,
          joiningDate: profile.joiningDate,
          lastPromotionDate: profile.lastPromotionDate,
          promotionNotes: profile.promotionNotes,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Get employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const body = await request.json();

    // Get current employee
    const employee = await User.findById(id);
    if (!employee || employee.role !== 'employee') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const profile = await EmployeeProfile.findOne({ userId: id });

    // Check permissions
    if (currentUser.role === 'employee') {
      if (currentUser.userId !== id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
      
      // Employees can only update phone and address
      const allowedFields = ['phone', 'address'];
      const updateFields = Object.keys(body.user || {});
      const hasUnallowedField = updateFields.some(field => !allowedFields.includes(field));
      
      if (hasUnallowedField || body.profile) {
        return NextResponse.json(
          { error: 'Forbidden: You can only update phone and address' },
          { status: 403 }
        );
      }
    }

    const beforeState = {
      user: {
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
      },
      profile: profile ? {
        basicSalary: profile.basicSalary,
        allowances: profile.allowances,
        deductions: profile.deductions,
        role: profile.role,
        responsibilities: profile.responsibilities,
        grade: profile.grade,
        employmentType: profile.employmentType,
        status: profile.status,
        joiningDate: profile.joiningDate,
        lastPromotionDate: profile.lastPromotionDate,
        promotionNotes: profile.promotionNotes,
      } : null,
    };

    // Update user data if provided
    if (body.user) {
      const userValidatedData = updateUserSchema.parse(body.user);
      await User.findByIdAndUpdate(id, userValidatedData, { new: true });
    }

    // Update profile data if provided and user is admin
    if (body.profile && currentUser.role === 'admin') {
      const profileValidatedData = updateEmployeeProfileSchema.parse(body.profile);
      
      if (profile) {
        await EmployeeProfile.findOneAndUpdate(
          { userId: id },
          profileValidatedData,
          { new: true }
        );
      } else {
        // Create profile if it doesn't exist
        const newProfile = new EmployeeProfile({
          userId: id,
          ...profileValidatedData,
        });
        await newProfile.save();
      }
    }

    // Get updated data
    const updatedEmployee = await User.findById(id).select('-passwordHash');
    const updatedProfile = await EmployeeProfile.findOne({ userId: id });

    const afterState = {
      user: {
        name: updatedEmployee?.name,
        email: updatedEmployee?.email,
        phone: updatedEmployee?.phone,
        address: updatedEmployee?.address,
      },
      profile: updatedProfile ? {
        basicSalary: updatedProfile.basicSalary,
        allowances: updatedProfile.allowances,
        deductions: updatedProfile.deductions,
        role: updatedProfile.role,
        responsibilities: updatedProfile.responsibilities,
        grade: updatedProfile.grade,
        employmentType: updatedProfile.employmentType,
        status: updatedProfile.status,
        joiningDate: updatedProfile.joiningDate,
        lastPromotionDate: updatedProfile.lastPromotionDate,
        promotionNotes: updatedProfile.promotionNotes,
      } : null,
    };

    // Create audit log for admin actions
    if (currentUser.role === 'admin') {
      await createAuditLog({
        adminId: currentUser.userId,
        action: AUDIT_ACTIONS.UPDATE_EMPLOYEE,
        targetId: id,
        before: beforeState,
        after: afterState,
      });
    }

    return NextResponse.json({
      success: true,
      employee: {
        id: updatedEmployee?._id,
        username: updatedEmployee?.username,
        name: updatedEmployee?.name,
        email: updatedEmployee?.email,
        phone: updatedEmployee?.phone,
        address: updatedEmployee?.address,
        role: updatedEmployee?.role,
        createdAt: updatedEmployee?.createdAt,
        updatedAt: updatedEmployee?.updatedAt,
        profile: updatedProfile ? {
          id: updatedProfile._id,
          basicSalary: updatedProfile.basicSalary,
          allowances: updatedProfile.allowances,
          deductions: updatedProfile.deductions,
          role: updatedProfile.role,
          responsibilities: updatedProfile.responsibilities,
          grade: updatedProfile.grade,
          employmentType: updatedProfile.employmentType,
          status: updatedProfile.status,
          joiningDate: updatedProfile.joiningDate,
          lastPromotionDate: updatedProfile.lastPromotionDate,
          promotionNotes: updatedProfile.promotionNotes,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Update employee error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Get employee before deletion
    const employee = await User.findById(id);
    if (!employee || employee.role !== 'employee') {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const profile = await EmployeeProfile.findOne({ userId: id });

    // Delete employee profile first
    if (profile) {
      await EmployeeProfile.findOneAndDelete({ userId: id });
    }

    // Delete employee user
    await User.findByIdAndDelete(id);

    // Create audit log
    await createAuditLog({
      adminId: currentUser.userId,
      action: AUDIT_ACTIONS.DELETE_EMPLOYEE,
      targetId: id,
      before: {
        user: {
          username: employee.username,
          name: employee.name,
          email: employee.email,
        },
        profile: profile ? {
          role: profile.role,
          basicSalary: profile.basicSalary,
          grade: profile.grade,
        } : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
