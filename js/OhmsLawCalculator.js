class OhmsLawCalculator extends ElectricalUnits {
    constructor() {
        super();
        new LoadChapter("OhmsLawCalculator", this);




    }
    endRequest() {
        this.knownValue1Input = document.getElementById('knownValue1');
        this.unit1Select = document.getElementById('unit1');
        this.knownValue2Input = document.getElementById('knownValue2');
        this.unit2Select = document.getElementById('unit2');
        this.knownValue3Input = document.getElementById('knownValue3');
        this.resultInput = document.getElementById('result');
        this.unit3Select = document.getElementById('unit3');
        this.knownValue4Input = document.getElementById('knownValue4');
        this.unit4Select = document.getElementById('unit4');



        this.calculateButton = document.getElementById('calculateButton');
        this.loadOptions(this.unit1Select, "V");
        this.loadOptions(this.unit2Select, "A");
        this.loadOptions(this.unit3Select, "Ω");
        this.loadOptions(this.unit4Select, "W");



        // Add event listeners
        this.calculateButton.addEventListener('click', () => this.calculate());

    }

    calculate() {
        let knownValue1 = parseFloat(this.knownValue1Input.value);
        const unit1 = this.unitMultipliers[this.unit1Select.value];
        let knownValue2 = parseFloat(this.knownValue2Input.value);
        const unit2 = this.unitMultipliers[this.unit2Select.value];
        let knownValue3 = parseFloat(this.knownValue3Input.value);
        const unit3 = this.unitMultipliers[this.unit3Select.value];

        const unit4 = this.unitMultipliers[this.unit4Select.value];


        let result = 0;

        // Check how many values are populated
        const populatedValues = [knownValue1 , knownValue2 , knownValue3 ].filter(value => !isNaN(value));

        if (populatedValues.length === 3) {
            // Error: All three values are populated
            this.resultInput.innerHTML = "Erro: Apenas pode carregar  2 valores.";
            return;
        } else if (populatedValues.length === 2) {
            this.resultInput.innerHTML = "";
            // Calculate the missing value
            if (isNaN(knownValue1)) {
                // R*I
                knownValue2*=unit2;
                knownValue3*=unit3;

                result = (knownValue2 * knownValue3) / unit1;

                this.knownValue1Input.value = result;
                knownValue1 = parseFloat(this.knownValue1Input.value);

                
               


               
            } else if (isNaN(knownValue2)) {
                knownValue1*=unit1;
                knownValue3*=unit3;
                // U/R
                result = (knownValue1 / knownValue3) / unit2;

                this.knownValue2Input.value = result;

            } else {
                // U/I
                knownValue2*=unit2;
                knownValue1*=unit1;
                result = (knownValue1 / knownValue2) / unit3;

                this.knownValue3Input.value = result;

            }
            this.knownValue4Input.innerHTML=(knownValue1 * knownValue2)/unit4;


        } else {
            // Error: Less than two values are populated
            this.resultInput.innerHTML = "Erro: tem de carregar pelo menus 2 valores.";
        }
    }


}
