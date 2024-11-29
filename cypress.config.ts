import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 60000,
  e2e: {
    specPattern: 'examples/cypress/e2e/**/*.cy.ts',
    supportFile: 'examples/cypress/support/e2e.ts',
    fixturesFolder: 'examples/cypress/fixtures',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
