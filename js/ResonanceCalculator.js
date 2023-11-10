class ResonanceCalculator extends ElectricalUnits {
  constructor() {
    super();
    new Popup("ResonanceCalculator", this);
  }
  endRequest() {
    const calculateButton = document.getElementById("calculate");
    calculateButton.addEventListener(
      "click",
      this.calculateResonance.bind(this)
    );
    this.inductanceUnitInput = document.getElementById("inductanceUnit");
    this.capacitanceUnitInput = document.getElementById("capacitanceUnit");
    this.hertzUnitInput = document.getElementById("hertzUnit");
    this.loadOptions(this.inductanceUnitInput, "F");
    this.loadOptions(this.capacitanceUnitInput, "H");
  }

  calculateResonance() {
    const inductance = parseFloat(document.getElementById("inductance").value);
    const capacitance = parseFloat(
      document.getElementById("capacitance").value
    );

    const unitInduValue = this.unitMultipliers[this.inductanceUnitInput.value];
    const unitCapValue = this.unitMultipliers[this.capacitanceUnitInput.value];

    if (!isNaN(inductance) && !isNaN(capacitance)) {
      let resonanceFrequency =
        1 /
        (2 *
          Math.PI *
          Math.sqrt(inductance * unitInduValue * capacitance * unitCapValue));

      document.getElementById(
        "result"
      ).textContent = `Frequência de ressonância: ${this.formatNumberWithExponent(
        resonanceFrequency
      )} Hz.`;
    } else {
      document.getElementById("result").textContent =
        "Por favor, insira valores válidos para L e C.";
    }
  }
}
