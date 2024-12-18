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

        // Check how many values are populated
        const populatedValues = [voltage , current , resistance ].filter(value => !isNaN(value));

        if (populatedValues.length === 3) {
            // Error: All three values are populated
            this.resultInput.innerHTML = "Erro: Apenas pode introduzir 2 valores.";
            return;
        } else if (populatedValues.length === 2) {
            this.resultInput.innerHTML = "";
            // Calculate the missing value
            if (isNaN(voltage)) {
                // R*I
                current*=currentRatio;
                resistance*=resistanceRatio;

                voltage = ((current * resistance) / voltageRatio);
                result=formatNumberWithExponent(voltage);

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
            // Error: Less than two values are populated
            this.resultInput.innerHTML = "Erro: tem de introduzir pelo menos 2 valores.";
        }
    }


}
