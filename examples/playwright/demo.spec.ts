import { test as base, expect } from '@playwright/test';
import {
  createInbox,
  getRecentEmail,
  deleteAccount,
} from 'temp-disposable-email';

interface EmailHelper {
  createInbox: typeof createInbox;
  getRecentEmail: typeof getRecentEmail;
  deleteAccount: typeof deleteAccount;
}

const test = base.extend<{ emailHelper: EmailHelper }>({
  emailHelper: async ({}, use) => {
    const emailHelper = {
      createInbox,
      getRecentEmail,
      deleteAccount,
    };
    await use(emailHelper);
  },
});

test.describe('Sign up with temporary email', () => {
  test.afterEach(async () => {
    await deleteAccount();
  });
  test('direct use from of the package', async ({ page }) => {
    const email = await createInbox(
      `newman${Math.random().toString().substr(2, 9)}`
    );
    await page.goto('https://app.postdrop.io/signup');
    await page.fill('#email', email);
    await page.fill('#password', 'Pass@123');
    await page.fill('#name', 'testMMMM');
    await page.fill('#company', 'testMMMMc');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
    await page
      .getByRole('heading', { name: 'Thanks for signing up!' })
      .isVisible();

    const mailbox = await getRecentEmail({
      maxWaitTime: 80000,
      waitInterval: 1000,
      deleteAfterRead: true,
      logPolling: true,
    });

    expect(mailbox?.subject).toContain('Postdrop - Verify Account');
  });

  test('use with fixtures', async ({ page, emailHelper }) => {
    const email = await emailHelper.createInbox(
      `newman${Math.random().toString().substr(2, 9)}`
    );
    await page.goto('https://app.postdrop.io/signup');
    await page.fill('#email', email);
    await page.fill('#password', 'Pass@123');
    await page.fill('#name', 'testMMMM');
    await page.fill('#company', 'testMMMMc');
    await page.getByRole('button', { name: 'Sign Up', exact: true }).click();
    await page
      .getByRole('heading', { name: 'Thanks for signing up!' })
      .isVisible();

    const mailbox = await emailHelper.getRecentEmail({
      maxWaitTime: 80000,
      waitInterval: 1000,
      deleteAfterRead: true,
      logPolling: true,
    });

    expect(mailbox?.subject).toContain('Postdrop - Verify Account');
  });
});
