describe('Authentication Tests', () => {
    beforeEach(() => {
      // Visit the application before each test
      cy.visit('http://localhost:3000');
    });
  
    it('allows a user to register', () => {
      cy.get('#show-registration-form').click();
      cy.get('#registration-form').should('be.visible');
      cy.get('#email').type('testuser@example.com');
      cy.get('#password').type('testpassword');
      cy.get('#confirm-password').type('testpassword');
      cy.get('#registration-form input[type="submit"]').click();
      
      // Add assertions based on expected outcome, e.g., a successful registration message
      cy.get('#login-message').should('contain.text', 'Registration successful'); // Update based on actual success message
    });
  
    it('allows a user to log in', () => {
      cy.get('#login-email').type('testuser@example.com');
      cy.get('#login-password').type('testpassword');
      cy.get('#login-form input[type="submit"]').click();
      
      // Assert login success, e.g., by checking that the logout button is visible
      cy.get('#logout-container').should('be.visible');
    });
  
    it('allows a user to request a password reset', () => {
      cy.get('#lost-password-button').click();
      cy.get('#lost-password-form').should('be.visible');
      cy.get('#lost-password-email').type('testuser@example.com');
      cy.get('#lost-password-form input[type="button"]').click();
      
      // Assert that the password reset request was successful
      cy.get('#login-message').should('contain.text', 'Reset email sent'); // Update based on actual message
    });
  
    it('allows a user to log out', () => {
      // Assuming the user is already logged in for this test
      cy.get('#logout-button').click();
      
      // Assert logout success, e.g., by checking that the login form is visible again
      cy.get('#login-form').should('be.visible');
    });
  
    // Add any additional tests as necessary for complete coverage
  });