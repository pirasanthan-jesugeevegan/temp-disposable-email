import {
  GeneratedEmail,
  generateEmail,
  GetEmailOptions,
  getRecentEmail,
  MessageContent,
} from './index';

Cypress.Commands.add('generateEmail', function (prefix?: string) {
  return cy.wrap(generateEmail(prefix));
});

Cypress.Commands.add('getRecentEmail', function (options: GetEmailOptions) {
  return cy.wrap(getRecentEmail(options));
});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Creates a new email inbox with a unique address.
       *
       * This function generates an temp inbox & email address
       *
       * @param {string} [emailPrefix] - Optional emailPrefix; a random one is generated if not provided.
       * @returns {Promise<GeneratedEmail>} The generated email address & account ID.
       *
       * @throws {Error} If no domains are available or account creation fails.
       *
       * @example
       * cy.generateEmail("customUser");
       * Outputs: {"emailAddress": "customUser@mail.tm" ,  "accountId": "1234"}
       */
      generateEmail(prefix?: string): Chainable<GeneratedEmail>;

      /**
       * Retrieves the latest message from the inbox.
       *
       * @param {GetEmailOptions} [options] - Optional settings for polling and deletion.
       * @param {number} [options.maxWaitTime=30000] - Maximum time to wait for messages (in milliseconds). Default is 30 seconds.
       * @param {number} [options.waitInterval=2000] - Time interval between polling attempts (in milliseconds). Default is 2 seconds.
       * @param {boolean} [options.logPolling=false] - Whether to log polling attempts. Default is `false`.
       * @param {boolean} [options.deleteAfterRead=false] - Whether to delete the message after reading. Default is `false`.
       * @returns {Promise<MessageContent | null>} The email content (sender, recipient, subject, text, HTML), or `null` if no messages are found.
       *
       * @throws {Error} If no messages are available within the polling timeout or authentication fails.
       *
       * @example
       * cy.getRecentEmail({ maxWaitTime: 5000, waitInterval: 1000, logPolling: true });
       * Outputs: {
            "from": { "address": "sender@example.com" },
            "to": [
              { "address": "recipient1@example.com" },
              { "address": "recipient2@example.com" }
            ],
            "subject": "Welcome to Our Service",
            "intro": "Thank you for signing up!",
            "text": "Hello,\n\nThank you for joining our service. We're excited to have you on board!\n\nBest regards,\nThe Team",
            "html": [
              "<html>",
              "<body>",
              "<h1>Welcome to Our Service</h1>",
              "<p>Thank you for signing up!</p>",
              "<p>We're excited to have you on board!</p>",
              "<p>Best regards,</p>",
              "<p>The Team</p>",
              "</body>",
              "</html>"
            ],
            "createdAt": "2024-12-05T10:00:00Z",
            "updatedAt": "2024-12-05T10:05:00Z"
          }
       */
      getRecentEmail(
        options: GetEmailOptions
      ): Chainable<MessageContent | null>;
    }
  }
}
