/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.setupTestUser();
  });

  it('should display login page correctly', () => {
    cy.visit('/login');
    
    // Check page elements
    cy.get('[data-testid="login-form"]').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
    
    // Check page title
    cy.title().should('include', 'Login');
    cy.contains('Sign in to your account').should('be.visible');
  });

  it('should show validation errors for invalid inputs', () => {
    cy.visit('/login');
    
    // Try to submit with empty fields
    cy.get('[data-testid="login-button"]').click();
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
    
    // Try with invalid email
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="login-button"]').click();
    cy.contains('Please enter a valid email address').should('be.visible');
    
    // Try with short password
    cy.get('[data-testid="email-input"]').clear().type('test@example.com');
    cy.get('[data-testid="password-input"]').type('123');
    cy.get('[data-testid="login-button"]').click();
    cy.contains('Password must be at least 6 characters').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    const email = Cypress.env('TEST_USER_EMAIL');
    const password = Cypress.env('TEST_USER_PASSWORD');
    
    cy.visit('/login');
    
    // Intercept GraphQL login request
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body.operationName === 'LoginUser') {
        req.alias = 'loginRequest';
      }
    });
    
    // Fill in credentials
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for login request
    cy.wait('@loginRequest');
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Check that token is stored
    cy.window().its('localStorage.token').should('exist');
    
    // Check welcome message
    cy.contains(`Welcome, ${email}`).should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');
    
    // Intercept GraphQL login request
    cy.intercept('POST', '**/graphql', (req) => {
      if (req.body.operationName === 'LoginUser') {
        req.reply({
          statusCode: 200,
          body: {
            data: null,
            errors: [
              {
                message: 'Invalid credentials',
                extensions: {
                  code: 'UNAUTHENTICATED'
                }
              }
            ]
          }
        });
        req.alias = 'loginRequest';
      }
    });
    
    cy.get('[data-testid="email-input"]').type('wrong@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    cy.wait('@loginRequest');
    
    // Should show error message
    cy.contains('Invalid credentials').should('be.visible');
    
    // Should stay on login page
    cy.url().should('include', '/login');
  });

  it('should toggle password visibility', () => {
    cy.visit('/login');
    
    const password = 'testpassword123';
    cy.get('[data-testid="password-input"]').type(password);
    
    // Password should be hidden by default
    cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'password');
    
    // Click toggle button
    cy.get('[data-testid="password-toggle"]').click();
    
    // Password should now be visible
    cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'text');
    
    // Click toggle again
    cy.get('[data-testid="password-toggle"]').click();
    
    // Password should be hidden again
    cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'password');
  });

  it('should handle logout functionality', () => {
    const email = Cypress.env('TEST_USER_EMAIL');
    const password = Cypress.env('TEST_USER_PASSWORD');
    
    // Login first
    cy.login(email, password);
    cy.visit('/dashboard');
    
    // Find and click logout button (assuming it exists in header)
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Should redirect to login page
    cy.url().should('include', '/login');
    
    // Token should be removed
    cy.window().its('localStorage.token').should('not.exist');
  });

  it('should redirect unauthenticated users to login', () => {
    // Try to access protected route without authentication
    cy.visit('/dashboard');
    
    // Should redirect to login page
    cy.url().should('include', '/login');
  });
});
