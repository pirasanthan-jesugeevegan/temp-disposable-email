/// <reference types="cypress" />

import {
  createInbox,
  getRecentEmail,
  GetEmailOptions,
  MessageContent,
} from '../../../src';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates a new inbox and returns its email address.
       */
      createInbox(prefix?: string): Chainable<string>;

      /**
       * Fetches the most recent email based on provided options.
       */
      getRecentEmail(
        options: GetEmailOptions
      ): Chainable<MessageContent | null>;
    }
  }
}

Cypress.Commands.add('createInbox', function (prefix?: string) {
  return cy.wrap(createInbox(prefix));
});

Cypress.Commands.add('getRecentEmail', function (options: GetEmailOptions) {
  return cy.wrap(getRecentEmail(options));
});
