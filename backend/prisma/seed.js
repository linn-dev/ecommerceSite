import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@admin.com';
  const plainPassword = 'superuser';

  const hashed = await bcrypt.hash(plainPassword, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    },
    create: {
      email,
      password: hashed,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  });

  console.log(`✅ Seeded admin user: ${email} (password: ${plainPassword})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
