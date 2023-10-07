class  ReactanceCalculator extends ElectricalUnits {
    constructor() {
        super();
        new LoadChapter("ReactanceCalculator", this);




    }
    endRequest() {
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
        let inductanceText = document.getElementById("inductanceTXT");

        if (calculationType === "F") {
            this.formulaDiv.innerHTML = "Formula: X = 2πfC";
            inductanceText.innerHTML = "Reactancia (F)";


            this.loadOptions(this.unitInput, "F");
        } else if (calculationType === "H") {
            inductanceText.innerHTML = "Inductacia (H)";
            this.formulaDiv.innerHTML = "Formula:X   = 1/ (2πfL)";
            this.loadOptions(this.unitInput, "H");
        } else {
            this.formulaDiv.innerHTML = "";
        }
    }

    calculate() {

        const calculationType = this.calculationType.value;
        const inductance = parseFloat(this.inductanceInput.value);
        const unitValue = this.unitMultipliers[this.unitInput.value];
        const frequency = parseFloat(this.frequencyInput.value);

        if (isNaN(inductance) || isNaN(unitValue) || isNaN(frequency)) {
            this.resultDiv.innerHTML = "Please enter valid values.";
            return;
        }

        if (calculationType === "F") {
            const reactance = 2 * Math.PI * frequency * inductance * unitValue;
            this.resultDiv.innerHTML = `Reactancia (X) = ${reactance} ohms`;
        } else if (calculationType === "H") {
            const inductanceResult = 1 / (2 * Math.PI * frequency * inductance * unitValue);
            this.resultDiv.innerHTML = `Reactancia (X) = ${inductanceResult} ohms`;
        }
    }
}