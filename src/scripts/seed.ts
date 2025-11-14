import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

async function seed() {
  try {
    await dbConnect();

    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.username);
      return;
    }

    // Create super admin
    const passwordHash = await hashPassword('admin123');

    const superAdmin = new User({
      role: 'admin',
      username: 'admin',
      passwordHash,
      name: 'System Administrator',
      email: 'admin@hrms.com',
      phone: '+91-9999999999',
      address: 'Head Office, Main Street, City',
    });

    await superAdmin.save();
    
    console.log('Super admin created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change the password after first login.');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    process.exit(0);
  }
}

seed();
