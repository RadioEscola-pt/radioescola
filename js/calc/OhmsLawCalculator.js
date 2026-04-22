class OhmsLawCalculator extends ElectricalUnits {
    constructor() {
        super();
        new Popup("calculator/OhmsLawCalculator", this);




    }
    endRequest() {
        this.voltageInput = document.getElementById('knownValue1');
        this.voltageUnit = document.getElementById('unit1');
        this.currentValue = document.getElementById('knownValue2');
        this.currentUnit = document.getElementById('unit2');
        this.ressistanceInput = document.getElementById('knownValue3');
        this.resistanceUnit = document.getElementById('unit3');
        this.resultInput = document.getElementById('result');
        
        this.powerInput = document.getElementById('knownValue4');
        this.powerUnit = document.getElementById('unit4');



        this.calculateButton = document.getElementById('calculateButton');
        this.loadOptions(this.voltageUnit, "V");
        this.loadOptions(this.currentUnit, "A");
        this.loadOptions(this.resistanceUnit, "Ω");
        this.loadOptions(this.powerUnit, "W");



        // Add event listeners
        this.calculateButton.addEventListener('click', () => this.calculate());

    }

    calculate() {
        let voltage = parseFloat(this.voltageInput.value);
        const voltageRatio = this.unitMultipliers[this.voltageUnit.value];
        let current = parseFloat(this.currentValue.value);
        const currentRatio = this.unitMultipliers[this.currentUnit.value];
        let resistance = parseFloat(this.ressistanceInput.value);
        const resistanceRatio = this.unitMultipliers[this.resistanceUnit.value];

        const powerRatio = this.unitMultipliers[this.powerUnit.value];


        let result = 0;

        const showError = (msg) => {
            this.resultInput.classList.remove("hidden");
            this.resultInput.classList.add("flex", "items-center", "px-4", "py-3", "rounded", "bg-red-50", "dark:bg-red-950", "text-red-600", "dark:text-red-400", "text-sm", "font-medium");
            this.resultInput.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>${msg}</span>`;
        };
        const clearError = () => {
            this.resultInput.classList.remove("flex", "items-center", "px-4", "py-3", "rounded", "bg-red-50", "dark:bg-red-950", "text-red-600", "dark:text-red-400", "text-sm", "font-medium");
            this.resultInput.innerHTML = "";
        };

        // Check how many values are populated
        const populatedValues = [voltage , current , resistance ].filter(value => !isNaN(value));

        if (populatedValues.length === 3) {
            showError("Apenas pode introduzir 2 valores. Apague um para calcular os outros.");
            return;
        } else if (populatedValues.length === 2) {
            clearError();
            // Calculate the missing value
            if (isNaN(voltage)) {
                // R*I
                current*=currentRatio;
                resistance*=resistanceRatio;

                voltage = ((current * resistance) / voltageRatio);
                result=this.formatNumberWithExponent(voltage);

                this.voltageInput.value = result;
               

               
            } else if (isNaN(current)) {
                voltage*=voltageRatio;
                resistance*=resistanceRatio;
                // U/R
                current = ((voltage / resistance) / currentRatio);
                result=this.formatNumberWithExponent(resistance);
                this.currentValue.value = result;

            } else {
                // U/I
                current*=currentRatio;
                voltage*=voltageRatio;
                let resistance = ((voltage / current) / resistanceRatio);
                result=this.formatNumberWithExponent(resistance);

                this.ressistanceInput.value = result;

            }
            let power=this.formatNumberWithExponent((voltage * current)/powerRatio);
            this.powerInput.innerHTML=power;


        } else {
            showError("Introduza pelo menos 2 valores para calcular.");
        }
    }


}
