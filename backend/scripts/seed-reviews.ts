import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Seeding Review data...\n');

  // Find the React course
  const course = await prisma.course.findFirst({
    where: { slug: 'react-complete-guide' },
  });

  if (!course) {
    console.error('❌ React course not found. Please seed courses first.');
    return;
  }

  // Find some enrolled users (we'll create reviews from them)
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: course.id },
    take: 5,
    include: { user: true },
  });

  if (enrollments.length === 0) {
    console.error('❌ No enrollments found. Please seed enrollments first.');
    return;
  }

  // Sample reviews with variety of ratings and comments
  const reviewsData = [
    {
      rating: 5,
      comment: `This course exceeded my expectations! The instructor explains React concepts clearly and the hands-on projects really helped me understand how to build real-world applications. The quiz system is particularly helpful for reinforcing what I've learned. Highly recommended for anyone wanting to master React!`,
    },
    {
      rating: 5,
      comment: `Absolutely fantastic course! I went from knowing nothing about React to building my own projects. The video quality is excellent, the pace is perfect, and the interactive quizzes make learning fun. Worth every penny!`,
    },
    {
      rating: 4,
      comment: `Great course overall! The content is comprehensive and well-structured. I really appreciated the custom hooks section and the practical examples. The only reason I'm giving 4 stars instead of 5 is that I'd love to see more advanced topics like performance optimization and server-side rendering. But for beginners to intermediate learners, this is perfect!`,
    },
    {
      rating: 4,
      comment: `Very good course with solid fundamentals. The instructor has a great teaching style and the examples are practical. I especially liked the JSX section. Would have loved more real-world deployment examples, but that's a minor complaint. Definitely recommend!`,
    },
    {
      rating: 5,
      comment: `Best React course I've taken! The progression from basics to advanced topics is smooth, and the quizzes help test your understanding at each step. The instructor is knowledgeable and engaging. Already recommended this to my colleagues!`,
    },
  ];

  // Create reviews
  const createdReviews = [];
  for (let i = 0; i < Math.min(enrollments.length, reviewsData.length); i++) {
    const enrollment = enrollments[i];
    const reviewData = reviewsData[i];

    try {
      // Check if review already exists
      const existingReview = await prisma.review.findUnique({
        where: {
          courseId_userId: {
            courseId: course.id,
            userId: enrollment.userId,
          },
        },
      });

      if (existingReview) {
        console.log(
          `⏭️  Review from ${enrollment.user.username} already exists, skipping...`
        );
        continue;
      }

      const review = await prisma.review.create({
        data: {
          courseId: course.id,
          userId: enrollment.userId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          // Simulate some helpful votes
          helpfulCount: Math.floor(Math.random() * 10),
          helpfulVoters: [],
        },
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      });

      createdReviews.push(review);
      console.log(
        `✅ Review ${i + 1} created: ${review.rating} stars by ${review.user.username}`
      );
    } catch (error) {
      console.error(`❌ Failed to create review ${i + 1}:`, error);
    }
  }

  // Calculate and update course average rating
  if (createdReviews.length > 0) {
    const allReviews = await prisma.review.findMany({
      where: { courseId: course.id },
      select: { rating: true },
    });

    const totalReviews = allReviews.length;
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await prisma.course.update({
      where: { id: course.id },
      data: {
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: totalReviews,
        rating: Math.round(avgRating * 10) / 10, // Update deprecated field too
      },
    });

    console.log(`\n✨ Course rating updated: ${avgRating.toFixed(1)} stars (${totalReviews} reviews)`);
  }

  console.log('\n✨ Review seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`  - ${createdReviews.length} reviews created`);
  console.log(`  - Average rating: ${createdReviews.reduce((sum, r) => sum + r.rating, 0) / createdReviews.length || 0} stars`);
  console.log(`  - Rating distribution:`);
  console.log(`    * 5 stars: ${createdReviews.filter(r => r.rating === 5).length}`);
  console.log(`    * 4 stars: ${createdReviews.filter(r => r.rating === 4).length}`);
  console.log(`    * 3 stars: ${createdReviews.filter(r => r.rating === 3).length}`);
  console.log(`    * 2 stars: ${createdReviews.filter(r => r.rating === 2).length}`);
  console.log(`    * 1 star: ${createdReviews.filter(r => r.rating === 1).length}`);
  console.log('\n🎓 Test the review system:');
  console.log('  1. Go to /courses/react-complete-guide');
  console.log('  2. Scroll to the Reviews section');
  console.log('  3. See the reviews with star ratings and helpful votes!');
  console.log('  4. Try sorting by recent, helpful, or rating');
  console.log('  5. Filter by specific star ratings\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
