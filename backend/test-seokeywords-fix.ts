// Test script to verify seoKeywords field resolver fix
// Run: bun run test-seokeywords-fix.ts

const GRAPHQL_ENDPOINT = 'http://localhost:14000/graphql';

// Get auth token (replace with your actual token or login first)
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'YOUR_JWT_TOKEN_HERE';

const query = `
  query GetPages {
    getPages(pagination: { page: 1, limit: 10 }) {
      items {
        id
        title
        slug
        seoKeywords
        seoTitle
        seoDescription
        status
      }
      pagination {
        currentPage
        totalPages
        totalItems
      }
    }
  }
`;

async function testSeoKeywordsFix() {
  console.log('🧪 Testing seoKeywords Field Resolver Fix\n');
  console.log('📡 GraphQL Endpoint:', GRAPHQL_ENDPOINT);
  console.log('🔑 Auth Token:', AUTH_TOKEN ? 'Present' : 'Missing (will fail)');
  console.log('\n' + '='.repeat(70) + '\n');

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('❌ GraphQL Errors:\n');
      result.errors.forEach((error: any, index: number) => {
        console.error(`Error ${index + 1}:`);
        console.error('  Message:', error.message);
        if (error.path) console.error('  Path:', error.path);
        console.error('');
      });
      
      // Check if it's the seoKeywords error
      const seoKeywordsError = result.errors.find((e: any) => 
        e.message.includes('seoKeywords')
      );
      
      if (seoKeywordsError) {
        console.error('🔴 seoKeywords error still present - Fix NOT working!\n');
        process.exit(1);
      } else {
        console.error('⚠️  Other GraphQL errors present\n');
        process.exit(1);
      }
    }

    if (result.data?.getPages) {
      const { items, pagination } = result.data.getPages;
      
      console.log('✅ Query Successful!\n');
      console.log('📊 Pagination:');
      console.log(`   - Current Page: ${pagination.currentPage}`);
      console.log(`   - Total Pages: ${pagination.totalPages}`);
      console.log(`   - Total Items: ${pagination.totalItems}`);
      console.log('\n' + '='.repeat(70) + '\n');
      
      console.log('📄 Pages:\n');
      
      items.forEach((page: any, index: number) => {
        console.log(`${index + 1}. ${page.title} (${page.slug})`);
        console.log(`   ID: ${page.id}`);
        console.log(`   Status: ${page.status}`);
        console.log(`   SEO Title: ${page.seoTitle || 'N/A'}`);
        console.log(`   SEO Description: ${page.seoDescription || 'N/A'}`);
        
        // Check seoKeywords type and value
        if (page.seoKeywords !== null && page.seoKeywords !== undefined) {
          const isArray = Array.isArray(page.seoKeywords);
          console.log(`   SEO Keywords: ${JSON.stringify(page.seoKeywords)}`);
          console.log(`   - Type: ${isArray ? '✅ Array' : '❌ ' + typeof page.seoKeywords}`);
          
          if (isArray) {
            console.log(`   - Length: ${page.seoKeywords.length}`);
            console.log(`   - Items: ${page.seoKeywords.map((k: string) => `"${k}"`).join(', ')}`);
          }
        } else {
          console.log(`   SEO Keywords: null`);
        }
        
        console.log('');
      });

      // Verify all seoKeywords are arrays
      const invalidKeywords = items.filter((page: any) => 
        page.seoKeywords !== null && !Array.isArray(page.seoKeywords)
      );

      if (invalidKeywords.length > 0) {
        console.error('❌ Found pages with non-array seoKeywords:');
        invalidKeywords.forEach((page: any) => {
          console.error(`   - ${page.title}: ${typeof page.seoKeywords}`);
        });
        console.error('\n🔴 Field Resolver NOT working correctly!\n');
        process.exit(1);
      }

      console.log('='.repeat(70));
      console.log('✅ All seoKeywords fields are arrays');
      console.log('✅ Field Resolver working correctly!');
      console.log('✅ Bug fix VERIFIED!\n');
      
    } else {
      console.error('❌ No data returned from query\n');
      console.error('Response:', JSON.stringify(result, null, 2));
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Network Error:\n');
    console.error(error);
    console.error('\nMake sure backend is running on port 14000');
    process.exit(1);
  }
}

// Run test
testSeoKeywordsFix().catch(console.error);
