describe("Check dark mode", () => {
    it("tests dark mode toggle", () => {
      cy.clearLocalStorage();
      cy.visit("http://localhost:3000/");
      cy.get("li#theme-toggle").click();
      cy.get("html").should('have.class', 'dark');
      cy.get("li#theme-toggle").click();
      cy.get("html").should('not.have.class', 'dark');
    });
  });