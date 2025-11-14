import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeProfile from '@/models/EmployeeProfile';
import { getUserFromRequest, hashPassword } from '@/lib/auth';
import { createUserSchema, createEmployeeProfileSchema } from '@/lib/validations';
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
    
    // Validate user input
    const userValidatedData = createUserSchema.parse({
      ...body.user,
      role: 'employee', // Force role to be employee
    });

    // Check if username already exists
    const existingUser = await User.findOne({ username: userValidatedData.username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: userValidatedData.email });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(userValidatedData.password);

    // Create new employee user
    const newEmployee = new User({
      ...userValidatedData,
      passwordHash,
      role: 'employee',
    });

    await newEmployee.save();

    // Validate and create employee profile
    const profileValidatedData = createEmployeeProfileSchema.parse({
      ...body.profile,
      userId: newEmployee._id.toString(),
    });

    const newProfile = new EmployeeProfile(profileValidatedData);
    await newProfile.save();

    // Create audit log
    await createAuditLog({
      adminId: currentUser.userId,
      action: AUDIT_ACTIONS.CREATE_EMPLOYEE,
      targetId: newEmployee._id.toString(),
      after: {
        user: {
          username: newEmployee.username,
          name: newEmployee.name,
          email: newEmployee.email,
        },
        profile: {
          role: newProfile.role,
          basicSalary: newProfile.basicSalary,
          grade: newProfile.grade,
        },
      },
    });

    return NextResponse.json({
      success: true,
      employee: {
        id: newEmployee._id,
        username: newEmployee.username,
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        address: newEmployee.address,
        role: newEmployee.role,
        createdAt: newEmployee.createdAt,
        profile: {
          id: newProfile._id,
          basicSalary: newProfile.basicSalary,
          allowances: newProfile.allowances,
          deductions: newProfile.deductions,
          role: newProfile.role,
          responsibilities: newProfile.responsibilities,
          grade: newProfile.grade,
          employmentType: newProfile.employmentType,
          status: newProfile.status,
          joiningDate: newProfile.joiningDate,
          lastPromotionDate: newProfile.lastPromotionDate,
          promotionNotes: newProfile.promotionNotes,
        },
      },
    });
  } catch (error: any) {
    console.error('Create employee error:', error);
    
    if (error.name === 'ZodError') {
      console.log('Validation errors:', error.errors);
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this username or email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
