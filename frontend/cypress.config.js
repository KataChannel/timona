const { defineConfig } = require('cypress');

module.exports = defineConfig({
  baseUrl: "http://localhost:13000",
  viewportWidth: 1280,
  viewportHeight: 720,
  video: true,
  screenshotOnRunFailure: true,
  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  env: {
    BACKEND_URL: "http://localhost:14000/graphql",
    TEST_USER_EMAIL: "test@example.com",
    TEST_USER_PASSWORD: "password123"
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts"
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack"
    },
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/component.ts"
  }
});
