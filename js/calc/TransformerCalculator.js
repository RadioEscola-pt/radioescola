class TransformerCalculator extends ElectricalUnits {

    constructor() {
        super();

        new Popup("calculator/TransformerCalculator", this);
        //this.classStyle = "w-52 rounded shadow-sm border-gray-400 focus:border-slate-800 focus:ring focus:ring-slate-200 focus:ring-opacity-50 dark:bg-slate-600";
    }
    /**
     * @brief  This function is called when the parent ajax callback is completed. This works asynchronously.
     */
    endRequest() {
        this.primaryVoltageInput = document.getElementById("primaryVoltage");
        this.secondaryVoltageInput = document.getElementById("secondaryVoltage");
        this.primaryCurrentInput = document.getElementById("primaryCurrent");
        this.secondaryCurrentInput = document.getElementById("secondaryCurrent");
        this.turnsPrimaryInput = document.getElementById("turnsPrimary");
        this.turnsSecondaryInput = document.getElementById("turnsSecondary");
        this.result= document.getElementById("calculatorResult");


        // New variables for select boxes
        this.primaryVoltageSelect = document.getElementById("primaryVoltageSelect");
        this.secondaryVoltageSelect = document.getElementById("secondaryVoltageSelect");
        this.primaryCurrentSelect = document.getElementById("primaryCurrentSelect");
        this.secondaryCurrentSelect = document.getElementById("secondaryCurrentSelect");

        this.loadOptions(this.primaryVoltageSelect, "V");
        this.loadOptions(this.secondaryVoltageSelect, "V");
        this.loadOptions(this.primaryCurrentSelect, "A");
        this.loadOptions(this.secondaryCurrentSelect, "A");

        this.calculateButton = document.getElementById("calculateButton");
        this.calculateButton.addEventListener("click", () => this.calculateValues());
    }
    /**
     * @brief calculate the values of the transformer based on the values given by the user
     */
    calculateValues() {
        let ratio;

        let primaryVoltage = parseFloat(this.primaryVoltageInput.value);
        let secondaryVoltage = parseFloat(this.secondaryVoltageInput.value);
        let primaryCurrent = parseFloat(this.primaryCurrentInput.value);
        let secondaryCurrent = parseFloat(this.secondaryCurrentInput.value);
        let turnsPrimary = parseFloat(this.turnsPrimaryInput.value);
        let turnsSecondary = parseFloat(this.turnsSecondaryInput.value);



        const primaryVoltageRatio = this.unitMultipliers[this.primaryVoltageSelect.value];
        const secondaryVoltageRatio = this.unitMultipliers[this.secondaryVoltageSelect.value];
        const primaryCurrentRatio = this.unitMultipliers[this.primaryCurrentSelect.value];
        const secondaryCurrentRatio = this.unitMultipliers[this.secondaryCurrentSelect.value];


        let voltageRatio = null;
        let turnsRatio = null;
        let currentRatio = null;

        if (!isNaN(primaryVoltage) && !isNaN(secondaryVoltage)) {
            primaryVoltage *= primaryVoltageRatio;
            secondaryVoltage *= secondaryVoltageRatio;
            voltageRatio = primaryVoltage / secondaryVoltage;

        }
        if (!isNaN(turnsPrimary) && !isNaN(turnsSecondary)) {

            turnsRatio = turnsPrimary / turnsSecondary;

        }

        if (!isNaN(primaryCurrent) && !isNaN(secondaryCurrent)) {
            primaryCurrent *= primaryCurrentRatio;
            secondaryCurrent *= secondaryCurrentRatio;
            currentRatio = secondaryCurrent/primaryCurrent ;

        }

        this.result.classList.remove("text-red-600", "dark:text-red-400", "bg-red-50", "dark:bg-red-950");

        const showError = (msg) => {
            this.result.classList.add("text-red-600", "dark:text-red-400", "bg-red-50", "dark:bg-red-950");
            this.result.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>${msg}</span>`;
        };

        if (voltageRatio === null && turnsRatio === null && currentRatio === null) {
            showError("Introduza pelo menos um par de valores (tensão, corrente ou voltas) no primário e secundário.");
            return;
        }
        if (voltageRatio != null && turnsRatio != null ){
            if (voltageRatio != turnsRatio ) {
                showError("O rácio da bobinagem e da tensão são diferentes.");
                return;
            }
        }
        if (voltageRatio != null && currentRatio != null ){
            if (voltageRatio != currentRatio ) {
                showError("O rácio da voltagem e da corrente são diferentes.");
                return;
            }
        }
        if (turnsRatio != null && currentRatio != null ){
            if (turnsRatio != currentRatio ) {
                showError("O rácio da bobinagem e da corrente são diferentes.");
                return;
            }
        }

        

        if (voltageRatio != null) {
            this.turnsCheck(turnsPrimary, turnsSecondary, voltageRatio)
            this.currentCheck(primaryCurrent, secondaryCurrent, voltageRatio);

        } 
        if (turnsRatio != null ) {

            this.voltageCheck(primaryVoltage, secondaryVoltage, turnsRatio);

            this.currentCheck(primaryCurrent, secondaryCurrent, turnsRatio);


        } 
        if ( currentRatio != null) {
            this.voltageCheck(primaryVoltage, secondaryVoltage, currentRatio);

            this.turnsCheck(turnsPrimary, turnsSecondary, currentRatio);

        } 


    }
    /**
     * @brief calculate the number of turns in primary or secondary based on the ratio given that one of the values is known and the other is not
     *      and autopopulate the field that is unknown
     * @param {*} turnsPrimary  number of turns in primary null if unknown
     * @param {*} turnsSecondary  number of turns in secondary null if unknown
     * @param {*} ratio rato between primary and secondary 
     */
    turnsCheck(turnsPrimary, turnsSecondary, ratio)
    {


        if (!isNaN(turnsPrimary) && isNaN(turnsSecondary)) {
  
            turnsSecondary = turnsPrimary / ratio;

            this.turnsSecondaryInput.value = this.formatNumberWithExponent(turnsSecondary);

        }
        if (isNaN(turnsPrimary) && !isNaN(turnsSecondary)) {
            turnsPrimary = turnsSecondary * ratio;

            this.turnsPrimaryInput.value = this.formatNumberWithExponent(turnsPrimary);


        }
    }
    /**
     * @brief calculate the current in primary or secondary based on the ratio given that one of the values is known and the other is not 
     *        and autopopulate the field that is unknown
     * @param {*} primaryCurrent   current in primary null if unknown
     * @param {*} secondaryCurrent  current in secondary null if unknown
     * @param {*} Ratio     ratio between primary and secondary
     */
    currentCheck(primaryCurrent, secondaryCurrent, ratio)
    {
        const primaryCurrentRatio = this.unitMultipliers[this.primaryCurrentSelect.value];
        const secondaryCurrentRatio = this.unitMultipliers[this.secondaryCurrentSelect.value];

        if (isNaN(primaryCurrent) && !isNaN(secondaryCurrent)) {
            primaryCurrent = secondaryCurrent / ratio;

            this.primaryCurrentInput.value = this.formatNumberWithExponent(primaryCurrent/primaryCurrentRatio);


        }
        if (!isNaN(primaryCurrent) && isNaN(secondaryCurrent)) {
            secondaryCurrent = primaryCurrent * ratio;

            this.secondaryCurrentInput.value = this.formatNumberWithExponent(secondaryCurrent/secondaryCurrentRatio);
        }
    }
    /**
     * @brief calculate the voltage in primary or secondary based on the ratio given that one of the values is known and the other is not
     *        and autopopulate the field that is unknown
     * @param {*} primaryVoltage    voltage in primary null if unknown
     * @param {*} secondaryVoltage  voltage in secondary null if unknown
     * @param {*} Ratio        ratio between primary and secondary
     */
    voltageCheck(primaryVoltage, secondaryVoltage, ratio)
    {
        const primaryVoltageRatio = this.unitMultipliers[this.primaryVoltageSelect.value];
        const secondaryVoltageRatio = this.unitMultipliers[this.secondaryVoltageSelect.value];

        if (isNaN(primaryVoltage) && !isNaN(secondaryVoltage)) {
            primaryVoltage = secondaryVoltage * ratio;

            this.primaryVoltageInput.value = this.formatNumberWithExponent(primaryVoltage/primaryVoltageRatio   );
        }
        if (!isNaN(primaryVoltage) && isNaN(secondaryVoltage)) {
            secondaryVoltage = primaryVoltage / ratio;

            this.secondaryVoltageInput.value = this.formatNumberWithExponent(secondaryVoltage/  secondaryVoltageRatio);
        }
    }
}