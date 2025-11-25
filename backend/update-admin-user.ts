import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdminUser() {
  try {
    console.log('🔄 Updating admin user details...');

    // Update admin user with correct phone number
    const updatedUser = await prisma.user.update({
      where: {
        email: 'katachanneloffical@gmail.com'
      },
      data: {
        phone: '0977272967',
        firstName: 'Phạm',
        lastName: 'Chí Kiệt'
      }
    });

    console.log('✅ Admin user updated successfully:');
    console.log(`   📧 Email: ${updatedUser.email}`);
    console.log(`   📱 Phone: ${updatedUser.phone}`);
    console.log(`   👤 Name: ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log(`   🆔 Username: ${updatedUser.username}`);
    console.log(`   ✅ Active: ${updatedUser.isActive}`);
    console.log(`   ✅ Verified: ${updatedUser.isVerified}`);

  } catch (error) {
    console.error('❌ Error updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminUser();