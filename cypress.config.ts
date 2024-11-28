import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    specPattern: 'examples/cypress/e2e/**/*.cy.ts',
    supportFile: 'examples/cypress/support/e2e.ts',
    fixturesFolder: 'examples/cypress/fixtures',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
