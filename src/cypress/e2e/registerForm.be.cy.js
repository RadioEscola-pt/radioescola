describe('Authentication Tests', () => {
    beforeEach(() => {
      // Visit the application before each test
      cy.visit('http://localhost:3000');
      cy.get('#loginLink').click();
    });
  
    it('allows a user to register', () => {
      
      
      cy.get('#show-registration-form').click();
      cy.get('#registration-form').should('be.visible');
      cy.get('#email').type('testuser@example.com');
      cy.get('#password').type('testpassword');
      cy.get('#confirm-password').type('testpassword');
      cy.get('#registration-form input[type="submit"]').click();
      
      // Add assertions based on expected outcome, e.g., a successful registration message
      cy.get('#login-message').should('contain.text', 'Conta Criada verifique o seu email'); // Update based on actual success message
    });
  
    it('allows a user to log in', () => {
      cy.get('#login-email').type('testuser@example.com');
      cy.get('#login-password').type('testpassword');
      cy.get('#login-form input[type="submit"]').click();
      
      cy.get('#login-message').should('contain.text', 'Utilizador registado com sucesso'); // Update based on actual success message
    });
  
    it('allows a user to request a password reset', () => {
      cy.get('#lost-password-button').click();
      cy.get('#lost-password-form').should('be.visible');
      cy.get('#lost-password-email').type('testuser@example.com');
      cy.get('#lost-password-form input[type="button"]').click();
      
      // Assert that the password reset request was successful
      cy.get('#login-message').should('contain.text', 'Reset email sent'); // Update based on actual message
    });
  

    // Add any additional tests as necessary for complete coverage
  });
  describe('Registration delete', () => {
    it('registers a new user', () => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/ajax/deleteUser',
        body: {

          email: 'testuser@example.com',
          pass: 'testpassword',
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        console.log('Response:', response);
        expect(response.body).to.have.property('success', true);
      });
    });
  });