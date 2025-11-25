/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login user
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to create a post
       * @example cy.createPost('Title', 'Content')
       */
      createPost(title: string, content: string): Chainable<void>;
      
      /**
       * Custom command to wait for GraphQL operation
       * @example cy.waitForGraphQL('GetPosts')
       */
      waitForGraphQL(operationName: string): Chainable<void>;
      
      /**
       * Custom command to setup test user
       */
      setupTestUser(): Chainable<void>;
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for successful login
    cy.url().should('not.include', '/login');
    cy.window().its('localStorage.token').should('exist');
  });
});

// Create post command
Cypress.Commands.add('createPost', (title: string, content: string) => {
  cy.get('[data-testid="create-post-button"]').click();
  cy.get('[data-testid="post-title-input"]').type(title);
  cy.get('[data-testid="post-content-input"]').type(content);
  cy.get('[data-testid="submit-post-button"]').click();
  
  // Wait for post to be created
  cy.contains(title).should('be.visible');
});

// Wait for GraphQL operation
Cypress.Commands.add('waitForGraphQL', (operationName: string) => {
  cy.intercept('POST', '**/graphql', (req) => {
    if (req.body.operationName === operationName) {
      req.alias = operationName;
    }
  });
  cy.wait(`@${operationName}`);
});

// Setup test user
Cypress.Commands.add('setupTestUser', () => {
  const email = Cypress.env('TEST_USER_EMAIL');
  const password = Cypress.env('TEST_USER_PASSWORD');
  
  // Create test user via API if it doesn't exist
  cy.request({
    method: 'POST',
    url: Cypress.env('BACKEND_URL'),
    body: {
      query: `
        mutation RegisterUser($input: RegisterUserInput!) {
          registerUser(input: $input) {
            user {
              id
              email
              username
            }
            accessToken
          }
        }
      `,
      variables: {
        input: {
          email,
          password,
          username: 'testuser'
        }
      }
    },
    failOnStatusCode: false
  }).then((response) => {
    // User might already exist, which is fine
    cy.log('Test user setup completed');
  });
});

export {};
