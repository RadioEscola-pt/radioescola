describe('Registration', () => {
    it('registers a new user', () => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/ajax/register',
        body: {
          email: 'bbce82cdd@example.com',
          pass: 'password123',
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        console.log('Response:', response);
        expect(response.body).to.have.property('success', true);
      });
    });
  });
  describe('Registration LOGIN', () => {
    it('registers a new user', () => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/ajax/login',
        body: {
          email: 'bbce82cdd@example.com',
          pass: 'password123',
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        console.log('Response:', response);
        expect(response.body).to.have.property('success', true);
      });
    });
  });
  describe('Registration LOGIN Fail', () => {
    it('registers a new user', () => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/ajax/login',
        body: {
          email: 'bbce82cdd@example.com',
          pass: 'password',
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        console.log('Response:', response);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  describe('Registration delete', () => {
    it('registers a new user', () => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/ajax/deleteUser',
        body: {
          email: 'bbce82cdd@example.com',
          pass: 'password123',
        },
      }).then((response) => {
        expect(response.status).to.equal(200);
        console.log('Response:', response);
        expect(response.body).to.have.property('success', true);
      });
    });
  });