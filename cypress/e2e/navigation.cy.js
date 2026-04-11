describe("Check navigation", () => {
    it("tests basic website navigation", () => {
      cy.visit("http://localhost:3000");
      cy.window().then((win) => { win.location.hash = "/home"; });
      cy.get("#welcome").should('contain.text', 'Bem-vindo à Escola de Radioamador');
      cy.window().then((win) => { win.location.hash = "/equipa"; });
      cy.get("#welcome").should('contain.text', 'Objetivo do Projeto');
      cy.window().then((win) => { win.location.hash = "/EDN"; });
      cy.get("#welcome").should('contain.text', 'Estatísticas Radioamadores em Portugal 2023');
    });


    it("tests category 1 study links", () => {
        cy.visit("http://localhost:3000");

        cy.window().then((win) => { win.location.hash = "/gain"; });
        cy.get("#welcome").should('contain.text', 'O decibel, cujo símbolo é dB,');

        cy.window().then((win) => { win.location.hash = "/transformadores"; });
        cy.get("#welcome").should('contain.text', 'Um transformador é um dispositivo elétrico');

        cy.window().then((win) => { win.location.hash = "/opamps"; });
        cy.get("#welcome").should('contain.text', 'Os amplificadores operacionais são dispositivos eletrónicos');

        cy.window().then((win) => { win.location.hash = "/ReatanciaIndutiva"; });
        cy.get("#welcome").should('contain.text', 'Indutores e Reatância Indutiva');

        cy.window().then((win) => { win.location.hash = "/reactanciaCapacitiva"; });
        cy.get("#welcome").should('contain.text', 'Condensadores e Reatância Capacitiva');

        cy.window().then((win) => { win.location.hash = "/circuitosRL"; });
        cy.get("#welcome").should('contain.text', 'Antes de mergulharmos no tópico de adicionar impedância reativa');

        cy.window().then((win) => { win.location.hash = "/RLC"; });
        cy.get("#welcome").should('contain.text', 'Circuito RLC e Impedância');

        cy.window().then((win) => { win.location.hash = "/receptores"; });
        cy.get("#welcome").should('contain.text', 'Recetor Super-regenerativo');
    });

    it("tests category 2 study links", () => {
        cy.visit("http://localhost:3000");

        cy.window().then((win) => { win.location.hash = "/bobinesSomar"; });
        cy.get("#welcome").should('contain.text', 'O que é uma Bobina?');

        cy.window().then((win) => { win.location.hash = "/batteries"; });
        cy.get("#welcome").should('contain.text', 'Capacidade de uma bateria');

        cy.window().then((win) => { win.location.hash = "/SWR"; });
        cy.get("#welcome").should('contain.text', 'VSWR é definido como a razão entre as ondas estacionárias ');
    });

    it("tests category 3 study links", () => {
        cy.visit("http://localhost:3000");

        cy.window().then((win) => { win.location.hash = "/alfabeto"; });
        cy.get("#welcome").should('contain.text', 'Alfabeto Fonético');

        cy.window().then((win) => { win.location.hash = "/AbreviaturasOperacao"; });
        cy.get("#welcome").should('contain.text', 'Abreviaturas de Operação');

        cy.window().then((win) => { win.location.hash = "/defs_genericas"; });
        cy.get("#welcome").should('contain.text', 'Definições genéricas');

        cy.window().then((win) => { win.location.hash = "/entidades"; });
        cy.get("#welcome").should('contain.text', 'Entidades e suas competências');

        cy.window().then((win) => { win.location.hash = "/codigoq"; });
        cy.get("#welcome").should('contain.text', 'Código Q');

        cy.window().then((win) => { win.location.hash = "/prefixos"; });
        cy.get("#welcome").should('contain.text', 'Lista dos prefixos de indicativos de chamada');

        cy.window().then((win) => { win.location.hash = "/ohm"; });
        cy.get("#welcome").should('contain.text', 'Lei de Ohm');

        cy.window().then((win) => { win.location.hash = "/AC"; });
        cy.get("#welcome").should('contain.text', 'Corrente Alternada / AC');

        cy.window().then((win) => { win.location.hash = "/codigoDecores"; });
        cy.get("#welcome").should('contain.text', 'Código de cores para resistências');

        cy.window().then((win) => { win.location.hash = "/units"; });
        cy.get("#welcome").should('contain.text', 'Múltiplos e submúltiplos de unidades');
      });

  });
