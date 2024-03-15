describe("Impedance Calculator", () => {
  it("tests inductive reactance - 10 H, 1 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#inductance").click().clear().type("10");
    cy.get("#frequency").click().clear().type("1");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 62.8319 ohms");
  });

  it("tests inductive reactance 324 pH, 678 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#unit").select("PICO");
    cy.get("#inductance").click().clear().type("324");
    cy.get("#frequency").click().clear().type("678");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 1.380e-6 ohms");
  });

  it("tests inductive reactance 400 nH, 500 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#unit").select("NANO");
    cy.get("#inductance").click().clear().type("400");
    cy.get("#frequency").click().clear().type("500");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 0.0013 ohms");
  });

  it("tests inductive reactance 500 uH, 600 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#unit").select("MICRO");
    cy.get("#inductance").click().clear().type("500");
    cy.get("#frequency").click().clear().type("600");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 1.8850 ohms");
  });

  it("tests inductive reactance 1 mH, 10 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000/");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#unit").select("MILI");
    cy.get("#inductance").click().clear().type("1");
    cy.get("#frequency").click().clear().type("10");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 0.0628 ohms");
  });

  it("tests inductive reactance 3 kH, 1090 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000/");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#unit").select("KILO");
    cy.get("#inductance").click().clear().type("3");
    cy.get("#frequency").click().clear().type("1090");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 2.055e+7 ohms");
  });

  it("tests inductive reactance 23 MH, 311 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000/");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#unit").select("MEGA");
    cy.get("#inductance").click().clear().type("23");
    cy.get("#frequency").click().clear().type("311");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 4.494e+10 ohms");
  });

  it("tests capacitive reactance 1 F, 1 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000/");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#calculationType").select("F");
    cy.get("#inductance").click().clear().type("1");
    cy.get("#frequency").click().clear().type("1");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 0.1592 ohms");
  });

  it("tests capacitive reactance 1 pF, 1 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000/");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#calculationType").select("F");
    cy.get("#unit").select("PICO");
    cy.get("#inductance").click().clear().type("1");
    cy.get("#frequency").click().clear().type("1");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 1.592e+11 ohms");
  });

  it("tests capacitive reactance 1 nF, 1 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000/");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#calculationType").select("F");
    cy.get("#unit").select("NANO");
    cy.get("#inductance").click().clear().type("1");
    cy.get("#frequency").click().clear().type("1");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 1.592e+8 ohms");
  });

  it("tests capacitive reactance 1 uF, 1 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000/");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#calculationType").select("F");
    cy.get("#unit").select("MICRO");
    cy.get("#inductance").click().clear().type("1");
    cy.get("#frequency").click().clear().type("1");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 1.592e+5 ohms");
  });

  it("tests capacitive reactance 1 mF, 1 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000/");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#calculationType").select("F");
    cy.get("#unit").select("MILI");
    cy.get("#inductance").click().clear().type("1");
    cy.get("#frequency").click().clear().type("1");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 159.1549 ohms");
  });

  it("tests capacitive reactance 1 pF, 1 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000/");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#calculationType").select("F");
    cy.get("#unit").select("KILO");
    cy.get("#inductance").click().clear().type("1");
    cy.get("#frequency").click().clear().type("1");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 1.592e-4 ohms");
  });

  it("tests capacitive reactance 1 MF, 1 Hz", () => {
    cy.viewport(1316, 1007);
    cy.visit("http://localhost:3000/");
    cy.get("#questionsDropdownLink").click();
    cy.get("#questionsDropdown a").contains("Impedância").click();
    cy.get("#calculationType").select("F");
    cy.get("#unit").select("MEGA");
    cy.get("#inductance").click().clear().type("1");
    cy.get("#frequency").click().clear().type("1");
    cy.get("#calculate").click();

    cy.get("#result").should("have.text", "Reatância (X) = 1.592e-7 ohms");
  });

 });
