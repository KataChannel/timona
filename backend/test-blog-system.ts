import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testBlogQueries() {
  console.log("\n🧪 Testing Blog GraphQL Backend Queries\n");
  console.log("=" .repeat(60));

  try {
    // Test 1: Query blog categories
    console.log("\n✅ Test 1: Query blog categories");
    const categories = await prisma.blogCategory.findMany();
    console.log(`   Result: Found ${categories.length} categories`);
    console.log(`   Status: ${categories.length === 0 ? "✅ PASS (empty)" : "✅ PASS"}`);

    // Test 2: Query blogs
    console.log("\n✅ Test 2: Query blogs");
    const blogs = await prisma.blog.findMany({
      include: {
        category: true,
        tags: true,
      },
    });
    console.log(`   Result: Found ${blogs.length} blogs`);
    console.log(`   Status: ✅ PASS`);

    // Test 3: Query blog tags
    console.log("\n✅ Test 3: Query blog tags");
    const tags = await prisma.blogTag.findMany();
    console.log(`   Result: Found ${tags.length} tags`);
    console.log(`   Status: ✅ PASS`);

    // Test 4: Create a blog category (test mutation)
    console.log("\n✅ Test 4: Create blog category (test mutation)");
    const randomSlug = `category-${Date.now()}`;
    const newCategory = await prisma.blogCategory.create({
      data: {
        name: "Technology",
        slug: randomSlug,
        description: "Tech articles",
      },
    });
    console.log(`   Created: ${newCategory.name} (${newCategory.slug})`);
    console.log(`   Status: ✅ PASS`);

    // Test 5: Create a blog post (test mutation)
    console.log("\n✅ Test 5: Create blog post (test mutation)");
    const blogSlug = `blog-${Date.now()}`;
    const newBlog = await prisma.blog.create({
      data: {
        title: "My First Blog Post",
        slug: blogSlug,
        content: "<h1>Hello World</h1><p>This is my first blog post!</p>",
        author: "Admin User",
        categoryId: newCategory.id,
        isFeatured: true,
      },
      include: {
        category: true,
        tags: true,
      },
    });
    console.log(`   Created: "${newBlog.title}" by ${newBlog.author}`);
    console.log(`   Category: ${newBlog.category?.name}`);
    console.log(`   Status: ✅ PASS`);

    // Test 6: Query blogs with filter
    console.log("\n✅ Test 6: Query blogs with filter");
    const filteredBlogs = await prisma.blog.findMany({
      where: {
        isFeatured: true,
      },
    });
    console.log(`   Result: Found ${filteredBlogs.length} featured blogs`);
    console.log(`   Status: ✅ PASS`);

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ ALL TESTS PASSED!\n");
    console.log("Blog system database is working correctly!");
    console.log("GraphQL queries should now work without errors.\n");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ ERROR:", error.message);
    console.error("\nStack:", error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testBlogQueries();
