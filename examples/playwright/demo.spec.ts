import { test as base, expect } from '@playwright/test';
import { generateEmail, getRecentEmail, getVerificationCode } from '../../src';
//! NOTE: replace from '../../src' with 'temp-disposable-email' in your project

interface EmailHelper {
  generateEmail: typeof generateEmail;
  getRecentEmail: typeof getRecentEmail;
}

const test = base.extend<{ emailHelper: EmailHelper }>({
  emailHelper: async ({}, use) => {
    const emailHelper = {
      generateEmail,
      getRecentEmail,
    };
    await use(emailHelper);
  },
});

test.describe('DEMO', () => {
  test('[Direct Use] - Sign up - Get Verification code from email', async ({
    page,
  }) => {
    // Create a dynamic email address
    const { emailAddress } = await generateEmail(
      `newman${Math.random().toString().substr(2, 9)}`
    );

    // Navigate to the playground website
    await page.goto('https://playground.mailslurp.com');

    // Define locators for reusability
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const signUpButton = page.locator(
      '[data-test="sign-up-create-account-button"]'
    );
    const verificationCodeInput = page.locator(
      '[data-test="confirm-sign-up-confirmation-code-input"]'
    );
    const confirmButton = page.locator(
      '[data-test="confirm-sign-up-confirm-button"]'
    );
    const signInPrompt = page.getByText('Sign in to your account');

    // Fill in the sign-up form
    await page.click('[data-test="sign-in-create-account-link"]');
    await emailInput.fill(emailAddress);
    await passwordInput.fill('Pass@123');
    await signUpButton.click();

    // Wait for the verification code input to appear
    await expect(verificationCodeInput).toBeVisible();

    // Fetch the verification code from the email
    const mailbox = await getRecentEmail({
      maxWaitTime: 80000,
      waitInterval: 1000,
      deleteAfterRead: true,
      logPolling: true,
    });
    const verificationCode = await getVerificationCode(mailbox?.html[0]);

    // Fill in the verification code and complete sign-up
    await verificationCodeInput.fill(verificationCode);
    await confirmButton.click();

    // Verify that the user is redirected to the sign-in page
    await expect(signInPrompt).toBeVisible();
  });
  test('[Fixtures Use] - Sign up - Check email content and subject', async ({
    page,
    emailHelper,
  }) => {
    // Create a dynamic email address
    const { emailAddress } = await emailHelper.generateEmail(
      `newman${Math.random().toString().substr(2, 9)}`
    );

    // Navigate to the sign-up page
    await page.goto('https://app.postdrop.io/signup');

    // Define locators for reusability
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    const nameInput = page.locator('#name');
    const companyInput = page.locator('#company');
    const signUpButton = page.getByRole('button', {
      name: 'Sign Up',
      exact: true,
    });
    const successMessage = page.getByRole('heading', {
      name: 'Thanks for signing up!',
    });

    // Fill in the sign-up form
    await emailInput.fill(emailAddress);
    await passwordInput.fill('Pass@123');
    await nameInput.fill('testMMMM');
    await companyInput.fill('testMMMMc');
    await signUpButton.click();

    // Verify the success message is displayed
    await expect(successMessage).toBeVisible();

    // Fetch the verification email
    const mailbox = await emailHelper.getRecentEmail({
      maxWaitTime: 80000,
      waitInterval: 1000,
      deleteAfterRead: true,
      logPolling: true,
    });

    // Assert email subject and content
    expect(mailbox?.subject).toContain('Postdrop - Verify Account');
    expect(mailbox?.html[0]).toContain(
      'please verify your account by clicking the button'
    );
  });
});
