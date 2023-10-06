class OhmsLawCalculator {
    constructor() {
        new LoadChapter("OhmsLawCalculator", this);

       

        
    }
    endRequest()
    {
        this.knownValue1Input = document.getElementById('knownValue1');
        this.unit1Select = document.getElementById('unit1');
        this.knownValue2Input = document.getElementById('knownValue2');
        this.unit2Select = document.getElementById('unit2');
        this.calculationTypeSelect = document.getElementById('calculationType');
        this.resultInput = document.getElementById('result');
        this.resultUnitSelect = document.getElementById('resultUnit');
        this.missingUnitsUnit1Div = document.getElementById('missingUnitsUnit1');
        this.missingUnitsUnit2Div = document.getElementById('missingUnitsUnit2');
        this.calculateButton = document.getElementById('calculateButton');

        // Add event listeners
        this.calculateButton.addEventListener('click', () => this.calculate());
        this.calculationTypeSelect.addEventListener('change', () => this.updateMissingUnits());

        // Initial calculation and missing units update

        this.updateMissingUnits();
    }

    calculate() {
        const knownValue1 = parseFloat(this.knownValue1Input.value);
        const unit1 = this.unit1Select.value;
        const knownValue2 = parseFloat(this.knownValue2Input.value);
        const unit2 = this.unit2Select.value;
        const calculationType = this.calculationTypeSelect.value;
        const resultUnit = this.resultUnitSelect.value;

        let result = 0;

        // Define unit multipliers
        const unitMultipliers = {
            'MEGA': 1e6,
            'Kilo': 1e3,
            'NONE': 1,
            'MILI': 1e-3,
            'micro': 1e-6,
            'pic': 1e-12,
        };

        // Convert known values to base units (NONE)
        const baseValue1 = knownValue1 * unitMultipliers[unit1];
        const baseValue2 = knownValue2 * unitMultipliers[unit2];

        if (!isNaN(knownValue1) && !isNaN(knownValue2)) {
            switch (calculationType) {
                case 'V' :
                    // Calculate Ohm's Law: V = IR
                    result = baseValue1 * baseValue2;
                    break;
                case 'A':
                    // Calculate Ohm's Law: I = V/R
                    result = baseValue1 / baseValue2;
                    break;
                case 'Ω':
                    // Calculate Ohm's Law: R = V/I
                    result = baseValue1 / baseValue2;
                    break;
                default:
                    result = "Invalid unit for the calculation type.";
                    break;
            }
        } else {
            result = "Please enter valid numeric values for Known Value 1 and Known Value 2.";
        }

        // Apply unit conversion for the result based on resultUnit
        result /= unitMultipliers[resultUnit];

        this.resultInput.value = result;
    }

    updateMissingUnits() {
        const calculationType = this.calculationTypeSelect.value;

        if (calculationType === 'Ω') {
            this.missingUnitsUnit1Div.textContent = `V (Volts)`;
            this.missingUnitsUnit2Div.textContent = `A (Amperes)`;
        } else if (calculationType === 'A') {
            this.missingUnitsUnit1Div.textContent = `V (Volts)`;
            this.missingUnitsUnit2Div.textContent = `Ω (Ohms)`;
        } else if (calculationType === 'V') {
            this.missingUnitsUnit1Div.textContent = `Ω (Ohms)`;
            this.missingUnitsUnit2Div.textContent = `A (Amperes)`;
        } else {
            this.missingUnitsUnit1Div.textContent = '';
            this.missingUnitsUnit2Div.textContent = '';
        }
    }
}
