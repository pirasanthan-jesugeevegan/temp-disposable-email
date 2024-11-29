import {
  createInbox,
  getRecentEmail,
  deleteAccount,
  getVerificationCode,
  MessageContent,
} from '../../../src';
//! NOTE: replace from '../../src' with 'temp-disposable-email' in your project
describe('DEMO', () => {
  it('[Custom Command] - Sign up - Check email content and subject', () => {
    // Create a dynamic email address
    cy.createInbox(`cypress_${Math.random().toString().substr(2, 9)}`).then(
      (email) => {
        // Navigate to the sign-up page
        cy.visit('https://app.postdrop.io/signup');

        // Fill in the sign-up form
        cy.get('#email').type(email);
        cy.get('#password').type('Pass@123');
        cy.get('#name').type('testMMMM');
        cy.get('#company').type('testMMMMc');
        cy.get('#btn-signup').click();
        // Verify the success message is displayed
        cy.contains('h1', 'Thanks for signing up!').should('be.visible');
        // Fetch the verification email
        cy.getRecentEmail({
          maxWaitTime: 80000,
          waitInterval: 1000,
          deleteAfterRead: true,
          logPolling: true,
        }).then((mailbox) => {
          // Assert email subject and content
          expect(mailbox?.subject).to.contain('Postdrop - Verify Account');
          expect(mailbox?.html[0]).to.contain(
            'please verify your account by clicking the button'
          );
        });
      }
    );
    cy.deleteAccount();
  });
});
describe('DEMOs', () => {
  it('[Direct Use] - Sign up - Get Verification code from email', () => {
    // Create a dynamic email address
    cy.wrap(createInbox()).then((email) => {
      // Navigate to the playground website
      cy.visit('https://playground.mailslurp.com');
      // Fill in the sign-up form
      cy.get('[data-test="sign-in-create-account-link"]').click();
      cy.get('input[name="email"]').type(email as string);
      cy.get('input[name="password"]').type('Pass@123');
      cy.get('[data-test="sign-up-create-account-button"]').click();
      cy.get('[data-test="confirm-sign-up-confirmation-code-input"]').should(
        'be.visible'
      );
      // Fetch the verification code from the email
      cy.wrap(
        getRecentEmail({
          maxWaitTime: 80000,
          waitInterval: 1000,
          deleteAfterRead: true,
          logPolling: true,
        })
      ).then((mailbox) => {
        const messageContent = mailbox as MessageContent;

        getVerificationCode(messageContent?.html[0]).then(
          (verificationCode) => {
            // Fill in the verification code and complete sign-up
            cy.get(
              '[data-test="confirm-sign-up-confirmation-code-input"]'
            ).type(verificationCode);
            cy.get('[data-test="confirm-sign-up-confirm-button"]').click();
            // Verify that the user is redirected to the sign-in page
            cy.contains('Sign in to your account').should('be.visible');
            cy.wrap(deleteAccount()); //Delete the account
          }
        );
      });
    });
  });
});
