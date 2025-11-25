"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting LMS seeding with 4 Soft Skills Courses...\n');
    console.log('🗑️  Deleting all existing courses and related data...\n');
    try {
        await prisma.answer.deleteMany({});
        console.log('   ✅ Deleted all answers');
        await prisma.question.deleteMany({});
        console.log('   ✅ Deleted all questions');
        await prisma.quiz.deleteMany({});
        console.log('   ✅ Deleted all quizzes');
        await prisma.lesson.deleteMany({});
        console.log('   ✅ Deleted all lessons');
        await prisma.courseModule.deleteMany({});
        console.log('   ✅ Deleted all course modules');
        await prisma.enrollment.deleteMany({});
        console.log('   ✅ Deleted all enrollments');
        await prisma.course.deleteMany({});
        console.log('   ✅ Deleted all courses');
        await prisma.courseCategory.deleteMany({});
        console.log('   ✅ Deleted all course categories\n');
        console.log('✨ All existing course data cleaned successfully!\n');
    }
    catch (error) {
        console.error('❌ Error deleting existing data:', error);
        throw error;
    }
    const hashedPassword = await bcrypt.hash('password123', 10);
    const instructor = await prisma.user.upsert({
        where: { email: 'instructor@lms.com' },
        update: {},
        create: {
            email: 'instructor@lms.com',
            username: 'instructor_demo',
            password: hashedPassword,
            firstName: 'Thầy',
            lastName: 'Kỹ Năng',
            roleType: client_1.UserRoleType.ADMIN,
            isActive: true,
            isVerified: true,
        },
    });
    const student = await prisma.user.upsert({
        where: { email: 'student@lms.com' },
        update: {},
        create: {
            email: 'student@lms.com',
            username: 'student_demo',
            password: hashedPassword,
            firstName: 'Học viên',
            lastName: 'Thông minh',
            roleType: client_1.UserRoleType.USER,
            isActive: true,
            isVerified: true,
        },
    });
    console.log(`✅ Created users\n`);
    const basicSkillsCat = await prisma.courseCategory.upsert({
        where: { slug: 'basic-soft-skills' },
        update: {},
        create: {
            name: 'Kỹ năng mềm cơ bản',
            slug: 'basic-soft-skills',
            description: 'Kỹ năng cần thiết cho mọi người',
            icon: '🎯'
        },
    });
    const advancedSkillsCat = await prisma.courseCategory.upsert({
        where: { slug: 'advanced-soft-skills' },
        update: {},
        create: {
            name: 'Kỹ năng mềm nâng cao',
            slug: 'advanced-soft-skills',
            description: 'Kỹ năng cho lãnh đạo và chuyên gia',
            icon: '🚀'
        },
    });
    console.log(`✅ Created categories\n`);
    console.log('🎯 Creating COURSE 1: Kỹ năng giao tiếp hiệu quả...');
    const communicationCourse = await prisma.course.create({
        data: {
            title: 'Kỹ năng giao tiếp hiệu quả trong công việc',
            slug: 'ky-nang-giao-tiep-hieu-qua',
            description: 'Nắm vững nghệ thuật giao tiếp, thuyết trình và xây dựng mối quan hệ tốt trong môi trường làm việc.',
            thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
            price: 299000,
            level: client_1.CourseLevel.BEGINNER,
            status: client_1.CourseStatus.PUBLISHED,
            duration: 300,
            instructorId: instructor.id,
            categoryId: basicSkillsCat.id,
            whatYouWillLearn: ['Nguyên tắc giao tiếp hiệu quả', 'Kỹ năng lắng nghe tích cực', 'Thuyết trình tự tin', 'Xử lý xung đột', 'Giao tiếp qua email chuyên nghiệp'],
            requirements: ['Không yêu cầu kinh nghiệm', 'Tinh thần học hỏi'],
            targetAudience: ['Nhân viên mới', 'Sinh viên chuẩn bị ra trường', 'Người muốn cải thiện giao tiếp'],
        },
    });
    const commModule1 = await prisma.courseModule.create({
        data: {
            title: 'Module 1: Cơ bản giao tiếp',
            description: 'Nền tảng giao tiếp hiệu quả',
            order: 0,
            courseId: communicationCourse.id,
        },
    });
    await prisma.lesson.create({
        data: {
            title: 'Nguyên tắc giao tiếp hiệu quả',
            type: client_1.LessonType.VIDEO,
            content: 'https://www.youtube.com/watch?v=HAnw168huqA',
            duration: 20,
            order: 0,
            isFree: true,
            moduleId: commModule1.id,
        },
    });
    await prisma.lesson.create({
        data: {
            title: 'Kỹ thuật lắng nghe tích cực',
            type: client_1.LessonType.TEXT,
            content: `# Lắng nghe tích cực

## 5 bước lắng nghe hiệu quả:
1. **Tập trung hoàn toàn** - Loại bỏ phiền nhiễu
2. **Đặt câu hỏi** - Làm rõ thông tin
3. **Paraphrase** - Diễn đạt lại để xác nhận
4. **Đồng cảm** - Hiểu cảm xúc của người nói
5. **Phản hồi** - Đưa ra ý kiến xây dựng`,
            duration: 15,
            order: 1,
            moduleId: commModule1.id,
        },
    });
    const commQuizLesson = await prisma.lesson.create({
        data: {
            title: 'Quiz: Kiểm tra giao tiếp',
            type: client_1.LessonType.QUIZ,
            duration: 10,
            order: 2,
            moduleId: commModule1.id,
        },
    });
    const commQuiz = await prisma.quiz.create({
        data: {
            title: 'Quiz: Giao tiếp cơ bản',
            lessonId: commQuizLesson.id,
            passingScore: 70,
            timeLimit: 10,
        },
    });
    await prisma.question.create({
        data: {
            quizId: commQuiz.id,
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            question: 'Yếu tố quan trọng nhất trong giao tiếp là gì?',
            points: 10,
            order: 0,
            explanation: 'Lắng nghe là nền tảng của giao tiếp hiệu quả.',
            answers: {
                create: [
                    { text: 'Lắng nghe', isCorrect: true, order: 0 },
                    { text: 'Nói nhiều', isCorrect: false, order: 1 },
                    { text: 'Tranh luận', isCorrect: false, order: 2 },
                    { text: 'Im lặng', isCorrect: false, order: 3 },
                ],
            },
        },
    });
    console.log('✅ Course 1 created\n');
    console.log('🎯 Creating COURSE 2: Quản lý thời gian hiệu quả...');
    const timeManagementCourse = await prisma.course.create({
        data: {
            title: 'Quản lý thời gian và năng suất làm việc',
            slug: 'quan-ly-thoi-gian-nang-suat',
            description: 'Học cách sắp xếp thời gian khoa học, tăng năng suất và đạt được work-life balance.',
            thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
            price: 399000,
            level: client_1.CourseLevel.BEGINNER,
            status: client_1.CourseStatus.PUBLISHED,
            duration: 360,
            instructorId: instructor.id,
            categoryId: basicSkillsCat.id,
            whatYouWillLearn: ['Ma trận Eisenhower', 'Kỹ thuật Pomodoro', 'GTD (Getting Things Done)', 'Quản lý email hiệu quả', 'Work-life balance'],
            requirements: ['Không yêu cầu kinh nghiệm'],
            targetAudience: ['Người làm việc bận rộn', 'Sinh viên', 'Freelancer'],
        },
    });
    const timeModule1 = await prisma.courseModule.create({
        data: {
            title: 'Module 1: Nền tảng quản lý thời gian',
            description: 'Nguyên tắc cơ bản quản lý thời gian',
            order: 0,
            courseId: timeManagementCourse.id,
        },
    });
    await prisma.lesson.create({
        data: {
            title: 'Ma trận Eisenhower',
            type: client_1.LessonType.VIDEO,
            content: 'https://www.youtube.com/watch?v=tT89OZ7TNwc',
            duration: 18,
            order: 0,
            isFree: true,
            moduleId: timeModule1.id,
        },
    });
    await prisma.lesson.create({
        data: {
            title: 'Kỹ thuật Pomodoro',
            type: client_1.LessonType.TEXT,
            content: `# Kỹ thuật Pomodoro

## Quy trình 5 bước:
1. **Chọn task** - Xác định công việc cần làm
2. **25 phút tập trung** - Làm việc không bị phân tâm
3. **Nghỉ 5 phút** - Thư giãn ngắn
4. **Lặp lại** - Chu kỳ 25-5 phút
5. **Nghỉ dài 15-30 phút** - Sau 4 pomodoro

## Lợi ích:
- Tăng tập trung
- Giảm mệt mỏi
- Theo dõi tiến độ`,
            duration: 20,
            order: 1,
            moduleId: timeModule1.id,
        },
    });
    const timeQuizLesson = await prisma.lesson.create({
        data: {
            title: 'Quiz: Quản lý thời gian',
            type: client_1.LessonType.QUIZ,
            duration: 8,
            order: 2,
            moduleId: timeModule1.id,
        },
    });
    const timeQuiz = await prisma.quiz.create({
        data: {
            title: 'Quiz: Time Management',
            lessonId: timeQuizLesson.id,
            passingScore: 70,
            timeLimit: 8,
        },
    });
    await prisma.question.create({
        data: {
            quizId: timeQuiz.id,
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            question: 'Một chu kỳ Pomodoro kéo dài bao lâu?',
            points: 10,
            order: 0,
            explanation: 'Pomodoro tiêu chuẩn là 25 phút làm việc + 5 phút nghỉ.',
            answers: {
                create: [
                    { text: '25 phút', isCorrect: true, order: 0 },
                    { text: '30 phút', isCorrect: false, order: 1 },
                    { text: '45 phút', isCorrect: false, order: 2 },
                    { text: '60 phút', isCorrect: false, order: 3 },
                ],
            },
        },
    });
    console.log('✅ Course 2 created\n');
    console.log('🎯 Creating COURSE 3: Kỹ năng lãnh đạo...');
    const leadershipCourse = await prisma.course.create({
        data: {
            title: 'Kỹ năng lãnh đạo và quản lý nhóm',
            slug: 'ky-nang-lanh-dao-quan-ly-nhom',
            description: 'Phát triển khả năng lãnh đạo, quản lý đội nhóm hiệu quả và tạo động lực cho nhân viên.',
            thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
            price: 899000,
            level: client_1.CourseLevel.ADVANCED,
            status: client_1.CourseStatus.PUBLISHED,
            duration: 480,
            instructorId: instructor.id,
            categoryId: advancedSkillsCat.id,
            whatYouWillLearn: ['Phong cách lãnh đạo', 'Quản lý hiệu suất', 'Tạo động lực nhân viên', 'Xây dựng văn hóa làm việc', 'Kỹ năng coaching'],
            requirements: ['Kinh nghiệm làm việc 2+ năm', 'Đã hoặc sắp làm quản lý'],
            targetAudience: ['Team Leader', 'Quản lý cấp trung', 'Founder/CEO'],
        },
    });
    const leaderModule1 = await prisma.courseModule.create({
        data: {
            title: 'Module 1: Nền tảng lãnh đạo',
            description: 'Hiểu về lãnh đạo và quản lý',
            order: 0,
            courseId: leadershipCourse.id,
        },
    });
    await prisma.lesson.create({
        data: {
            title: 'Leader vs Manager',
            type: client_1.LessonType.VIDEO,
            content: 'https://www.youtube.com/watch?v=yq43v6Mx8_M',
            duration: 25,
            order: 0,
            isFree: true,
            moduleId: leaderModule1.id,
        },
    });
    await prisma.lesson.create({
        data: {
            title: '5 phong cách lãnh đạo',
            type: client_1.LessonType.TEXT,
            content: `# 5 Phong cách lãnh đạo hiệu quả

## 1. Authoritative (Uy quyền)
- Đưa ra tầm nhìn rõ ràng
- Phù hợp khi cần thay đổi

## 2. Democratic (Dân chủ)
- Khuyến khích tham gia
- Tốt cho team có kinh nghiệm

## 3. Coaching (Huấn luyện)
- Phát triển nhân viên
- Đầu tư dài hạn

## 4. Affiliative (Thân thiện)
- Xây dựng mối quan hệ
- Hàn gắn team

## 5. Pacesetting (Định hướng)
- Đặt tiêu chuẩn cao
- Phù hợp team tự giác`,
            duration: 30,
            order: 1,
            moduleId: leaderModule1.id,
        },
    });
    const leaderQuizLesson = await prisma.lesson.create({
        data: {
            title: 'Quiz: Leadership',
            type: client_1.LessonType.QUIZ,
            duration: 12,
            order: 2,
            moduleId: leaderModule1.id,
        },
    });
    const leaderQuiz = await prisma.quiz.create({
        data: {
            title: 'Quiz: Kỹ năng lãnh đạo',
            lessonId: leaderQuizLesson.id,
            passingScore: 80,
            timeLimit: 12,
        },
    });
    await prisma.question.create({
        data: {
            quizId: leaderQuiz.id,
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            question: 'Khác biệt chính giữa Leader và Manager là gì?',
            points: 10,
            order: 0,
            explanation: 'Leader tập trung vào người và tầm nhìn, Manager tập trung vào quy trình và kết quả.',
            answers: {
                create: [
                    { text: 'Leader dẫn dắt người, Manager quản lý việc', isCorrect: true, order: 0 },
                    { text: 'Leader có quyền lực hơn', isCorrect: false, order: 1 },
                    { text: 'Không có khác biệt', isCorrect: false, order: 2 },
                    { text: 'Manager quan trọng hơn', isCorrect: false, order: 3 },
                ],
            },
        },
    });
    console.log('✅ Course 3 created\n');
    console.log('🎯 Creating COURSE 4: Tư duy chiến lược...');
    const strategicCourse = await prisma.course.create({
        data: {
            title: 'Tư duy chiến lược và lập kế hoạch kinh doanh',
            slug: 'tu-duy-chien-luoc-ke-hoach-kinh-doanh',
            description: 'Phát triển tư duy chiến lược, phân tích thị trường và xây dựng kế hoạch kinh doanh bền vững.',
            thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
            price: 1299000,
            level: client_1.CourseLevel.ADVANCED,
            status: client_1.CourseStatus.PUBLISHED,
            duration: 600,
            instructorId: instructor.id,
            categoryId: advancedSkillsCat.id,
            whatYouWillLearn: ['SWOT Analysis', 'Porter Five Forces', 'Blue Ocean Strategy', 'Business Model Canvas', 'Strategic Planning'],
            requirements: ['Kinh nghiệm quản lý 3+ năm', 'Hiểu biết về kinh doanh'],
            targetAudience: ['C-level executives', 'Giám đốc', 'Chủ doanh nghiệp'],
        },
    });
    const strategyModule1 = await prisma.courseModule.create({
        data: {
            title: 'Module 1: Tư duy chiến lược',
            description: 'Cơ sở của strategic thinking',
            order: 0,
            courseId: strategicCourse.id,
        },
    });
    await prisma.lesson.create({
        data: {
            title: 'Strategic Thinking Overview',
            type: client_1.LessonType.VIDEO,
            content: 'https://www.youtube.com/watch?v=iuYlGRnC7J8',
            duration: 30,
            order: 0,
            isFree: true,
            moduleId: strategyModule1.id,
        },
    });
    await prisma.lesson.create({
        data: {
            title: 'SWOT Analysis Framework',
            type: client_1.LessonType.TEXT,
            content: `# SWOT Analysis

## Ma trận SWOT:

### Strengths (S) - Điểm mạnh
- Tài nguyên nội bộ
- Năng lực cốt lõi
- Lợi thế c경쟁

### Weaknesses (W) - Điểm yếu  
- Hạn chế nội bộ
- Thiếu sót cần khắc phục
- Rủi ro tiềm ẩn

### Opportunities (O) - Cơ hội
- Xu hướng thị trường
- Công nghệ mới
- Thay đổi quy định

### Threats (T) - Thách thức
- Đối thủ cạnh tranh
- Khủng hoảng kinh tế
- Rủi ro pháp lý

## Strategies matrix:
- SO: Grow (Phát triển)
- WO: Build (Xây dựng)  
- ST: Defend (Bảo vệ)
- WT: Survive (Tồn tại)`,
            duration: 35,
            order: 1,
            moduleId: strategyModule1.id,
        },
    });
    const strategyQuizLesson = await prisma.lesson.create({
        data: {
            title: 'Quiz: Strategic Thinking',
            type: client_1.LessonType.QUIZ,
            duration: 15,
            order: 2,
            moduleId: strategyModule1.id,
        },
    });
    const strategyQuiz = await prisma.quiz.create({
        data: {
            title: 'Quiz: Tư duy chiến lược',
            lessonId: strategyQuizLesson.id,
            passingScore: 80,
            timeLimit: 15,
        },
    });
    await prisma.question.create({
        data: {
            quizId: strategyQuiz.id,
            type: client_1.QuestionType.MULTIPLE_CHOICE,
            question: 'SWOT Analysis bao gồm những yếu tố nào?',
            points: 10,
            order: 0,
            explanation: 'SWOT = Strengths, Weaknesses, Opportunities, Threats.',
            answers: {
                create: [
                    { text: 'Điểm mạnh, Điểm yếu, Cơ hội, Thách thức', isCorrect: true, order: 0 },
                    { text: 'Sản phẩm, Giá cả, Phân phối, Khuyến mãi', isCorrect: false, order: 1 },
                    { text: 'Người, Tiền, Thời gian, Chất lượng', isCorrect: false, order: 2 },
                    { text: 'Kế hoạch, Thực hiện, Kiểm tra, Hành động', isCorrect: false, order: 3 },
                ],
            },
        },
    });
    console.log('✅ Course 4 created\n');
    console.log('📝 Creating enrollments...');
    const allCourses = [communicationCourse, timeManagementCourse, leadershipCourse, strategicCourse];
    for (const course of allCourses) {
        await prisma.enrollment.create({
            data: {
                userId: student.id,
                courseId: course.id,
                progress: Math.floor(Math.random() * 100),
            },
        });
        await prisma.course.update({
            where: { id: course.id },
            data: { enrollmentCount: 1 },
        });
    }
    console.log(`✅ Created ${allCourses.length} enrollments\n`);
    console.log('🎉 LMS SOFT SKILLS SEEDING COMPLETED!\n');
    console.log('📊 Summary:');
    console.log('   ✅ Users: 2 (instructor + student)');
    console.log('   ✅ Categories: 2 (Basic + Advanced Soft Skills)');
    console.log('   ✅ Courses: 4 (2 Basic + 2 Advanced)');
    console.log('   ✅ Modules: 4');
    console.log('   ✅ Lessons: 12 (4 Video + 4 Text + 4 Quiz)');
    console.log('   ✅ Quizzes: 4');
    console.log('   ✅ Questions: 4');
    console.log('   ✅ Enrollments: 4\n');
    console.log('👤 Login Credentials:');
    console.log('   Instructor: instructor@lms.com / password123');
    console.log('   Student: student@lms.com / password123\n');
    console.log('📚 4 Soft Skills Courses:');
    console.log('   BASIC LEVEL:');
    console.log('     1. Kỹ năng giao tiếp hiệu quả - 299k VND');
    console.log('     2. Quản lý thời gian và năng suất - 399k VND');
    console.log('   ADVANCED LEVEL:');
    console.log('     3. Kỹ năng lãnh đạo và quản lý nhóm - 899k VND');
    console.log('     4. Tư duy chiến lược và kinh doanh - 1299k VND\n');
    console.log('🚀 Ready to use!');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=lms-4-soft-skills-courses.js.map