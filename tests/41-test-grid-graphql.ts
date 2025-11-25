/**
 * Test GraphQL mutation for adding multiple GRID blocks
 * Simulates what the frontend does
 */

import { gql, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const ADD_PAGE_BLOCK = gql`
  mutation AddPageBlock($pageId: String!, $input: CreatePageBlockInput!) {
    addPageBlock(pageId: $pageId, input: $input) {
      id
      type
      order
      content
    }
  }
`;

async function testAddGridBlocks() {
  const client = new ApolloClient({
    link: new HttpLink({ 
      uri: 'http://localhost:3001/graphql',
      credentials: 'include',
    }),
    cache: new InMemoryCache(),
  });

  console.log('🧪 Testing Grid Block Addition via GraphQL\n');

  // First, create a page
  // (Assuming you have a test page ID, or we need to create one first)
  
  const pageId = 'YOUR_TEST_PAGE_ID'; // Replace with actual page ID
  
  console.log(`📝 Adding GRID blocks to page: ${pageId}\n`);

  for (let i = 1; i <= 5; i++) {
    try {
      const response = await client.mutate({
        mutation: ADD_PAGE_BLOCK,
        variables: {
          pageId,
          input: {
            type: 'GRID',
            content: {
              columns: 3,
              gap: 16,
              responsive: { sm: 1, md: 2, lg: 3 },
            },
            order: undefined, // Let backend calculate
          },
        },
      });

      const block = response.data?.addPageBlock;
      console.log(`✅ GRID Block #${i}: id=${block.id}, order=${block.order}`);
    } catch (error: any) {
      console.error(`❌ GRID Block #${i} failed:`, error.message);
      throw error;
    }
  }

  console.log('\n✅ All GRID blocks added successfully!');
}

testAddGridBlocks().catch(console.error);
