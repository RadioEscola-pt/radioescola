describe("Component calculator", () => {
  it("Sums two series capacitors of 10F + 20F", () => {
    cy.visit("http://localhost:3000/");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Lei de Ohm").click();
    cy.get("tr:nth-of-type(1) input").click().clear().type("10");
    cy.get("tr:nth-of-type(2) input").click().clear().type("20");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Total Value: 6.6667');
  });

  it("Sums two series capacitors of 1F + 2F", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Lei de Ohm").click();
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Total Value: 0.6667');
  });

  it("Sums two parallel capacitors of 10F + 20F", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/#");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Lei de Ohm").click();
    cy.get("tr:nth-of-type(1) input").click().clear().type("10")
    cy.get("tr:nth-of-type(2) input").click().clear().type("20");
    cy.get("#seriesParallel").select("parallel");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Valor Total: 30.0000');

  });

  it("Sums two series capacitors of 1MF + 400kF", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/#");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Lei de Ohm").click();
    cy.get("tr:nth-of-type(1) input").click();
    cy.get("tr:nth-of-type(1) select").select("MEGA");
    cy.get("tr:nth-of-type(2) select:first").select("KILO");
    cy.get("tr:nth-of-type(1) input").click().clear().type("1");
    cy.get("tr:nth-of-type(2) input").click().clear().type("400");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Total Value: 2.857e+5');

  });

  it("Sums two series capacitors of 2MF + 500kF, output in KILO", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/#");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Lei de Ohm").click();
    cy.get("tr:nth-of-type(1) input").click();
    cy.get("tr:nth-of-type(1) select").select("MEGA");
    cy.get("tr:nth-of-type(2) select:first").select("KILO");
    cy.get("tr:nth-of-type(1) input").click().clear().type("2");
    cy.get("tr:nth-of-type(2) input").click().clear().type("500");
    cy.get("#ResultIn").select("KILO");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Total Value: 400.0000');
  });

  it("Sums four parallel capacitors of 20uF, 206nF, 1F, 12mF, outputs in mF", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/#");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Lei de Ohm").click();
    cy.get("#addRowBtn").click();
    cy.get("#addRowBtn").click();
    cy.get("#seriesParallel").select("parallel");
    cy.get("tr:nth-of-type(1) input").click().clear().type("20");
    cy.get("tr:nth-of-type(1) select").select("MICRO");
    cy.get("tr:nth-of-type(2) input").click().clear().type("206");
    cy.get("tr:nth-of-type(2) select:first").select("NANO");
    cy.get("tr:nth-of-type(3) input").click().clear().type("1");
    cy.get("tr:nth-of-type(3) select:first").select("NONE");
    cy.get("tr:nth-of-type(4) input").click().clear().type("12");
    cy.get("tr:nth-of-type(4) select:first").select("MILI");
    cy.get("#ResultIn").select("MILI");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Valor Total: 1.012e+3');

  });

  it("Sums two resistors of 10ohm + 20ohm, in series, then parallel", () => {
    cy.viewport(1920, 1080);
    cy.visit("http://localhost:3000/#");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Lei de Ohm").click();
    cy.get("#componentType").select("Ω");
    cy.get("tr:nth-of-type(1) input").clear().type("10");
    cy.get("tr:nth-of-type(2) input").clear().type("20");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Valor Total: 30.0000');
    cy.get("#seriesParallel").select("parallel");
    cy.get("#calculateBtn").click();
    cy.get("#totalValue").should('have.text', 'Total Value: 6.6667');
  });
});