import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🌱 RBAC SEEDER - LMS Permissions & Giangvien Role');
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Create LMS Permissions
    console.log('📋 Step 1: Creating LMS Permissions...\n');

    const lmsPermissions = [
      // LMS - Course Management
      { name: 'lms:courses:create', displayName: 'Tạo khóa học', resource: 'lms_course', action: 'create', category: 'lms_management' },
      { name: 'lms:courses:read', displayName: 'Xem khóa học', resource: 'lms_course', action: 'read', category: 'lms_management' },
      { name: 'lms:courses:update', displayName: 'Cập nhật khóa học', resource: 'lms_course', action: 'update', category: 'lms_management' },
      { name: 'lms:courses:delete', displayName: 'Xóa khóa học', resource: 'lms_course', action: 'delete', category: 'lms_management' },
      { name: 'lms:courses:publish', displayName: 'Xuất bản khóa học', resource: 'lms_course', action: 'publish', category: 'lms_management' },
      { name: 'lms:courses:manage_own', displayName: 'Quản lý khóa học của mình', resource: 'lms_course', action: 'manage', scope: 'own', category: 'lms_management' },
      { name: 'lms:courses:manage_all', displayName: 'Quản lý tất cả khóa học', resource: 'lms_course', action: 'manage', scope: 'all', category: 'lms_management' },
      
      // LMS - Lesson Management
      { name: 'lms:lessons:create', displayName: 'Tạo bài giảng', resource: 'lms_lesson', action: 'create', category: 'lms_management' },
      { name: 'lms:lessons:read', displayName: 'Xem bài giảng', resource: 'lms_lesson', action: 'read', category: 'lms_management' },
      { name: 'lms:lessons:update', displayName: 'Cập nhật bài giảng', resource: 'lms_lesson', action: 'update', category: 'lms_management' },
      { name: 'lms:lessons:delete', displayName: 'Xóa bài giảng', resource: 'lms_lesson', action: 'delete', category: 'lms_management' },
      
      // LMS - Module Management
      { name: 'lms:modules:create', displayName: 'Tạo chương học', resource: 'lms_module', action: 'create', category: 'lms_management' },
      { name: 'lms:modules:read', displayName: 'Xem chương học', resource: 'lms_module', action: 'read', category: 'lms_management' },
      { name: 'lms:modules:update', displayName: 'Cập nhật chương học', resource: 'lms_module', action: 'update', category: 'lms_management' },
      { name: 'lms:modules:delete', displayName: 'Xóa chương học', resource: 'lms_module', action: 'delete', category: 'lms_management' },
      
      // LMS - Quiz Management
      { name: 'lms:quizzes:create', displayName: 'Tạo bài kiểm tra', resource: 'lms_quiz', action: 'create', category: 'lms_management' },
      { name: 'lms:quizzes:read', displayName: 'Xem bài kiểm tra', resource: 'lms_quiz', action: 'read', category: 'lms_management' },
      { name: 'lms:quizzes:update', displayName: 'Cập nhật bài kiểm tra', resource: 'lms_quiz', action: 'update', category: 'lms_management' },
      { name: 'lms:quizzes:delete', displayName: 'Xóa bài kiểm tra', resource: 'lms_quiz', action: 'delete', category: 'lms_management' },
      { name: 'lms:quizzes:grade', displayName: 'Chấm điểm bài kiểm tra', resource: 'lms_quiz', action: 'grade', category: 'lms_management' },
      
      // LMS - Enrollment Management
      { name: 'lms:enrollments:create', displayName: 'Tạo ghi danh', resource: 'lms_enrollment', action: 'create', category: 'lms_management' },
      { name: 'lms:enrollments:read', displayName: 'Xem ghi danh', resource: 'lms_enrollment', action: 'read', category: 'lms_management' },
      { name: 'lms:enrollments:update', displayName: 'Cập nhật ghi danh', resource: 'lms_enrollment', action: 'update', category: 'lms_management' },
      { name: 'lms:enrollments:delete', displayName: 'Xóa ghi danh', resource: 'lms_enrollment', action: 'delete', category: 'lms_management' },
      { name: 'lms:enrollments:approve', displayName: 'Duyệt ghi danh', resource: 'lms_enrollment', action: 'approve', category: 'lms_management' },
      
      // LMS - Review Management
      { name: 'lms:reviews:create', displayName: 'Tạo đánh giá', resource: 'lms_review', action: 'create', category: 'lms_management' },
      { name: 'lms:reviews:read', displayName: 'Xem đánh giá', resource: 'lms_review', action: 'read', category: 'lms_management' },
      { name: 'lms:reviews:update', displayName: 'Cập nhật đánh giá', resource: 'lms_review', action: 'update', category: 'lms_management' },
      { name: 'lms:reviews:delete', displayName: 'Xóa đánh giá', resource: 'lms_review', action: 'delete', category: 'lms_management' },
      { name: 'lms:reviews:moderate', displayName: 'Kiểm duyệt đánh giá', resource: 'lms_review', action: 'moderate', category: 'lms_management' },
      
      // LMS - Category Management
      { name: 'lms:categories:create', displayName: 'Tạo danh mục khóa học', resource: 'lms_category', action: 'create', category: 'lms_management' },
      { name: 'lms:categories:read', displayName: 'Xem danh mục khóa học', resource: 'lms_category', action: 'read', category: 'lms_management' },
      { name: 'lms:categories:update', displayName: 'Cập nhật danh mục khóa học', resource: 'lms_category', action: 'update', category: 'lms_management' },
      { name: 'lms:categories:delete', displayName: 'Xóa danh mục khóa học', resource: 'lms_category', action: 'delete', category: 'lms_management' },
      
      // LMS - Source Document Management
      { name: 'lms:documents:create', displayName: 'Tạo tài liệu nguồn', resource: 'lms_document', action: 'create', category: 'lms_management' },
      { name: 'lms:documents:read', displayName: 'Xem tài liệu nguồn', resource: 'lms_document', action: 'read', category: 'lms_management' },
      { name: 'lms:documents:update', displayName: 'Cập nhật tài liệu nguồn', resource: 'lms_document', action: 'update', category: 'lms_management' },
      { name: 'lms:documents:delete', displayName: 'Xóa tài liệu nguồn', resource: 'lms_document', action: 'delete', category: 'lms_management' },
      
      // LMS - Certificate Management
      { name: 'lms:certificates:create', displayName: 'Tạo chứng chỉ', resource: 'lms_certificate', action: 'create', category: 'lms_management' },
      { name: 'lms:certificates:read', displayName: 'Xem chứng chỉ', resource: 'lms_certificate', action: 'read', category: 'lms_management' },
      { name: 'lms:certificates:issue', displayName: 'Cấp chứng chỉ', resource: 'lms_certificate', action: 'issue', category: 'lms_management' },
      { name: 'lms:certificates:revoke', displayName: 'Thu hồi chứng chỉ', resource: 'lms_certificate', action: 'revoke', category: 'lms_management' },
      
      // LMS - Discussion Management
      { name: 'lms:discussions:create', displayName: 'Tạo thảo luận', resource: 'lms_discussion', action: 'create', category: 'lms_management' },
      { name: 'lms:discussions:read', displayName: 'Xem thảo luận', resource: 'lms_discussion', action: 'read', category: 'lms_management' },
      { name: 'lms:discussions:update', displayName: 'Cập nhật thảo luận', resource: 'lms_discussion', action: 'update', category: 'lms_management' },
      { name: 'lms:discussions:delete', displayName: 'Xóa thảo luận', resource: 'lms_discussion', action: 'delete', category: 'lms_management' },
      { name: 'lms:discussions:moderate', displayName: 'Kiểm duyệt thảo luận', resource: 'lms_discussion', action: 'moderate', category: 'lms_management' },
      
      // LMS - Student View
      { name: 'lms:student:enroll', displayName: 'Đăng ký học', resource: 'lms_student', action: 'enroll', category: 'lms_student' },
      { name: 'lms:student:learn', displayName: 'Học bài', resource: 'lms_student', action: 'learn', category: 'lms_student' },
      { name: 'lms:student:take_quiz', displayName: 'Làm bài kiểm tra', resource: 'lms_student', action: 'take_quiz', category: 'lms_student' },
      { name: 'lms:student:view_progress', displayName: 'Xem tiến độ học', resource: 'lms_student', action: 'view_progress', category: 'lms_student' },
      { name: 'lms:student:review', displayName: 'Đánh giá khóa học', resource: 'lms_student', action: 'review', category: 'lms_student' },

      // Basic permissions
      { name: 'content:read', displayName: 'Read Content', resource: 'content', action: 'read', category: 'content_management' },
      { name: 'analytics:read', displayName: 'Read Analytics', resource: 'analytics', action: 'read', category: 'analytics' },
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const perm of lmsPermissions) {
      try {
        await prisma.permission.upsert({
          where: { name: perm.name },
          update: {},
          create: {
            ...perm,
            description: `Permission to ${perm.action} ${perm.resource}`,
            isSystemPerm: true,
            isActive: true,
          }
        });
        createdCount++;
        console.log(`   ✅ ${perm.name}`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          existingCount++;
          console.log(`   ⏭️  ${perm.name} (exists)`);
        } else {
          console.error(`   ❌ Failed: ${perm.name}`, error.message);
        }
      }
    }

    console.log(`\n   📊 Permissions: ${createdCount} created/updated, ${existingCount} existed`);

    // Step 2: Create Giangvien Role
    console.log('\n📋 Step 2: Creating Giangvien Role...\n');

    const giangvienRole = await prisma.role.upsert({
      where: { name: 'giangvien' },
      update: {
        displayName: 'Giảng viên',
        description: 'Instructor role with full LMS course management capabilities',
        priority: 750,
        isSystemRole: true,
      },
      create: {
        name: 'giangvien',
        displayName: 'Giảng viên',
        description: 'Instructor role with full LMS course management capabilities',
        priority: 750,
        isSystemRole: true,
        isActive: true,
      }
    });

    console.log(`   ✅ Role created: ${giangvienRole.displayName} (ID: ${giangvienRole.id})`);

    // Step 3: Assign Permissions to Giangvien Role
    console.log('\n📋 Step 3: Assigning permissions to Giangvien role...\n');

    const giangvienPermissionNames = [
      // Course Management
      'lms:courses:create', 'lms:courses:read', 'lms:courses:update', 'lms:courses:delete',
      'lms:courses:publish', 'lms:courses:manage_own',
      // Lesson Management
      'lms:lessons:create', 'lms:lessons:read', 'lms:lessons:update', 'lms:lessons:delete',
      // Module Management
      'lms:modules:create', 'lms:modules:read', 'lms:modules:update', 'lms:modules:delete',
      // Quiz Management
      'lms:quizzes:create', 'lms:quizzes:read', 'lms:quizzes:update', 'lms:quizzes:delete', 'lms:quizzes:grade',
      // Enrollment Management
      'lms:enrollments:read', 'lms:enrollments:update', 'lms:enrollments:approve',
      // Review Management
      'lms:reviews:read', 'lms:reviews:moderate',
      // Category (Read only)
      'lms:categories:read',
      // Document Management
      'lms:documents:create', 'lms:documents:read', 'lms:documents:update', 'lms:documents:delete',
      // Certificate Management
      'lms:certificates:create', 'lms:certificates:read', 'lms:certificates:issue',
      // Discussion Management
      'lms:discussions:create', 'lms:discussions:read', 'lms:discussions:update', 'lms:discussions:delete', 'lms:discussions:moderate',
      // Basic access
      'content:read', 'analytics:read',
    ];

    const permissions = await prisma.permission.findMany({
      where: {
        name: {
          in: giangvienPermissionNames
        }
      }
    });

    console.log(`   📊 Found ${permissions.length} permissions to assign`);

    // Delete existing assignments first
    await prisma.rolePermission.deleteMany({
      where: { roleId: giangvienRole.id }
    });

    // Create new assignments
    for (const perm of permissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: giangvienRole.id,
          permissionId: perm.id,
          effect: 'allow',
          grantedBy: 'system',
        }
      });
      console.log(`   ✅ ${perm.name}`);
    }

    console.log(`\n   📊 Assigned ${permissions.length} permissions to giangvien role`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ RBAC SEEDING COMPLETE');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - LMS Permissions created: ${lmsPermissions.length}`);
    console.log(`   - Giangvien role created: Yes`);
    console.log(`   - Permissions assigned to role: ${permissions.length}`);
    console.log('\n✨ Next steps:');
    console.log('   1. Run migration script: bun run scripts/migrate-giangvien-to-role.ts');
    console.log('   2. Run Prisma migrate to update schema');
    console.log('   3. Test login with giangvien users\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
