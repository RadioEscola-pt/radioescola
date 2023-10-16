class ElectricalUnits {


    constructor() {
        this.unitMultipliers = {
            'MEGA': 1e6,
            'KILO': 1e3,
            'NONE': 1,
            'MILI': 1e-3,
            'MICRO': 1e-6,
            'NANO': 1e-9, // Adding Nano
            'PICO': 1e-12,
        };
    }

    loadOptions(selectElement, unit) {
        const options = [
            { value: "PICO", text: "Pico (p%s)" },
            { value: "NANO", text: "Nano (n%s)" },
            { value: "MICRO", text: "Micro (µ%s)" },
            { value: "MILI", text: "Mili (m%s)" },
            { value: "KILO", text: "Kilo (k%s)" },
            { value: "MEGA", text: "Mega (M%s)" },
            { value: "NONE", text: "%s" }
        ];

        // Clear existing options
        selectElement.innerHTML = '';

        // Use a for loop to iterate through options
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.text = option.text.replace("%s", unit);


            if (optionElement.text === unit) {
                
                optionElement.selected = true; // Set this option as selected
            } 

            selectElement.appendChild(optionElement);
        }
    }
    formatNumberWithExponent(number) {
        if (Math.abs(number) < 1e-3 ) {
            const absNumber = Math.abs(number);
            const exponent = Math.floor(Math.log10(absNumber));
            const mantissa = (absNumber / Math.pow(10, exponent)).toFixed(3);
            return mantissa + "e" + (exponent >= 0 ? '+' : '') + exponent;
        } else {
          return number;
        }
      }
}