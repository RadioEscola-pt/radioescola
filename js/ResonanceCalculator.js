class ResonanceCalculator extends ElectricalUnits{
    constructor() {
        super();
        new Popup("ResonanceCalculator", this);




    }
    endRequest() {
        const calculateButton = document.querySelector("input[type=button]");
        calculateButton.addEventListener("click", this.calculateResonance);
        this.inductanceUnitInput = document.getElementById("inductanceUnit");
        this.capacitanceUnitInput = document.getElementById("capacitanceUnit");
        this.loadOptions(this.inductanceUnitInput, "F");
        this.loadOptions(this.capacitanceUnitInput, "H");
    }

    calculateResonance() {
        const inductance = parseFloat(document.getElementById("inductance").value);
        const capacitance = parseFloat(document.getElementById("capacitance").value);
        const unitInduValue = this.unitMultipliers[this.inductanceUnitInput.value];
        const unitCapValue = this.unitMultipliers[this.unitCapValue.value];


        if (!isNaN(inductance) && !isNaN(capacitance)) {
            const resonanceFrequency = 1 / (2 * Math.PI * Math.sqrt(inductance*unitInduValue * capacitance*unitCapValue));
            document.getElementById("result").textContent = `A frequência de ressonância é ${resonanceFrequency.toFixed(2)} Hz.`;
        } else {
            document.getElementById("result").textContent = "Por favor, insira valores válidos para L e C.";
        }
    }
}