describe("Check navigation", () => {
    it("tests basic website navigation", () => {
      cy.visit("http://localhost:3000");
      cy.get("#navbar-multi-level > ul > li:nth-of-type(1) > a").click();
      cy.get("#welcome").should('contain.text', 'Bem-vindo à Escola de Radioamador');

      cy.get("#navbar-multi-level > ul > li:nth-of-type(2) > a").click();
      cy.get("#welcome").should('contain.text', 'Objetivo do Projeto');
      cy.get("#navbar-multi-level > ul > li:nth-of-type(3) > a").click();
      cy.get("#welcome").should('contain.text', 'Estatísticas Radioamadores em Portugal 2023');
    });


    it("tests category 1 study links", () => {
        cy.viewport('macbook-13');
        cy.visit("http://localhost:3000");

        cy.get("#studyLink").click();
        cy.get("#categoria1Button").click();

        cy.get("#categoria1Dropdown li a").contains("Ganho (dB)").click();
        cy.get("#welcome").should('contain.text', 'O decibel, cujo símbolo é dB,');
        
        cy.get("#categoria1Dropdown li a").contains("Tranformadores").click();
        cy.get("#welcome").should('contain.text', 'Um transformador é um dispositivo elétrico');
  
        cy.get("#categoria1Dropdown li a").contains("Amplificadores operacionais").click();
        cy.get("#welcome").should('contain.text', 'Os amplificadores operacionais são dispositivos eletrónicos');

        cy.get("#categoria1Dropdown li a").contains("Reactância Indutiva").click();
        cy.get("#welcome").should('contain.text', 'Indutores e Reatância Indutiva');

        cy.get("#categoria1Dropdown li a").contains("Reactância Capacitiva").click();
        cy.get("#welcome").should('contain.text', 'Condensadores e Reatância Capacitiva');

        cy.get("#categoria1Dropdown li a").contains("Circuitos RL").click();
        cy.get("#welcome").should('contain.text', 'Antes de mergulharmos no tópico de adicionar impedância reativa');

        cy.get("#categoria1Dropdown li a").contains("RLC").click();
        cy.get("#welcome").should('contain.text', 'Circuito RLC e Impedância');

        cy.get("#categoria1Dropdown li a").contains("Receptores").click();
        cy.get("#welcome").should('contain.text', 'Recetor Super-regenerativo');
    });

    it("tests category 2 study links", () => {
        cy.visit("http://localhost:3000");

        cy.get("#studyLink").click();
        cy.get("#categoria2Button").click();

        cy.get("#categoria2Dropdown li a").contains("Bobines").click();
        cy.get("#welcome").should('contain.text', 'O que é uma Bobina?');
        
        cy.get("#categoria2Dropdown li a").contains("Capacidade de baterias").click();
        cy.get("#welcome").should('contain.text', 'Capacidade de uma bateria');
  
        cy.get("#categoria2Dropdown li a").contains("Onda estacionária (SWR)").click();
        cy.get("#welcome").should('contain.text', 'VSWR é definido como a razão entre as ondas estacionárias ');
    });

    it("tests category 3 study links", () => {
        cy.visit("http://localhost:3000");

        cy.get("#studyLink > img").click();
        cy.get("#categoria3Button").click();
        
        cy.get("#categoria3Dropdown li a").contains("Alfabeto Fonético").click();
        cy.get("#welcome").should('contain.text', 'Alfabeto Fonético');
        
        cy.get("#categoria3Dropdown li a").contains("Abreviaturas de Operação").click();
        cy.get("#welcome").should('contain.text', 'Abreviaturas de Operação');
  
        cy.get("#categoria3Dropdown li a").contains("Definições Genéricas").click();
        cy.get("#welcome").should('contain.text', 'Definições genéricas');
  
        cy.get("#categoria3Dropdown li a").contains("Entidades e Competências").click();
        cy.get("#welcome").should('contain.text', 'Entidades e suas competências');
  
        cy.get("#categoria3Dropdown li a").contains("Código Q").click();
        cy.get("#welcome").should('contain.text', 'Código Q');
  
        cy.get("#categoria3Dropdown li a").contains("Prefixos de indicativos").click();
        cy.get("#welcome").should('contain.text', 'Lista dos prefixos de indicativos de chamada');
  
        cy.get("#categoria3Dropdown li a").contains("Lei de Ohm").click();
        cy.get("#welcome").should('contain.text', 'Lei de Ohm');
  
        cy.get("#categoria3Dropdown li a").contains("Corrente Alternada / AC").click();
        cy.get("#welcome").should('contain.text', 'Corrente Alternada / AC');
  
        cy.get("#categoria3Dropdown li a").contains("Código de cores").click();
        cy.get("#welcome").should('contain.text', 'Código de cores para resistências');
  
        cy.get("#categoria3Dropdown li a").contains("Mult e SubMult. de Unidades").click();
        cy.get("#welcome").should('contain.text', 'Múltiplos e submúltiplos de unidades');
      });

  });
  