import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * QUIZ SEEDING SCRIPT - CHO TẤT CẢ KHÓA HỌC HIỆN TẠI
 * Tạo quiz cho tất cả lessons trong các courses đã có
 * - Mỗi lesson có 1 quiz
 * - Mỗi quiz có 5-8 câu hỏi đa dạng
 * - Câu hỏi: Multiple Choice, True/False
 * - Mỗi câu hỏi có 3-4 đáp án
 */

// Template câu hỏi theo chủ đề
const quizTemplates = {
  // KHÓA HỌC NỐI MI
  'noi-mi': {
    general: [
      {
        question: 'Thời gian giữ mi kéo dài bao lâu với kỹ thuật nối mi Classic?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: '2-3 tuần', isCorrect: true },
          { text: '1-2 tuần', isCorrect: false },
          { text: '4-6 tuần', isCorrect: false },
          { text: '1 tháng', isCorrect: false }
        ],
        explanation: 'Mi nối Classic thường giữ được 2-3 tuần tùy thuộc vào chu kỳ mọc mi tự nhiên của từng người.'
      },
      {
        question: 'Keo nối mi nên được bảo quản ở nhiệt độ bao nhiêu độ C?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: '18-22°C', isCorrect: true },
          { text: '10-15°C', isCorrect: false },
          { text: '25-30°C', isCorrect: false },
          { text: 'Nhiệt độ phòng bất kỳ', isCorrect: false }
        ],
        explanation: 'Keo nối mi nên được bảo quản ở nhiệt độ 18-22°C, độ ẩm 40-60% để đảm bảo chất lượng.'
      },
      {
        question: 'Độ cong J-curl phù hợp với loại mi nào?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Mi thẳng hoặc mi ngắn', isCorrect: true },
          { text: 'Mi cong tự nhiên', isCorrect: false },
          { text: 'Mi dài và cong', isCorrect: false },
          { text: 'Mọi loại mi', isCorrect: false }
        ],
        explanation: 'J-curl có độ cong nhẹ nhất, phù hợp với mi thẳng hoặc mi ngắn muốn có vẻ tự nhiên.'
      },
      {
        question: 'Kỹ thuật nối mi Volume là gì?',
        type: QuestionType.TRUE_FALSE,
        answers: [
          { text: 'Nối nhiều sợi mi giả vào một sợi mi thật', isCorrect: true },
          { text: 'Nối một sợi mi giả vào một sợi mi thật', isCorrect: false }
        ],
        explanation: 'Volume lashing là kỹ thuật nối nhiều sợi mi giả (2D-6D) vào một sợi mi thật tạo độ dày.'
      },
      {
        question: 'Nhíp nối mi nên được làm sạch bao nhiêu lần?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Sau mỗi khách hàng', isCorrect: true },
          { text: 'Mỗi ngày một lần', isCorrect: false },
          { text: 'Mỗi tuần một lần', isCorrect: false },
          { text: 'Khi nhìn thấy bẩn', isCorrect: false }
        ],
        explanation: 'Vệ sinh nhíp sau mỗi khách hàng để đảm bảo an toàn và phòng tránh lây nhiễm.'
      },
      {
        question: 'Tỷ lệ nối mi Classic chuẩn là bao nhiêu?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: '1:1 (1 mi giả : 1 mi thật)', isCorrect: true },
          { text: '2:1 (2 mi giả : 1 mi thật)', isCorrect: false },
          { text: '3:1 (3 mi giả : 1 mi thật)', isCorrect: false },
          { text: 'Không có tỷ lệ cố định', isCorrect: false }
        ],
        explanation: 'Classic lash là kỹ thuật nối 1 sợi mi giả vào 1 sợi mi thật (tỷ lệ 1:1).'
      },
      {
        question: 'Mi Volume 3D có nghĩa là gì?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: '3 sợi mi giả nối vào 1 sợi mi thật', isCorrect: true },
          { text: '3 lớp mi chồng lên nhau', isCorrect: false },
          { text: '3 màu mi khác nhau', isCorrect: false },
          { text: '3 độ dài mi khác nhau', isCorrect: false }
        ],
        explanation: 'Volume 3D nghĩa là tạo chùm 3 sợi mi giả và nối vào 1 sợi mi thật.'
      },
      {
        question: 'Độ dài mi nối phổ biến nhất là bao nhiêu mm?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: '9-12mm', isCorrect: true },
          { text: '5-7mm', isCorrect: false },
          { text: '15-18mm', isCorrect: false },
          { text: '20-25mm', isCorrect: false }
        ],
        explanation: 'Độ dài mi nối phổ biến là 9-12mm, phù hợp với mi tự nhiên của người Á.'
      }
    ]
  },

  // KHÓA HỌC CHĂM SÓC DA
  'cham-soc-da': {
    general: [
      {
        question: 'Da có mấy lớp chính?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: '3 lớp: Biểu bì, Hạ bì, Mô mỡ dưới da', isCorrect: true },
          { text: '2 lớp: Biểu bì, Hạ bì', isCorrect: false },
          { text: '4 lớp: Biểu bì, Chân bì, Hạ bì, Mô mỡ', isCorrect: false },
          { text: '5 lớp', isCorrect: false }
        ],
        explanation: 'Da gồm 3 lớp chính: Biểu bì (Epidermis), Hạ bì (Dermis), và Mô mỡ dưới da (Hypodermis).'
      },
      {
        question: 'Kem chống nắng nên được thoa lại sau bao lâu?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Mỗi 2-3 giờ', isCorrect: true },
          { text: 'Mỗi 5-6 giờ', isCorrect: false },
          { text: '1 lần/ngày là đủ', isCorrect: false },
          { text: 'Chỉ cần thoa 1 lần buổi sáng', isCorrect: false }
        ],
        explanation: 'Kem chống nắng nên được thoa lại mỗi 2-3 giờ để duy trì hiệu quả bảo vệ da.'
      },
      {
        question: 'SPF là gì?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Chỉ số chống tia UV (Sun Protection Factor)', isCorrect: true },
          { text: 'Độ ẩm của kem', isCorrect: false },
          { text: 'Thành phần dưỡng ẩm', isCorrect: false },
          { text: 'Hàm lượng vitamin', isCorrect: false }
        ],
        explanation: 'SPF (Sun Protection Factor) là chỉ số đo lường khả năng bảo vệ da khỏi tia UV-B.'
      },
      {
        question: 'Da khô cần được cung cấp nhiều thành phần nào?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Hyaluronic Acid và Glycerin', isCorrect: true },
          { text: 'Salicylic Acid', isCorrect: false },
          { text: 'Benzoyl Peroxide', isCorrect: false },
          { text: 'Alcohol', isCorrect: false }
        ],
        explanation: 'Da khô cần các thành phần dưỡng ẩm như Hyaluronic Acid, Glycerin, Ceramide.'
      },
      {
        question: 'Nên rửa mặt mấy lần mỗi ngày?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: '2 lần (sáng và tối)', isCorrect: true },
          { text: '3 lần', isCorrect: false },
          { text: '1 lần (buổi tối)', isCorrect: false },
          { text: '4-5 lần', isCorrect: false }
        ],
        explanation: 'Nên rửa mặt 2 lần/ngày: buổi sáng để loại bỏ dầu tiết ra ban đêm, buổi tối để làm sạch bụi bẩn.'
      },
      {
        question: 'Mụn ẩn (comedone) gồm những loại nào?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Mụn đầu đen và mụn đầu trắng', isCorrect: true },
          { text: 'Mụn sưng và mụn bọc', isCorrect: false },
          { text: 'Mụn viêm và mụn mủ', isCorrect: false },
          { text: 'Mụn cám và mụn bọc', isCorrect: false }
        ],
        explanation: 'Mụn ẩn (comedone) gồm mụn đầu đen (blackhead) và mụn đầu trắng (whitehead).'
      },
      {
        question: 'Thành phần chống lão hóa phổ biến nhất là gì?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Retinol (Vitamin A)', isCorrect: true },
          { text: 'Vitamin C', isCorrect: false },
          { text: 'Vitamin E', isCorrect: false },
          { text: 'Niacinamide', isCorrect: false }
        ],
        explanation: 'Retinol là dẫn xuất Vitamin A, được coi là thành phần vàng trong chống lão hóa da.'
      },
      {
        question: 'Da dầu nên sử dụng loại toner nào?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Toner kiểm soát dầu, chứa Salicylic Acid', isCorrect: true },
          { text: 'Toner dưỡng ẩm dạng kem', isCorrect: false },
          { text: 'Toner chứa nhiều dầu', isCorrect: false },
          { text: 'Không cần dùng toner', isCorrect: false }
        ],
        explanation: 'Da dầu cần toner kiểm soát dầu, có chứa BHA như Salicylic Acid để làm sạch lỗ chân lông.'
      }
    ]
  },

  // KHÓA HỌC PHUN XĂM
  'phun-xam': {
    general: [
      {
        question: 'Phun xăm thẩm mỹ khác gì với xăm hình truyền thống?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Phun xăm chỉ nằm ở lớp biểu bì, xăm hình nằm sâu hơn', isCorrect: true },
          { text: 'Không có sự khác biệt', isCorrect: false },
          { text: 'Phun xăm dùng máy khác hoàn toàn', isCorrect: false },
          { text: 'Phun xăm không dùng mực', isCorrect: false }
        ],
        explanation: 'Phun xăm thẩm mỹ chỉ đưa mực vào lớp biểu bì nên sẽ phai màu theo thời gian, còn xăm hình nằm sâu ở lớp hạ bì nên vĩnh viễn.'
      },
      {
        question: 'Sau phun xăm, khách hàng nên kiêng gì trong 7 ngày đầu?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Đồ ăn tanh, rượu bia, tắm hơi, bơi lội', isCorrect: true },
          { text: 'Chỉ cần kiêng rượu bia', isCorrect: false },
          { text: 'Không cần kiêng gì', isCorrect: false },
          { text: 'Chỉ kiêng tắm hơi', isCorrect: false }
        ],
        explanation: 'Sau phun xăm cần kiêng đồ tanh, rượu bia (gây sưng), tắm hơi, bơi lội (nguy cơ nhiễm trùng).'
      },
      {
        question: 'Kim phun xăm có thể dùng lại cho nhiều khách hàng không?',
        type: QuestionType.TRUE_FALSE,
        answers: [
          { text: 'Không, kim phải dùng 1 lần rồi vứt', isCorrect: true },
          { text: 'Có, nếu được vệ sinh kỹ', isCorrect: false }
        ],
        explanation: 'Kim phun xăm bắt buộc phải dùng 1 lần (disposable needle) để đảm bảo an toàn vệ sinh.'
      },
      {
        question: 'Tỷ lệ vàng trong thiết kế chân mày là bao nhiêu?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: '1:1.618 (Fibonacci)', isCorrect: true },
          { text: '1:2', isCorrect: false },
          { text: '1:1', isCorrect: false },
          { text: '2:3', isCorrect: false }
        ],
        explanation: 'Tỷ lệ vàng 1:1.618 (dãy Fibonacci) được dùng để thiết kế chân mày hài hòa với khuôn mặt.'
      },
      {
        question: 'Màu mực phun xăm sẽ thay đổi như thế nào theo thời gian?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Phai dần và đổi tone màu nhạt hơn', isCorrect: true },
          { text: 'Không thay đổi', isCorrect: false },
          { text: 'Tối màu hơn', isCorrect: false },
          { text: 'Biến mất hoàn toàn sau 1 tháng', isCorrect: false }
        ],
        explanation: 'Mực phun xăm sẽ phai dần từ 30-50% sau 1-2 năm và đổi tone nhạt hơn do cơ thể hấp thụ.'
      },
      {
        question: 'Kỹ thuật phun xăm chân mày dáng lông (nano brow) khác gì phủ bóng?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Dáng lông tạo từng nét sợi, phủ bóng tạo nền', isCorrect: true },
          { text: 'Không có sự khác biệt', isCorrect: false },
          { text: 'Dáng lông dùng kim nhỏ hơn', isCorrect: false },
          { text: 'Phủ bóng đau hơn', isCorrect: false }
        ],
        explanation: 'Dáng lông vẽ từng sợi lông giống tự nhiên, phủ bóng tạo nền màu đều đặn như makeup.'
      },
      {
        question: 'Phun môi baby lips có đặc điểm gì?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: 'Màu hồng nhạt tự nhiên, không viền rõ', isCorrect: true },
          { text: 'Màu đỏ thẫm, viền rõ nét', isCorrect: false },
          { text: 'Môi màu cam', isCorrect: false },
          { text: 'Môi 2 tone màu', isCorrect: false }
        ],
        explanation: 'Baby lips là phong cách môi hồng nhạt, tự nhiên, không viền rõ như môi em bé.'
      },
      {
        question: 'Thời gian lành vết thương sau phun xăm chân mày là bao lâu?',
        type: QuestionType.MULTIPLE_CHOICE,
        answers: [
          { text: '7-10 ngày', isCorrect: true },
          { text: '2-3 ngày', isCorrect: false },
          { text: '1 tháng', isCorrect: false },
          { text: '3 tuần', isCorrect: false }
        ],
        explanation: 'Vết thương phun xăm chân mày thường lành hoàn toàn sau 7-10 ngày.'
      }
    ]
  }
};

