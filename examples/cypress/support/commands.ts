/// <reference types="cypress" />

import {
  generateEmail,
  getRecentEmail,
  GetEmailOptions,
  GeneratedEmail,
  MessageContent,
} from '../../../src';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates a new inbox and returns its email address.
       */
      generateEmail(prefix?: string): Chainable<GeneratedEmail>;

      /**
       * Fetches the most recent email based on provided options.
       */
      getRecentEmail(
        options: GetEmailOptions
      ): Chainable<MessageContent | null>;
    }
  }
}

Cypress.Commands.add('generateEmail', function (prefix?: string) {
  return cy.wrap(generateEmail(prefix));
});

Cypress.Commands.add('getRecentEmail', function (options: GetEmailOptions) {
  return cy.wrap(getRecentEmail(options));
});
