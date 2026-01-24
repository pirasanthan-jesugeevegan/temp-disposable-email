import { test as base } from '@playwright/test';
import {
  generateEmail,
  getRecentEmail,
  getVerificationCode,
  GeneratedEmail,
  MessageContent,
  GetEmailOptions,
} from './index';

/**
 * Email helper fixtures for Playwright tests.
 * Provides easy access to email generation and retrieval functions.
 */
export interface EmailFixtures {
  emailHelper: {
    generateEmail: typeof generateEmail;
    getRecentEmail: typeof getRecentEmail;
    getVerificationCode: typeof getVerificationCode;
  };
}

/**
 * Extended Playwright test with email helper fixtures.
 *
 * @example
 * import { test, expect } from 'temp-disposable-email/playwright';
 *
 * test('sign up flow', async ({ page, emailHelper }) => {
 *   const { emailAddress } = await emailHelper.generateEmail();
 *   // ... your test code
 * });
 */
export const test = base.extend<EmailFixtures>({
  // eslint-disable-next-line no-empty-pattern
  emailHelper: async ({}, use) => {
    await use({
      generateEmail,
      getRecentEmail,
      getVerificationCode,
    });
  },
});

export { expect } from '@playwright/test';

// Re-export types for convenience
export type { GeneratedEmail, MessageContent, GetEmailOptions };
