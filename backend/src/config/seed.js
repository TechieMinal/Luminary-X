require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');

const DEMO_ACCOUNTS = [
  {
    name: 'Alex Chen',
    email: 'student@demo.com',
    password: 'Demo@12345',
    role: 'student',
    bio: 'Full-stack developer passionate about building products that matter.',
    isApproved: true,
    isActive: true,
  },
  {
    name: 'Sarah Mitchell',
    email: 'mentor@demo.com',
    password: 'Demo@12345',
    role: 'mentor',
    bio: 'Staff Engineer at Stripe. 10+ years building distributed systems. Love helping engineers grow.',
    isApproved: true,
    isActive: true,
  },
  {
    name: 'Luminary Admin',
    email: 'admin@luminaryx.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin',
    isApproved: true,
    isActive: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    for (const account of DEMO_ACCOUNTS) {
      const existing = await User.findOne({ email: account.email });
      if (existing) {
        console.log(`ℹ️  Already exists: ${account.email}`);
        continue;
      }

      const user = await User.create(account);

      if (account.role === 'mentor') {
        await MentorProfile.create({
          user: user._id,
          expertise: ['System Design', 'Node.js', 'Career Growth', 'Distributed Systems'],
          yearsOfExperience: 10,
          currentRole: 'Staff Engineer',
          company: 'Stripe',
          availableSlots: 5,
          sessionRate: 0,
          rating: { average: 4.9, count: 47 },
        });
      }

      console.log(`✅ Created [${account.role}]: ${account.email}`);
    }

    console.log('\n────────────────────────────────────────');
    console.log('  DEMO CREDENTIALS');
    console.log('────────────────────────────────────────');
    console.log('  Student:  student@demo.com / Demo@12345');
    console.log('  Mentor:   mentor@demo.com  / Demo@12345');
    console.log('  Admin:    admin@luminaryx.com / Admin@123456');
    console.log('────────────────────────────────────────\n');
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
