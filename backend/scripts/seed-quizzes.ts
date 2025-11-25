import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedQuizzes() {
  console.log('🎯 Seeding Quiz data...');

  try {
    // Get React course lessons
    const reactLesson3 = await prisma.lesson.findFirst({
      where: { id: 'react-lesson-3' },
    });

    const reactLesson6 = await prisma.lesson.findFirst({
      where: { id: 'react-lesson-6' },
    });

    if (!reactLesson3 || !reactLesson6) {
      console.log('❌ React lessons not found. Run seed-lms-videos.ts first.');
      return;
    }

    // Create Quiz 1: JSX Basics
    const quiz1 = await prisma.quiz.upsert({
      where: { id: 'quiz-jsx-basics' },
      update: {},
      create: {
        id: 'quiz-jsx-basics',
        title: 'JSX and Components Quiz',
        description: 'Test your understanding of JSX syntax and React components',
        lessonId: reactLesson3.id,
        passingScore: 70,
        timeLimit: 10, // 10 minutes
      },
    });

    // Question 1: Multiple choice
    const q1 = await prisma.question.upsert({
      where: { id: 'q1-jsx-basics' },
      update: {},
      create: {
        id: 'q1-jsx-basics',
        quizId: quiz1.id,
        type: QuestionType.MULTIPLE_CHOICE,
        question: 'What is JSX?',
        points: 1,
        order: 1,
        explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in React.',
      },
    });

    await prisma.answer.createMany({
      data: [
        {
          questionId: q1.id,
          text: 'A JavaScript XML syntax extension',
          isCorrect: true,
          order: 1,
        },
        {
          questionId: q1.id,
          text: 'A new programming language',
          isCorrect: false,
          order: 2,
        },
        {
          questionId: q1.id,
          text: 'A CSS framework',
          isCorrect: false,
          order: 3,
        },
        {
          questionId: q1.id,
          text: 'A database query language',
          isCorrect: false,
          order: 4,
        },
      ],
      skipDuplicates: true,
    });

    // Question 2: True/False
    const q2 = await prisma.question.upsert({
      where: { id: 'q2-jsx-basics' },
      update: {},
      create: {
        id: 'q2-jsx-basics',
        quizId: quiz1.id,
        type: QuestionType.TRUE_FALSE,
        question: 'JSX elements must have a closing tag or be self-closing.',
        points: 1,
        order: 2,
        explanation: 'True. All JSX elements must be properly closed, either with a closing tag or as self-closing.',
      },
    });

    await prisma.answer.createMany({
      data: [
        {
          questionId: q2.id,
          text: 'True',
          isCorrect: true,
          order: 1,
        },
        {
          questionId: q2.id,
          text: 'False',
          isCorrect: false,
          order: 2,
        },
      ],
      skipDuplicates: true,
    });

    // Question 3: Multiple choice
    const q3 = await prisma.question.upsert({
      where: { id: 'q3-jsx-basics' },
      update: {},
      create: {
        id: 'q3-jsx-basics',
        quizId: quiz1.id,
        type: QuestionType.MULTIPLE_CHOICE,
        question: 'Which of the following is the correct way to create a React component?',
        points: 2,
        order: 3,
        explanation: 'Function components are the modern way to create React components. They can use hooks for state and lifecycle.',
      },
    });

    await prisma.answer.createMany({
      data: [
        {
          questionId: q3.id,
          text: 'function MyComponent() { return <div>Hello</div>; }',
          isCorrect: true,
          order: 1,
        },
        {
          questionId: q3.id,
          text: 'const MyComponent = () => { return <div>Hello</div>; }',
          isCorrect: true,
          order: 2,
        },
        {
          questionId: q3.id,
          text: 'component MyComponent() { return <div>Hello</div>; }',
          isCorrect: false,
          order: 3,
        },
        {
          questionId: q3.id,
          text: 'React.component(() => <div>Hello</div>)',
          isCorrect: false,
          order: 4,
        },
      ],
      skipDuplicates: true,
    });

    // Question 4: True/False
    const q4 = await prisma.question.upsert({
      where: { id: 'q4-jsx-basics' },
      update: {},
      create: {
        id: 'q4-jsx-basics',
        quizId: quiz1.id,
        type: QuestionType.TRUE_FALSE,
        question: 'In JSX, you use "class" to define CSS classes.',
        points: 1,
        order: 4,
        explanation: 'False. In JSX, you must use "className" instead of "class" because "class" is a reserved keyword in JavaScript.',
      },
    });

    await prisma.answer.createMany({
      data: [
        {
          questionId: q4.id,
          text: 'True',
          isCorrect: false,
          order: 1,
        },
        {
          questionId: q4.id,
          text: 'False',
          isCorrect: true,
          order: 2,
        },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Quiz 1 created: JSX and Components');

    // Create Quiz 2: Custom Hooks
    const quiz2 = await prisma.quiz.upsert({
      where: { id: 'quiz-custom-hooks' },
      update: {},
      create: {
        id: 'quiz-custom-hooks',
        title: 'Custom Hooks Mastery',
        description: 'Test your knowledge of creating and using custom React hooks',
        lessonId: reactLesson6.id,
        passingScore: 80,
        timeLimit: 15,
      },
    });

    // Question 1
    const q5 = await prisma.question.upsert({
      where: { id: 'q5-hooks' },
      update: {},
      create: {
        id: 'q5-hooks',
        quizId: quiz2.id,
        type: QuestionType.MULTIPLE_CHOICE,
        question: 'What is a custom hook in React?',
        points: 1,
        order: 1,
        explanation: 'Custom hooks are JavaScript functions that start with "use" and can call other hooks.',
      },
    });

    await prisma.answer.createMany({
      data: [
        {
          questionId: q5.id,
          text: 'A reusable function that can use React hooks',
          isCorrect: true,
          order: 1,
        },
        {
          questionId: q5.id,
          text: 'A built-in React API',
          isCorrect: false,
          order: 2,
        },
        {
          questionId: q5.id,
          text: 'A way to style components',
          isCorrect: false,
          order: 3,
        },
        {
          questionId: q5.id,
          text: 'A type of React component',
          isCorrect: false,
          order: 4,
        },
      ],
      skipDuplicates: true,
    });

    // Question 2
    const q6 = await prisma.question.upsert({
      where: { id: 'q6-hooks' },
      update: {},
      create: {
        id: 'q6-hooks',
        quizId: quiz2.id,
        type: QuestionType.TRUE_FALSE,
        question: 'Custom hooks must start with the word "use".',
        points: 1,
        order: 2,
        explanation: 'True. This is a convention that allows linter rules to find bugs in hooks usage.',
      },
    });

    await prisma.answer.createMany({
      data: [
        {
          questionId: q6.id,
          text: 'True',
          isCorrect: true,
          order: 1,
        },
        {
          questionId: q6.id,
          text: 'False',
          isCorrect: false,
          order: 2,
        },
      ],
      skipDuplicates: true,
    });

    // Question 3
    const q7 = await prisma.question.upsert({
      where: { id: 'q7-hooks' },
      update: {},
      create: {
        id: 'q7-hooks',
        quizId: quiz2.id,
        type: QuestionType.MULTIPLE_CHOICE,
        question: 'Which hooks can you use inside a custom hook?',
        points: 2,
        order: 3,
        explanation: 'You can use any React hooks (useState, useEffect, etc.) and other custom hooks inside a custom hook.',
      },
    });

    await prisma.answer.createMany({
      data: [
        {
          questionId: q7.id,
          text: 'useState and useEffect',
          isCorrect: true,
          order: 1,
        },
        {
          questionId: q7.id,
          text: 'Other custom hooks',
          isCorrect: true,
          order: 2,
        },
        {
          questionId: q7.id,
          text: 'Only useState',
          isCorrect: false,
          order: 3,
        },
        {
          questionId: q7.id,
          text: 'No hooks allowed',
          isCorrect: false,
          order: 4,
        },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Quiz 2 created: Custom Hooks');

    console.log('');
    console.log('✨ Quiz seed completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('  - 2 quizzes created');
    console.log('  - 7 questions total');
    console.log('  - Mix of multiple choice and true/false');
    console.log('');
    console.log('🎓 Test the quiz system:');
    console.log('  1. Go to /learn/react-complete-guide');
    console.log('  2. Navigate to "JSX and Components" lesson');
    console.log('  3. Take the quiz!');
    console.log('  4. Navigate to "Custom Hooks" lesson');
    console.log('  5. Take the second quiz!');

  } catch (error) {
    console.error('❌ Error seeding quiz data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedQuizzes()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