// Hàm tạo quiz cho lesson
async function createQuizForLesson(
  lessonId: string,
  lessonTitle: string,
  courseSlug: string,
  moduleTitle: string
) {
  try {
    // Xác định chủ đề để lấy câu hỏi phù hợp
    let questions: any[] = [];
    
    if (courseSlug.includes('noi-mi')) {
      questions = [...quizTemplates['noi-mi'].general];
    } else if (courseSlug.includes('cham-soc-da')) {
      questions = [...quizTemplates['cham-soc-da'].general];
    } else if (courseSlug.includes('phun-xam')) {
      questions = [...quizTemplates['phun-xam'].general];
    } else {
      // Default generic questions cho các khóa khác
      questions = [
        {
          question: `Bạn đã hiểu nội dung bài "${lessonTitle}" chưa?`,
          type: QuestionType.TRUE_FALSE,
          answers: [
            { text: 'Đã hiểu', isCorrect: true },
            { text: 'Chưa hiểu', isCorrect: false }
          ],
          explanation: 'Hãy xem lại video nếu còn thắc mắc.'
        },
        {
          question: `Kiến thức trong bài "${lessonTitle}" có quan trọng không?`,
          type: QuestionType.MULTIPLE_CHOICE,
          answers: [
            { text: 'Rất quan trọng, cần nắm vững', isCorrect: true },
            { text: 'Không quan trọng lắm', isCorrect: false },
            { text: 'Chỉ cần biết sơ qua', isCorrect: false }
          ],
          explanation: 'Mỗi bài học đều có giá trị riêng trong lộ trình học tập.'
        },
        {
          question: 'Sau khi học xong bài này, bạn nên làm gì tiếp theo?',
          type: QuestionType.MULTIPLE_CHOICE,
          answers: [
            { text: 'Thực hành và ghi chú lại kiến thức quan trọng', isCorrect: true },
            { text: 'Chuyển sang bài tiếp theo ngay', isCorrect: false },
            { text: 'Không cần làm gì', isCorrect: false }
          ],
          explanation: 'Thực hành và ghi chú giúp củng cố kiến thức hiệu quả hơn.'
        }
      ];
    }

    // Shuffle và lấy 5-7 câu hỏi ngẫu nhiên
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(7, questions.length));

    // Tạo quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: `Quiz: ${lessonTitle}`,
        description: `Kiểm tra kiến thức sau khi học xong bài "${lessonTitle}". Điểm đạt: 70%, Thời gian: 15 phút.`,
        lessonId: lessonId,
        passingScore: 70,
        timeLimit: 15, // 15 phút
        maxAttempts: 3,
        isRequired: true,
        questions: {
          create: selectedQuestions.map((q, index) => ({
            type: q.type,
            question: q.question,
            points: q.type === QuestionType.TRUE_FALSE ? 10 : 15,
            order: index + 1,
            explanation: q.explanation,
            answers: {
              create: q.answers.map((a: any, aIndex: number) => ({
                text: a.text,
                isCorrect: a.isCorrect,
                order: aIndex + 1
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            answers: true
          }
        }
      }
    });

    console.log(`     ✅ Created quiz: ${quiz.questions.length} questions`);
    return quiz;
  } catch (error) {
    console.error(`     ❌ Error creating quiz:`, error);
    throw error;
  }
}

// Main seeding function
async function seedAllQuizzes() {
  console.log('🚀 Starting quiz seeding for all courses...\n');

  try {
    // Lấy tất cả courses đã publish với lessons
    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                quizzes: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${courses.length} published courses\n`);

    let totalQuizzesCreated = 0;
    let totalLessonsProcessed = 0;
    let totalLessonsSkipped = 0;

    for (const course of courses) {
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      
      if (totalLessons === 0) {
        console.log(`⏭️  Skipping: ${course.title} (no lessons)`);
        continue;
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`📚 Course: ${course.title}`);
      console.log(`   Slug: ${course.slug}`);
      console.log(`   Modules: ${course.modules.length} | Lessons: ${totalLessons}`);
      console.log(`${'='.repeat(60)}`);

      for (const module of course.modules) {
        if (module.lessons.length === 0) continue;

        console.log(`\n  📖 Module: ${module.title} (${module.lessons.length} lessons)`);
        
        const lessonsWithoutQuiz = module.lessons.filter(l => l.quizzes.length === 0);
        const lessonsWithQuiz = module.lessons.filter(l => l.quizzes.length > 0);
        
        if (lessonsWithQuiz.length > 0) {
          console.log(`     ℹ️  ${lessonsWithQuiz.length} lessons already have quizzes`);
          totalLessonsSkipped += lessonsWithQuiz.length;
        }

        if (lessonsWithoutQuiz.length === 0) {
          console.log(`     ✅ All lessons in this module have quizzes`);
          continue;
        }

        console.log(`     🎯 Creating quizzes for ${lessonsWithoutQuiz.length} lessons...`);

        for (const lesson of lessonsWithoutQuiz) {
          console.log(`     📝 Lesson: ${lesson.title}`);
          
          await createQuizForLesson(
            lesson.id,
            lesson.title,
            course.slug,
            module.title
          );
          
          totalQuizzesCreated++;
          totalLessonsProcessed++;
        }
      }
    }

    console.log('\n\n' + '='.repeat(70));
    console.log('🎉 QUIZ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log(`📊 Summary:`);
    console.log(`   - Published courses: ${courses.length}`);
    console.log(`   - Lessons processed: ${totalLessonsProcessed} (new quizzes)`);
    console.log(`   - Lessons skipped: ${totalLessonsSkipped} (already have quizzes)`);
    console.log(`   - Total quizzes created: ${totalQuizzesCreated}`);
    console.log(`   - Average questions per quiz: 5-7`);
    console.log(`   - Time limit per quiz: 15 minutes`);
    console.log(`   - Passing score: 70%`);
    console.log(`   - Max attempts: 3`);
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding
seedAllQuizzes()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
