const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('========================================');
  console.log('🔐 CREATING ADMIN USER');
  console.log('========================================\n');

  // Fixed credentials
  const adminEmail = 'admin@lmtek.com';
  const adminPassword = 'bc12614839ed329214f8a2e12075447c';
  const adminName = 'System Administrator';

  console.log('Email:', adminEmail);
  console.log('Password:', adminPassword);
  console.log('Name:', adminName);
  console.log('\n⏳ Hashing password...');

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  console.log('✅ Password hashed successfully');
  console.log('\n⏳ Creating/updating admin user in database...');

  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: adminName,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'ADMIN',
    },
  });

  console.log('\n========================================');
  console.log('✅ ADMIN USER CREATED SUCCESSFULLY!');
  console.log('========================================\n');
  console.log('LOGIN CREDENTIALS:');
  console.log('------------------');
  console.log('Email:   ', adminEmail);
  console.log('Password:', adminPassword);
  console.log('Role:    ', admin.role);
  console.log('User ID: ', admin.id);
  console.log('\n========================================');
  console.log('🎉 YOU CAN NOW LOGIN!');
  console.log('========================================\n');
}

main()
  .catch((error) => {
    console.error('\n========================================');
    console.error('❌ ERROR CREATING ADMIN USER');
    console.error('========================================\n');
    console.error(error);
    console.error('\nDatabase URL exists:', !!process.env.DATABASE_URL);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
