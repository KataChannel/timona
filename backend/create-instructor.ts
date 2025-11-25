import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createInstructor() {
  try {
    // Thông tin giảng viên
    const instructorData = {
      username: 'giangvien01',      // Thay đổi tên đăng nhập
      email: 'giangvien01@example.com', // Thay đổi email
      password: '123456',            // Thay đổi mật khẩu
      phone: '0912345678',          // Tùy chọn
      firstName: 'Nguyễn Văn',      // Tùy chọn
      lastName: 'A',                // Tùy chọn
      roleType: 'USER',             // Changed from GIANGVIEN
      isActive: true,               // Kích hoạt tài khoản
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(instructorData.password, 10);

    // Tạo user
    const instructor = await prisma.user.create({
      data: {
        username: instructorData.username,
        email: instructorData.email,
        password: hashedPassword,
        phone: instructorData.phone,
        firstName: instructorData.firstName,
        lastName: instructorData.lastName,
        roleType: instructorData.roleType as any,
        isActive: instructorData.isActive,
        isVerified: true, // Auto verify
      },
    });

    console.log('✅ Đã tạo user thành công!');

    // Lấy giangvien role
    const giangvienRole = await prisma.role.findUnique({
      where: { name: 'giangvien' }
    });

    if (!giangvienRole) {
      console.error('❌ Không tìm thấy role giangvien. Vui lòng chạy seed RBAC trước!');
      console.log('   Chạy: bun run scripts/seed-rbac-standalone.ts');
      return;
    }

    // Assign giangvien role
    await prisma.userRoleAssignment.create({
      data: {
        userId: instructor.id,
        roleId: giangvienRole.id,
        effect: 'allow',
        assignedBy: 'system',
      }
    });

    console.log('✅ Đã assign role giảng viên!');
    console.log('📋 Thông tin:');
    console.log('   - ID:', instructor.id);
    console.log('   - Username:', instructor.username);
    console.log('   - Email:', instructor.email);
    console.log('   - Họ tên:', `${instructor.firstName} ${instructor.lastName}`);
    console.log('   - Vai trò hệ thống:', instructor.roleType);
    console.log('   - Role được assign: giangvien (LMS Instructor)');
    console.log('   - Trạng thái:', instructor.isActive ? 'Kích hoạt' : 'Vô hiệu hóa');
    console.log('\n🔑 Đăng nhập với:');
    console.log('   - Username:', instructor.username);
    console.log('   - Password:', instructorData.password);
    console.log('   - Redirect: /lms/instructor');

  } catch (error: any) {
    console.error('❌ Lỗi:', error.message);
    
    if (error.code === 'P2002') {
      console.error('💡 Username hoặc Email đã tồn tại, vui lòng thay đổi!');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createInstructor();
