import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest, hashPassword } from '@/lib/auth';
import { createUserSchema } from '@/lib/validations';
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
    const validatedData = createUserSchema.parse({
      ...body,
      role: 'admin', // Force role to be admin
    });

    // Check if username already exists
    const existingUser = await User.findOne({ username: validatedData.username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: validatedData.email });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create new admin
    const newAdmin = new User({
      ...validatedData,
      passwordHash,
      role: 'admin',
    });

    await newAdmin.save();

    // Create audit log
    await createAuditLog({
      adminId: currentUser.userId,
      action: AUDIT_ACTIONS.CREATE_ADMIN,
      targetId: newAdmin._id.toString(),
      after: {
        username: newAdmin.username,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        address: newAdmin.address,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    
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
