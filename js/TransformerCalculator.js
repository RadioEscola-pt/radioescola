class TransformerCalculator extends ElectricalUnits {

    constructor() {
        super();

        new Popup("TransformerCalculator", this);
        this.classStyle="w-52 rounded shadow-sm border-gray-400 focus:border-slate-800 focus:ring focus:ring-slate-200 focus:ring-opacity-50 dark:bg-slate-600";
    }
    endRequest()
    {
        this.primaryVoltageInput = document.getElementById("primaryVoltage");
        this.secondaryVoltageInput = document.getElementById("secondaryVoltage");
        this.primaryCurrentInput = document.getElementById("primaryCurrent");
        this.secondaryCurrentInput = document.getElementById("secondaryCurrent");
        this.turnsPrimaryInput = document.getElementById("turnsPrimary");
        this.turnsSecondaryInput = document.getElementById("turnsSecondary");
        
        // New variables for select boxes
        this.primaryVoltageSelect = document.getElementById("primaryVoltageSelect");
        this.secondaryVoltageSelect = document.getElementById("secondaryVoltageSelect");
        this.primaryCurrentSelect = document.getElementById("primaryCurrentSelect");
        this.secondaryCurrentSelect = document.getElementById("secondaryCurrentSelect");


        this.primaryVoltageInput.className=this.classStyle;
        this.secondaryVoltageInput.className=this.classStyle;
        this.primaryCurrentInput.className=this.classStyle;
        this.secondaryCurrentInput.className=this.classStyle;
        this.turnsPrimaryInput.className=this.classStyle;
        this.turnsPrimaryInput.className=this.classStyle;
        this.turnsSecondaryInput.className=this.classStyle;

        this.primaryVoltageSelect.className=this.classStyle;
        this.secondaryVoltageSelect.className=this.classStyle;
        this.primaryCurrentSelect.className=this.classStyle;
        this.secondaryCurrentSelect.className=this.classStyle;


        this.loadOptions(this.primaryVoltageSelect, "V");
        this.loadOptions(this.secondaryVoltageSelect, "V");
        this.loadOptions(this.primaryCurrentSelect, "A");
        this.loadOptions(this.secondaryCurrentSelect, "A");

               


        this.calculateButton = document.getElementById("calculateButton");
        this.calculateButton.addEventListener("click", () => this.calculateValues());
    }

    calculateValues() {

        const primaryVoltage = parseFloat(this.primaryVoltageInput.value);
            
        const secondaryVoltage = parseFloat(this.secondaryVoltageInput.value);
        const primaryCurrent = parseFloat(this.primaryCurrentInput.value);
        const secondaryCurrent = parseFloat(this.secondaryCurrentInput.value);
        const turnsPrimary = parseFloat(this.turnsPrimaryInput.value);
        const turnsSecondary = parseFloat(this.turnsSecondaryInput.value);

        if (!isNaN(primaryVoltage) && !isNaN(secondaryVoltage) && !isNaN(primaryCurrent) && !isNaN(secondaryCurrent)) {
            const turnsPrimaryResult = primaryVoltage / secondaryVoltage;
            const turnsSecondaryResult = secondaryVoltage / primaryVoltage;

            this.turnsPrimaryInput.value = turnsPrimaryResult.toFixed(2);
            this.turnsSecondaryInput.value = turnsSecondaryResult.toFixed(2);
        } else if (!isNaN(primaryVoltage) && !isNaN(secondaryVoltage) && !isNaN(turnsPrimary) && isNaN(turnsSecondary)) {
            const turnsSecondaryResult = primaryVoltage / turnsPrimary;
            this.turnsSecondaryInput.value = turnsSecondaryResult.toFixed(2);
        } else if (!isNaN(primaryVoltage) && !isNaN(secondaryVoltage) && !isNaN(turnsSecondary) && isNaN(turnsPrimary)) {
            const turnsPrimaryResult = secondaryVoltage / turnsSecondary;
            this.turnsPrimaryInput.value = turnsPrimaryResult.toFixed(2);
        } else {
            alert("Please provide valid input to calculate missing values.");
        }
    }
}