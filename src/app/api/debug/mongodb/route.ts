import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeProfile from '@/models/EmployeeProfile';
import Payroll from '@/models/Payroll';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('=== MongoDB Health Check ===');
    
    // Test 1: Basic connection
    console.log('Testing basic connection...');
    await dbConnect();
    console.log('✅ Database connection established');

    // Test 2: Check connection state
    const connectionState = mongoose.connection.readyState;
    const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log(`Connection state: ${connectionState} (${stateNames[connectionState]})`);

    // Test 3: Database info
    const dbName = mongoose.connection.db?.databaseName;
    console.log(`Database name: ${dbName}`);

    // Test 4: Test collections exist
    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log('Collections:', collections?.map(c => c.name));

    // Test 5: Count documents in each collection
    const userCount = await User.countDocuments();
    const employeeProfileCount = await EmployeeProfile.countDocuments();
    const payrollCount = await Payroll.countDocuments();
    const auditLogCount = await AuditLog.countDocuments();

    console.log('Document counts:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Employee Profiles: ${employeeProfileCount}`);
    console.log(`- Payroll Records: ${payrollCount}`);
    console.log(`- Audit Logs: ${auditLogCount}`);

    // Test 6: Test a simple query
    const adminUser = await User.findOne({ role: 'admin' });
    console.log('Admin user found:', !!adminUser);

    // Test 7: Test write operation (create and delete a test document)
    const testDoc = new User({
      role: 'admin',
      username: 'test_connection_' + Date.now(),
      passwordHash: 'test',
      name: 'Test User',
      email: 'test' + Date.now() + '@test.com',
      phone: '0000000000',
      address: 'Test Address',
    });

    await testDoc.save();
    console.log('✅ Test document created');

    await User.findByIdAndDelete(testDoc._id);
    console.log('✅ Test document deleted');

    return NextResponse.json({
      success: true,
      mongodb: {
        connected: true,
        connectionState: stateNames[connectionState],
        database: dbName,
        collections: collections?.map(c => c.name) || [],
        documentCounts: {
          users: userCount,
          employeeProfiles: employeeProfileCount,
          payrollRecords: payrollCount,
          auditLogs: auditLogCount,
        },
        adminExists: !!adminUser,
        writeTestPassed: true,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ MongoDB Health Check Failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      mongodb: {
        connected: false,
        connectionState: mongoose.connection.readyState,
        error: {
          name: error.name,
          message: error.message,
          code: error.code,
        },
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Also allow POST for testing from frontend
export async function POST(request: NextRequest) {
  return GET(request);
}
