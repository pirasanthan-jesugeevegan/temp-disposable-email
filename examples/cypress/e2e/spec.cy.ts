describe('Sign up with temporary email', () => {
  it('basic usage', () => {
    cy.createInbox(`cypress_${Math.random().toString().substr(2, 9)}`).then(
      (email) => {
        cy.visit('https://app.postdrop.io/signup');

        cy.get('#email').type(email);
        cy.get('#password').type('Pass@123');
        cy.get('#name').type('testMMMM');
        cy.get('#company').type('testMMMMc');

        cy.get('#btn-signup').click();

        cy.contains('h1', 'Thanks for signing up!').should('be.visible');

        cy.getRecentEmail({
          maxWaitTime: 80000,
          waitInterval: 1000,
          deleteAfterRead: true,
          logPolling: true,
        }).then((mailbox) => {
          expect(mailbox?.subject).to.contain('Postdrop - Verify Account');
        });
      }
    );
  });
});
