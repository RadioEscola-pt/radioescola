
class GainCalculator  extends ElectricalUnits {

    constructor() {
        super();

        new Popup("GainCalculator", this);
    }
    /**
     * @brief  This function is called when the parent ajax callback is completed. This works asynchronously.
     */
    endRequest() {
        
        this.result = document.getElementById('result');
  
        this.powerTable = document.getElementById('powerTable');
        this.currentTable = document.getElementById('currentTable');
        this.voltageTable = document.getElementById('voltageTable');
        this.power1 = document.getElementById('power1');
        this.power2 = document.getElementById('power2');
        this.current1 = document.getElementById('current1');
        this.current2 = document.getElementById('current2');
        this.voltage1 = document.getElementById('voltage1');
        this.voltage2 = document.getElementById('voltage2');
        this.calculateButton = document.getElementById('calculateButton');
        this.measurementType = document.getElementById('measurementType');

        this.voltage1Units=document.getElementById('voltage1Unit');
        this.voltage2Units=document.getElementById('voltage2Unit');
        this.current1Unit=document.getElementById('current1Unit');
        this.current2Unit=document.getElementById('current2Unit');
        this.power1Unit=document.getElementById('Power1Unit');
        this.power2Unit=document.getElementById('Power2Unit');
        this.loadOptions(this.voltage1Units, "V");
        this.loadOptions(this.voltage2Units, "V");
        this.loadOptions(this.current1Unit, "A");
        this.loadOptions(this.current2Unit, "A");
        this.loadOptions(this.power1Unit, "W");
        this.loadOptions(this.power2Unit, "W");
        this.setupEventListeners();


    }

    setupEventListeners() {
        this.calculateButton.addEventListener('click', () => {
            this.calculateGain();
        });

        this.measurementType.addEventListener('change', () => {
            this.showRelevantTable();
        });

        

    }

    calculateGain() {
        const selectedMagnitude = this.getSelectedMagnitude();

        const value1 = parseFloat(this[selectedMagnitude + '1'].value);
        const value2 = parseFloat(this[selectedMagnitude + '2'].value);

        if (!isNaN(value1) && !isNaN(value2)) {
            const gain = this.calculateGainFromValues(selectedMagnitude, value1, value2);
            this.result.textContent = `Ganho em dB: ${gain.toFixed(2)} dB`;
        } else {
            alert('Por favor, insira valores válidos em todos os campos.');
        }
    }

    calculateGainFromValues(magnitude, value1, value2) {
        let gain = 0;

        if (magnitude === 'power') {
            const power1UnitBase = this.unitMultipliers[this.power1Unit.value];
            const power2UnitBase = this.unitMultipliers[this.power2Unit.value];
            
            gain = 10 * Math.log10((value2*power2UnitBase) / (value1*power1UnitBase));
        } else if (magnitude === 'current')
        {
            const current1UnitBase = this.unitMultipliers[this.current1Unit.value];
            const current2UnitBase = this.unitMultipliers[this.current2Unit.value];
            gain = 20 * Math.log10((value2*current2UnitBase) / (current2UnitBase*value1));
        }
        else if(magnitude === 'voltage') {
            const voltage1UnitBase = this.unitMultipliers[this.voltage1Units.value];
            const voltage2UnitBase = this.unitMultipliers[this.voltage2Units.value];
            gain = 20 * Math.log10((value2*voltage2UnitBase) / (value1*voltage2UnitBase));
        }

        return gain;
    }

    showRelevantTable() {
        const selectedMagnitude = this.getSelectedMagnitude();
        this.powerTable.style.display = 'none';
        this.currentTable.style.display = 'none';
        this.voltageTable.style.display = 'none';
        this[selectedMagnitude + 'Table'].style.display = 'block';
    }

    getSelectedMagnitude() {
        const dropdown = document.getElementById('measurementType');
        return dropdown.value;
    }
}

