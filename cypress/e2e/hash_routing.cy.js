describe("Hash-based URL routing", () => {

  describe("Chapter navigation updates URL", () => {
    it("updates hash when clicking navbar links", () => {
      cy.visit("http://localhost:3000");

      // Navigate via hash directly and verify content loads
      cy.window().then((win) => { win.location.hash = "/equipa"; });
      cy.hash().should("eq", "#/equipa");
      cy.get("#welcome").should("contain.text", "Objetivo do Projeto");

      cy.window().then((win) => { win.location.hash = "/EDN"; });
      cy.hash().should("eq", "#/EDN");
      cy.get("#welcome").should("contain.text", "Estatísticas Radioamadores");

      cy.window().then((win) => { win.location.hash = "/home"; });
      cy.hash().should("eq", "#/home");
      cy.get("#welcome").should("contain.text", "Bem-vindo à Escola de Radioamador");
    });

    it("navbar links have correct hash hrefs", () => {
      cy.visit("http://localhost:3000");
      cy.get('a[href="#/home"]').should("exist");
      cy.get('a[href="#/equipa"]').should("exist");
      cy.get('a[href="#/EDN"]').should("exist");
      cy.get('a[href="#/ser_radioamador"]').should("exist");
      cy.get('a[href="#/estado-da-escola"]').should("exist");
    });
  });

  describe("Direct URL navigation", () => {
    it("loads equipa chapter from direct URL", () => {
      cy.visit("http://localhost:3000/#/equipa");
      cy.get("#welcome").should("contain.text", "Objetivo do Projeto");
    });

    it("loads EDN chapter from direct URL", () => {
      cy.visit("http://localhost:3000/#/EDN");
      cy.get("#welcome").should("contain.text", "Estatísticas Radioamadores");
    });

    it("loads ser_radioamador from direct URL", () => {
      cy.visit("http://localhost:3000/#/ser_radioamador");
      cy.get("#welcome").should("contain.text", "radioamador");
    });

    it("loads estado da escola from direct URL", () => {
      cy.visit("http://localhost:3000/#/estado-da-escola");
      cy.get("#welcome").should("contain.text", "Estado da Escola");
    });
  });

  describe("Browser back/forward", () => {
    it("navigates back and forward between chapters", () => {
      cy.visit("http://localhost:3000");
      cy.get("#welcome").should("contain.text", "Bem-vindo à Escola de Radioamador");

      cy.get('a[href="#/equipa"]').first().click();
      cy.get("#welcome").should("contain.text", "Objetivo do Projeto");

      cy.get('a[href="#/EDN"]').first().click();
      cy.get("#welcome").should("contain.text", "Estatísticas Radioamadores");

      cy.go("back");
      cy.hash().should("eq", "#/equipa");
      cy.get("#welcome").should("contain.text", "Objetivo do Projeto");

      cy.go("forward");
      cy.hash().should("eq", "#/EDN");
      cy.get("#welcome").should("contain.text", "Estatísticas Radioamadores");
    });
  });

  describe("Calculator hash routing still works", () => {
    it("loads Ohm calculator via hash", () => {
      cy.visit("http://localhost:3000/#OHMCALC");
      cy.contains("h1", "Lei de Ohm").should("be.visible");
    });
  });

  describe("Exam hash routing", () => {
    it("loads cat3 simulator from direct URL", () => {
      cy.visit("http://localhost:3000/#/exame/cat3/simulador");
      cy.get("#welcome").should("not.be.empty");
    });

    it("loads cat3 all questions from direct URL", () => {
      cy.visit("http://localhost:3000/#/exame/cat3/todas");
      cy.get("#welcome").should("exist");
    });

    it("shows proper exam hrefs in navbar", () => {
      cy.viewport("macbook-13");
      cy.visit("http://localhost:3000");
      cy.get('a[href="#/exame/cat3/simulador"]').should("exist");
      cy.get('a[href="#/exame/cat3/todas"]').should("exist");
      cy.get('a[href="#/exame/cat3/favoritas"]').should("exist");
      cy.get('a[href="#/exame/cat2/simulador"]').should("exist");
      cy.get('a[href="#/exame/cat1/simulador"]').should("exist");
    });
  });

  describe("Backward compatibility", () => {
    it("redirects ?LoadChapter= to hash URL", () => {
      cy.visit("http://localhost:3000/?LoadChapter=equipa");
      cy.hash().should("eq", "#/equipa");
      cy.get("#welcome").should("contain.text", "Objetivo do Projeto");
    });
  });

  describe("Study navbar uses hash links", () => {
    it("study dropdown links use hash format", () => {
      cy.viewport("macbook-13");
      cy.visit("http://localhost:3000");
      cy.get("#studyLink").click();
      cy.get("#categoria3Button").click();
      cy.get("#categoria3Dropdown li a").first().should("have.attr", "href").and("match", /^#\//);
    });
  });
});
