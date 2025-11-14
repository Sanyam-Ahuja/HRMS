import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeProfile from '@/models/EmployeeProfile';
import { getUserFromRequest, hashPassword } from '@/lib/auth';
import { createUserSchema, createEmployeeProfileSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Check if user is admin
    const currentUser = getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Test data for employee creation
    const testEmployeeData = {
      user: {
        name: 'Test Employee',
        username: 'test_emp_' + Date.now(),
        password: 'test123',
        email: 'test' + Date.now() + '@example.com',
        phone: '+91-9876543210',
        address: 'Test Address, Test City, Test State',
      },
      profile: {
        basicSalary: 50000,
        allowances: 5000,
        deductions: 2000,
        role: 'Software Developer',
        responsibilities: 'Develop and maintain software applications',
        grade: 'L1',
        employmentType: 'Full-time',
        status: 'Active' as const,
        joiningDate: new Date().toISOString().split('T')[0], // Today's date
      },
    };

    console.log('Testing employee creation with data:', testEmployeeData);

    // Validate user input
    const userValidatedData = createUserSchema.parse({
      ...testEmployeeData.user,
      role: 'employee',
    });

    console.log('User validation passed:', userValidatedData);

    // Check if username already exists
    const existingUser = await User.findOne({ username: userValidatedData.username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists', username: userValidatedData.username },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: userValidatedData.email });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists', email: userValidatedData.email },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(userValidatedData.password);
    console.log('Password hashed successfully');

    // Create new employee user
    const newEmployee = new User({
      ...userValidatedData,
      passwordHash,
      role: 'employee',
    });

    await newEmployee.save();
    console.log('Employee user created:', newEmployee._id);

    // Validate and create employee profile
    const profileValidatedData = createEmployeeProfileSchema.parse({
      ...testEmployeeData.profile,
      userId: newEmployee._id.toString(),
    });

    console.log('Profile validation passed:', profileValidatedData);

    const newProfile = new EmployeeProfile(profileValidatedData);
    await newProfile.save();
    console.log('Employee profile created:', newProfile._id);

    return NextResponse.json({
      success: true,
      message: 'Test employee created successfully',
      employee: {
        id: newEmployee._id,
        username: newEmployee.username,
        name: newEmployee.name,
        email: newEmployee.email,
        profile: {
          id: newProfile._id,
          basicSalary: newProfile.basicSalary,
          role: newProfile.role,
          status: newProfile.status,
        },
      },
    });
  } catch (error: any) {
    console.error('Test employee creation error:', error);
    
    if (error.name === 'ZodError') {
      console.log('Validation errors:', error.errors);
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
            received: err.received,
            code: err.code,
          }))
        },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Duplicate key error', details: error.keyValue },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
