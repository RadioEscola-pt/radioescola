describe("Component calculator", () => {
  const openCalculator = () => {
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Adicionar Componentes").click();
  };
  const row = (n) => cy.get(`#componentsTable > div:nth-of-type(${n})`);

  it("Sums two series capacitors of 10F + 20F", () => {
    cy.visit("http://localhost:3000/");
    openCalculator();
    row(1).find("input").click().clear().type("10");
    row(2).find("input").click().clear().type("20");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Valor Total: 6.6667');
  });

  it("Sums two series capacitors of 1F + 2F", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/");
    openCalculator();
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Valor Total: 0.6667');
  });

  it("Sums two parallel capacitors of 10F + 20F", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/#");
    openCalculator();
    row(1).find("input").click().clear().type("10");
    row(2).find("input").click().clear().type("20");
    cy.get("#seriesParallel").select("parallel");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Valor Total: 30.0000');
  });

  it("Sums two series capacitors of 1MF + 400kF", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/#");
    openCalculator();
    row(1).find("select").select("MEGA");
    row(2).find("select").select("KILO");
    row(1).find("input").click().clear().type("1");
    row(2).find("input").click().clear().type("400");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Valor Total: 2.857e+5');
  });

  it("Sums two series capacitors of 2MF + 500kF, output in KILO", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/#");
    openCalculator();
    row(1).find("select").select("MEGA");
    row(2).find("select").select("KILO");
    row(1).find("input").click().clear().type("2");
    row(2).find("input").click().clear().type("500");
    cy.get("#ResultIn").select("KILO");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Valor Total: 400.0000');
  });

  it("Sums four parallel capacitors of 20uF, 206nF, 1F, 12mF, outputs in mF", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/#");
    openCalculator();
    cy.get("#addRowBtn").click();
    cy.get("#addRowBtn").click();
    cy.get("#seriesParallel").select("parallel");
    row(1).find("input").click().clear().type("20");
    row(1).find("select").select("MICRO");
    row(2).find("input").click().clear().type("206");
    row(2).find("select").select("NANO");
    row(3).find("input").click().clear().type("1");
    row(3).find("select").select("NONE");
    row(4).find("input").click().clear().type("12");
    row(4).find("select").select("MILI");
    cy.get("#ResultIn").select("MILI");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Valor Total: 1.012e+3');
  });

  it("Sums two resistors of 10ohm + 20ohm, in series, then parallel", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/#");
    openCalculator();
    cy.get("#componentType").select("Ω");
    row(1).find("input").clear().type("10");
    row(2).find("input").clear().type("20");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Valor Total: 30.0000');
    cy.get("#seriesParallel").select("parallel");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Valor Total: 6.6667');
  });
});
