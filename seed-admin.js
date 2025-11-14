const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// User Schema
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin', 'employee'],
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.username);
      return;
    }

    // Create super admin
    const passwordHash = await bcrypt.hash('admin123', 12);

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
    
    console.log('✅ Super admin created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change the password after first login.');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

seed();
