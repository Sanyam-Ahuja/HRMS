import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeProfile from '@/models/EmployeeProfile';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Build query for employees
    let userQuery: any = { role: 'employee' };
    
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Get employees with their profiles
    const employees = await User.find(userQuery)
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    // Get employee profiles
    const employeeIds = employees.map(emp => emp._id);
    let profileQuery: any = { userId: { $in: employeeIds } };
    
    if (status) {
      profileQuery.status = status;
    }

    const profiles = await EmployeeProfile.find(profileQuery);

    // Combine user and profile data
    const employeesWithProfiles = employees.map(employee => {
      const profile = profiles.find(p => p.userId.toString() === employee._id.toString());
      return {
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
      };
    }).filter(emp => !status || (emp.profile && emp.profile.status === status));

    return NextResponse.json({
      success: true,
      employees: employeesWithProfiles,
    });
  } catch (error: any) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
