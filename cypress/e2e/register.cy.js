describe('Registration', () => {
    it('registers a new user', () => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/ajax/register',
        body: {
          email: 'test@example.com',
          pass: 'password123',
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('success', true);
      });
    });
  });