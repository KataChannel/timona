/// <reference types="cypress" />

describe('Post Management', () => {
  beforeEach(() => {
    const email = Cypress.env('TEST_USER_EMAIL');
    const password = Cypress.env('TEST_USER_PASSWORD');
    
    cy.setupTestUser();
    cy.login(email, password);
    cy.visit('/dashboard');
  });

  it('should display posts list correctly', () => {
    // Wait for posts to load
    cy.waitForGraphQL('GetPosts');
    
    // Check posts container exists
    cy.get('[data-testid="posts-list"]').should('be.visible');
    
    // Check pagination controls if posts exist
    cy.get('body').then((body) => {
      if (body.find('[data-testid="post-item"]').length > 0) {
        cy.get('[data-testid="pagination"]').should('be.visible');
      }
    });
  });

  it('should create a new post successfully', () => {
    const postTitle = `Test Post ${Date.now()}`;
    const postContent = 'This is a test post content created by Cypress automation.';
    
    // Intercept create post mutation
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body.operationName === 'CreatePost') {
        req.alias = 'createPost';
      }
    });
    
    // Click create post button
    cy.get('[data-testid="create-post-button"]').click();
    
    // Fill in post form
    cy.get('[data-testid="post-title-input"]').type(postTitle);
    cy.get('[data-testid="post-content-input"]').type(postContent);
    
    // Submit the form
    cy.get('[data-testid="submit-post-button"]').click();
    
    // Wait for the mutation to complete
    cy.wait('@createPost');
    
    // Check that the post appears in the list
    cy.contains(postTitle).should('be.visible');
    cy.contains(postContent).should('be.visible');
    
    // Check success notification
    cy.contains('Post created successfully').should('be.visible');
  });

  it('should validate post creation form', () => {
    cy.get('[data-testid="create-post-button"]').click();
    
    // Try to submit empty form
    cy.get('[data-testid="submit-post-button"]').click();
    
    // Should show validation errors
    cy.contains('Please fill in all fields').should('be.visible');
    
    // Fill only title
    cy.get('[data-testid="post-title-input"]').type('Test Title');
    cy.get('[data-testid="submit-post-button"]').click();
    
    // Should still show error for missing content
    cy.contains('Please fill in all fields').should('be.visible');
  });

  it('should show loading state during post creation', () => {
    cy.get('[data-testid="create-post-button"]').click();
    
    // Fill the form
    cy.get('[data-testid="post-title-input"]').type('Test Post');
    cy.get('[data-testid="post-content-input"]').type('Test content');
    
    // Intercept and delay the create post request
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body.operationName === 'CreatePost') {
        // Add delay to see loading state
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(req.reply());
          }, 2000);
        });
      }
    });
    
    cy.get('[data-testid="submit-post-button"]').click();
    
    // Check loading state
    cy.get('[data-testid="submit-post-button"]').should('contain', 'Creating...');
    cy.get('[data-testid="submit-post-button"]').should('be.disabled');
  });

  it('should handle post interactions (like, share)', () => {
    // First create a test post
    cy.createPost('Test Post for Interactions', 'Content for testing interactions');
    
    // Find the post and interact with it
    cy.contains('Test Post for Interactions').parents('[data-testid="post-item"]').within(() => {
      // Test like functionality
      cy.get('[data-testid="like-button"]').click();
      cy.get('[data-testid="like-count"]').should('contain', '1');
      
      // Test unlike
      cy.get('[data-testid="like-button"]').click();
      cy.get('[data-testid="like-count"]').should('contain', '0');
      
      // Test share button
      cy.get('[data-testid="share-button"]').click();
      cy.contains('Link copied to clipboard').should('be.visible');
    });
  });

  it('should display AI summaries when available', () => {
    // Mock a post with AI summary
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body.operationName === 'GetPosts') {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              posts: {
                edges: [
                  {
                    node: {
                      id: '1',
                      title: 'Post with AI Summary',
                      content: 'This is a long post that has an AI-generated summary.',
                      aiSummary: 'AI Summary: This post discusses important topics.',
                      author: {
                        id: '1',
                        username: 'testuser',
                        email: 'test@example.com'
                      },
                      likes: 0,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    }
                  }
                ],
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor: '1',
                  endCursor: '1'
                }
              }
            }
          }
        });
      }
    });
    
    cy.reload();
    
    // Check that AI summary is displayed
    cy.contains('AI Summary: This post discusses important topics.').should('be.visible');
    cy.get('[data-testid="ai-summary"]').should('be.visible');
  });

  it('should handle pagination correctly', () => {
    // Mock multiple pages of posts
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body.operationName === 'GetPosts') {
        const posts = Array.from({ length: 10 }, (_, i) => ({
          node: {
            id: String(i + 1),
            title: `Post ${i + 1}`,
            content: `Content for post ${i + 1}`,
            author: {
              id: '1',
              username: 'testuser',
              email: 'test@example.com'
            },
            likes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }));
        
        req.reply({
          statusCode: 200,
          body: {
            data: {
              posts: {
                edges: posts,
                pageInfo: {
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor: '1',
                  endCursor: '10'
                }
              }
            }
          }
        });
      }
    });
    
    cy.reload();
    
    // Check that posts are displayed
    cy.get('[data-testid="post-item"]').should('have.length', 10);
    
    // Check pagination controls
    cy.get('[data-testid="next-page-button"]').should('be.visible').and('not.be.disabled');
    cy.get('[data-testid="prev-page-button"]').should('be.disabled');
  });

  it('should cancel post creation', () => {
    cy.get('[data-testid="create-post-button"]').click();
    
    // Fill some content
    cy.get('[data-testid="post-title-input"]').type('Test Title');
    
    // Cancel
    cy.get('[data-testid="cancel-post-button"]').click();
    
    // Form should be hidden
    cy.get('[data-testid="post-title-input"]').should('not.exist');
    
    // Create button should be visible again
    cy.get('[data-testid="create-post-button"]').should('be.visible');
  });
});
