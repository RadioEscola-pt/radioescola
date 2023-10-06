class InductorCalculator {
    constructor() {
        new LoadChapter("InductorCalculator", this);

       

        
    }
    endRequest()
    {
        this.calculateButton = document.getElementById("calculateButton");
        this.calculateButton.addEventListener("click", this.calculate.bind(this));

        this.calculationType = document.getElementById("calculationType");
        this.inductanceInput = document.getElementById("inductance");
        this.unitInput = document.getElementById("unit");
        this.frequencyInput = document.getElementById("frequency");
        this.formulaDiv = document.getElementById("formula");
        this.resultDiv = document.getElementById("result");

        // Add onchange event listener to the calculationType dropdown
        this.calculationType.addEventListener("change", this.showFormula.bind(this));

        this.showFormula();
    }

    showFormula() {
        const calculationType = this.calculationType.value;
        if (calculationType === "reactance") {
            this.formulaDiv.innerHTML = "Formula: X = 2πfL";
        } else if (calculationType === "inductance") {
            this.formulaDiv.innerHTML = "Formula: L = X / (2πf)";
        } else {
            this.formulaDiv.innerHTML = "";
        }
    }

    calculate() {
        this.showFormula();
        const calculationType = this.calculationType.value;
        const inductance = parseFloat(this.inductanceInput.value);
        const unitValue = parseFloat(this.unitInput.value);
        const frequency = parseFloat(this.frequencyInput.value);

        if (isNaN(inductance) || isNaN(unitValue) || isNaN(frequency)) {
            this.resultDiv.innerHTML = "Please enter valid values.";
            return;
        }

        if (calculationType === "reactance") {
            const reactance = 2 * Math.PI * frequency * inductance * unitValue;
            this.resultDiv.innerHTML = `Reactance (X) = ${reactance} ohms`;
        } else if (calculationType === "inductance") {
            const inductanceResult = inductance / (2 * Math.PI * frequency * unitValue);
            this.resultDiv.innerHTML = `Inductance (L) = ${inductanceResult} H`;
        }
    }
}