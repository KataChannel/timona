import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  console.log("Testing blog table access...");
  const categories = await prisma.blogCategory.findMany();
  console.log("✅ SUCCESS: blogCategory table exists and is accessible!");
  console.log("   Found", categories.length, "categories");
  process.exit(0);
} catch (error: any) {
  console.error("❌ ERROR:", error.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
