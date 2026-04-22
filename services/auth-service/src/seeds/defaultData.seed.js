const bcrypt = require('bcryptjs');
const User = require('../models/User');

const defaultTherapists = [
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@wellnest.com',
    password: 'therapist123',
    phone: '9876543210',
    therapistProfile: {
      specializations: ['anxiety', 'depression', 'stress-management'],
      experienceYears: 8,
      licenseNumber: 'MH-PSY-2015-001',
      bio: 'I am a clinical psychologist with 8 years of experience helping individuals navigate anxiety, depression, and life transitions. My approach is warm, collaborative, and evidence-based. I believe every person has the inner strength to heal and grow.',
      sessionPrice: 1200,
      sessionDuration: 50,
      languages: ['English', 'Hindi'],
      approachMethods: ['CBT', 'mindfulness', 'psychoeducation'],
      isVerified: true,
      rating: 4.8,
      totalReviews: 124
    }
  },
  {
    name: 'Dr. Arjun Mehta',
    email: 'arjun.mehta@wellnest.com',
    password: 'therapist123',
    phone: '9876543211',
    therapistProfile: {
      specializations: ['trauma', 'ptsd', 'grief'],
      experienceYears: 12,
      licenseNumber: 'MH-PSY-2011-002',
      bio: 'Specialising in trauma recovery and grief counselling, I use EMDR and somatic approaches to help clients process difficult experiences. With over 12 years of practice I have supported hundreds of individuals reclaim their sense of safety and wellbeing.',
      sessionPrice: 1800,
      sessionDuration: 60,
      languages: ['English', 'Gujarati', 'Hindi'],
      approachMethods: ['EMDR', 'CBT', 'solution-focused'],
      isVerified: true,
      rating: 4.9,
      totalReviews: 89
    }
  },
  {
    name: 'Ms. Kavya Nair',
    email: 'kavya.nair@wellnest.com',
    password: 'therapist123',
    phone: '9876543212',
    therapistProfile: {
      specializations: ['anxiety', 'ocd', 'addiction'],
      experienceYears: 5,
      licenseNumber: 'MH-PSY-2019-003',
      bio: 'I am a licensed counselling therapist focused on helping people break free from anxiety cycles, OCD patterns, and addictive behaviours. I create a non-judgmental space where clients feel truly heard and supported on their path to recovery.',
      sessionPrice: 900,
      sessionDuration: 50,
      languages: ['English', 'Malayalam', 'Tamil'],
      approachMethods: ['CBT', 'DBT', 'mindfulness'],
      isVerified: true,
      rating: 4.7,
      totalReviews: 56
    }
  },
  {
    name: 'Dr. Rohan Verma',
    email: 'rohan.verma@wellnest.com',
    password: 'therapist123',
    phone: '9876543213',
    therapistProfile: {
      specializations: ['depression', 'grief', 'ptsd'],
      experienceYears: 10,
      licenseNumber: 'MH-PSY-2013-004',
      bio: 'My practice centres around helping individuals who are experiencing depression, loss, and the aftermath of difficult life events. I bring a compassionate, person-centred approach combined with structured cognitive techniques to foster lasting recovery.',
      sessionPrice: 1500,
      sessionDuration: 50,
      languages: ['English', 'Hindi', 'Punjabi'],
      approachMethods: ['CBT', 'psychoeducation', 'solution-focused'],
      isVerified: true,
      rating: 4.6,
      totalReviews: 78
    }
  },
  {
    name: 'Ms. Sneha Pillai',
    email: 'sneha.pillai@wellnest.com',
    password: 'therapist123',
    phone: '9876543214',
    therapistProfile: {
      specializations: ['anxiety', 'depression', 'addiction'],
      experienceYears: 6,
      licenseNumber: 'MH-PSY-2018-005',
      bio: 'I believe healing is a journey, not a destination. As a therapist specialising in anxiety, depression, and addiction recovery, I work collaboratively with clients to build resilience, self-awareness, and practical coping strategies. Sessions with me are open, honest, and always at your pace.',
      sessionPrice: 1000,
      sessionDuration: 50,
      languages: ['English', 'Malayalam'],
      approachMethods: ['DBT', 'mindfulness', 'psychoeducation'],
      isVerified: true,
      rating: 4.5,
      totalReviews: 43
    }
  }
];

const runDefaultSeed = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@wellnest.com' });
    if (adminExists) {
      console.log('Default data already seeded. Skipping.');
      return;
    }

    const adminHash = await bcrypt.hash('123456', 12);
    await User.create({
      name: 'WellNest Admin',
      email: 'admin@wellnest.com',
      passwordHash: adminHash,
      role: 'admin',
      isActive: true
    });
    console.log('Created: WellNest Admin (admin)');

    for (const t of defaultTherapists) {
      const hash = await bcrypt.hash(t.password, 12);
      await User.create({
        name: t.name,
        email: t.email,
        passwordHash: hash,
        role: 'therapist',
        phone: t.phone,
        isActive: true,
        therapistProfile: t.therapistProfile
      });
      console.log(`Created: ${t.name} (therapist)`);
    }

    console.log('Default seed completed successfully.');
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

module.exports = { runDefaultSeed };
