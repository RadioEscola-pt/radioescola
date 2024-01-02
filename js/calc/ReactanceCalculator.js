class  ReactanceCalculator extends ElectricalUnits {
    constructor() {
        super();
        new Popup("calculator/ReactanceCalculator", this);




    }
    endRequest() {
        this.calculateButton = document.getElementById("calculate");
        this.calculateButton.addEventListener("click", this.calculate.bind(this));

        this.calculationType = document.getElementById("calculationType");
        this.inductanceInput = document.getElementById("inductance");
        this.unitInput = document.getElementById("unit");
        this.frequencyInput = document.getElementById("frequency");
        this.frequencyUnit = document.getElementById("frequencyUnit");
        this.formulaDiv = document.getElementById("formula");
        this.resultDiv = document.getElementById("result");


        // Add onchange event listener to the calculationType dropdown
        this.calculationType.addEventListener("change", this.showFormula.bind(this));

        this.showFormula();

    }

    showFormula() {
        const calculationType = this.calculationType.value;
        let inductanceText = document.getElementById("inductanceTXT");

        this.loadOptions(this.frequencyUnit, "Hz");

        if (calculationType === "F") {
            this.formulaDiv.innerHTML = "X = 1/(2πfC)";
            inductanceText.innerHTML = "Capacitância";
            this.loadOptions(this.unitInput, "F");
        } else if (calculationType === "H") {
            inductanceText.innerHTML = "Indutância";
            this.formulaDiv.innerHTML ="X = 2πfL"; 
            this.loadOptions(this.unitInput, "H");
        } else {
            this.formulaDiv.innerHTML = "";
        }
    }

    calculate() {

        const calculationType = this.calculationType.value;
        const inductance = parseFloat(this.inductanceInput.value);
        const unitValue = this.unitMultipliers[this.unitInput.value];
        const frequencyValue = this.unitMultipliers[this.frequencyUnit.value];
        const frequency = parseFloat(this.frequencyInput.value);

        if (isNaN(inductance) || isNaN(unitValue) || isNaN(frequency)) {
            this.resultDiv.innerHTML = "Por favor introduza valores corretos.";
            return;
        }

        if (calculationType === "F") {
            const reactance = 1 / (2 * Math.PI * frequency * frequencyValue * inductance * unitValue); 
            let result=this.formatNumberWithExponent(reactance);
            this.resultDiv.innerHTML = "Reatância (X) = "+result+" ohms";
        } else if (calculationType === "H") {
            const inductanceResult =2 * Math.PI * frequency * frequencyValue * inductance * unitValue;
            let result=this.formatNumberWithExponent(inductanceResult);
            this.resultDiv.innerHTML = "Reatância (X) = "+result+" ohms";
        }
    }
}