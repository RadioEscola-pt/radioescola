class ElectricalUnits{
    

    constructor()
    {
        this.unitMultipliers = {
            'MEGA': 1e6,
            'KILO': 1e3,
            'NONE': 1,
            'MILI': 1e-3,
            'MICRO': 1e-6,
            'PICO': 1e-12,
        };

    }


    loadOptions(selectElement) {


        const options = [
            { value: "PICO", text: "Pico (p)" },
            { value: "NANO", text: "Nano (n)" },
            { value: "MILI", text: "Mili (m)" },
            { value: "MICRO", text: "Micro (µ)" },
            { value: "KILO", text: "Kilo (k)" },
            { value: "MEGA", text: "Mega (M)" },
            { value: "NONE", text: "None" }
        ];

        // Clear existing options
        selectElement.innerHTML = '';

        // Add new options
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.text = option.text;
            selectElement.appendChild(optionElement);
        });
    }
}