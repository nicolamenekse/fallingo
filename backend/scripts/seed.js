require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const USERS = [
  {
    name: 'Test Kullanıcı',
    email: 'test@fallingo.com',
    password: 'test1234',
    zodiacSign: 'Akrep',
    birthDate: new Date('1995-06-15'),
    subscription: {
      plan: 'free',
      isActive: false,
    },
  },
  {
    name: 'Premium Kullanıcı',
    email: 'premium@fallingo.com',
    password: 'premium1234',
    zodiacSign: 'Aslan',
    birthDate: new Date('1990-08-10'),
    subscription: {
      plan: 'premium',
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: 'Admin Kullanıcı',
    email: 'admin@fallingo.com',
    password: 'admin1234',
    zodiacSign: 'Koç',
    birthDate: new Date('1988-03-21'),
    subscription: {
      plan: 'vip',
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlandı\n');

    for (const userData of USERS) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⚠️  Zaten var, atlanıyor: ${userData.email}`);
        continue;
      }
      const user = await User.create(userData);
      console.log(`✅ Oluşturuldu: ${user.name} (${user.email}) — Plan: ${user.subscription.plan}`);
    }

    console.log('\n📋 Tüm kullanıcılar:');
    console.log('─────────────────────────────────────────');
    console.log(' E-posta                  | Şifre        | Plan    ');
    console.log('─────────────────────────────────────────');
    USERS.forEach(u => {
      const email = u.email.padEnd(25);
      const pass = u.password.padEnd(12);
      console.log(` ${email} | ${pass} | ${u.subscription.plan}`);
    });
    console.log('─────────────────────────────────────────');

  } catch (err) {
    console.error('❌ Hata:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB bağlantısı kapatıldı.');
  }
}

seed();
