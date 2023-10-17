class LRCBridgeCalculator extends ElectricalUnits {
    constructor() {
        super();
        this.classStyle = "w-52 rounded shadow-sm border-gray-400 focus:border-slate-800 focus:ring focus:ring-slate-200 focus:ring-opacity-50 dark:bg-slate-600";


        new Popup("LRCBridgeCalculator", this);
    }
    endRequest() {
        this.frequencyInput = document.getElementById("frequency");
        this.resistorInput = document.getElementById("resistor");
        this.voltageSourceInput = document.getElementById("voltageSource");
        this.capacitorInput = document.getElementById("capacitor");
        this.coilInput = document.getElementById("coil");

        this.frequencyDropdown = document.getElementById("frequencyDropdown");
        this.resistorDropdown = document.getElementById("resistorDropdown");
        this.voltageSourceDropdown = document.getElementById("voltageSourceDropdown");
        this.capacitorDropdown = document.getElementById("capacitorDropdown");
        this.coilDropdown = document.getElementById("coilDropdown");


        this.resultTotalImpedanceDropdown = document.getElementById("resultTotalImpedanceDropdown");
        this.resultXLDropdown = document.getElementById("resultXLDropdown");
        this.resultXCDropdown = document.getElementById("resultXCDropdown");
        this.resultXRDropdown = document.getElementById("resultXRDropdown");
        this.resultTotalCurrentDropdown = document.getElementById("resultTotalCurrentDropdown");
        this.resultVcDropdown = document.getElementById("resultVcDropdown");
        this.resultVrDropdown = document.getElementById("resultVrDropdown");
        this.resultVLDropdown = document.getElementById("resultVLDropdown");


        this.loadOptions(this.frequencyDropdown, "Hz");
        this.loadOptions(this.resistorDropdown, "Ω");
        this.loadOptions(this.voltageSourceDropdown, "V");
        this.loadOptions(this.capacitorDropdown, "F");
        this.loadOptions(this.coilDropdown, "H");

        this.loadOptions(this.resultXLDropdown, "Ω");
        this.loadOptions(this.resultXCDropdown, "Ω");
        this.loadOptions(this.resultXRDropdown, "Ω");
        this.loadOptions(this.resultTotalCurrentDropdown, "A");
        this.loadOptions(this.resultVcDropdown, "V");
        this.loadOptions(this.resultVrDropdown, "V");
        this.loadOptions(this.resultVLDropdown, "V");
        this.loadOptions(this.resultTotalImpedanceDropdown, "Ω");



      




        this.frequencyInput.className = this.classStyle;
        this.resistorInput.className = this.classStyle;
        this.voltageSourceInput.className = this.classStyle;
        this.capacitorInput.className = this.classStyle;
        this.coilInput.className = this.classStyle;


        this.frequencyDropdown.className = this.classStyle;
        this.resistorDropdown.className = this.classStyle;
        this.voltageSourceDropdown.className = this.classStyle;
        this.capacitorDropdown.className = this.classStyle;
        this.coilDropdown.className = this.classStyle;

        this.resultTotalImpedanceDropdown.className = this.classStyle;
        this.resultXLDropdown.className = this.classStyle;
        this.resultXCDropdown.className = this.classStyle;
        this.resultXRDropdown.className = this.classStyle;
        this.resultTotalCurrentDropdown.className = this.classStyle;
        this.resultVcDropdown.className = this.classStyle;
        this.resultVrDropdown.className = this.classStyle;
        this.resultVLDropdown.className = this.classStyle;

        



        this.calculateButton = document.getElementById("calculateButton");
        this.calculateButton.addEventListener("click", () => this.calculateValues());



    }

    calculateValues() {

        let frequency = parseFloat(this.frequencyInput.value);
        const frequencyUnit = this.unitMultipliers[this.frequencyDropdown.value];
        frequency = frequency * frequencyUnit;

        let resistor = parseFloat(this.resistorInput.value);
        const resistorUnit = this.unitMultipliers[this.resistorDropdown.value];
        resistor = resistor * resistorUnit;

        let voltageSource = parseFloat(this.voltageSourceInput.value);
        const voltageSourceUnit = this.unitMultipliers[this.voltageSourceDropdown.value];
        voltageSource = voltageSource * voltageSourceUnit;

        let capacitor = parseFloat(this.capacitorInput.value);
        const capacitorUnit = this.unitMultipliers[this.capacitorDropdown.value];
        capacitor = capacitor * capacitorUnit;

        let coil = parseFloat(this.coilInput.value);
        const coilUnit = this.unitMultipliers[this.coilDropdown.value];
        coil = coil * coilUnit;
        


        const XL = 2 * Math.PI * frequency * coil; // Inductive Reactance (XL)
        const xlUnit = this.unitMultipliers[this.resultXLDropdown.value];
        const XLConverted = XL / xlUnit;

        const XC = 1 / (2 * Math.PI * frequency * capacitor); // Capacitive Reactance (XC)
        const xcUnit = this.unitMultipliers[this.resultXCDropdown.value];
        const XCConverted = XC / xcUnit;

        const XR = resistor; // Resistive Impedance (XR)
        const xrUnit = this.unitMultipliers[this.resultXRDropdown.value];
        const XRConverted = XR / xrUnit;

        const Z = Math.sqrt((XRConverted - XCConverted) ** 2 + (XLConverted) ** 2); // Total Impedance (Z)
        const zUnit = this.unitMultipliers[this.resultTotalImpedanceDropdown.value];
        const ZConverted = Z / zUnit;

        const totalCurrent = voltageSource / Z; // Total Current (I)
        const iUnit = this.unitMultipliers[this.resultTotalCurrentDropdown.value];
        const totalCurrentConverted = totalCurrent / iUnit;


        const Vc = XCConverted * totalCurrent; // Voltage Drop Across Capacitor (Vc)
        const vcUnit = this.unitMultipliers[this.resultVcDropdown.value];
        const VcConverted = Vc / vcUnit;

        const Vr = XRConverted * Vc; // Voltage Drop Across Resistor (Vr)
        const vrUnit = this.unitMultipliers[this.resultVrDropdown.value];
        const VrConverted = Vr / vrUnit;

        const VL = XLConverted * totalCurrent; // Voltage Drop Across Inductor (VL)
        const vlUnit = this.unitMultipliers[this.resultVLDropdown.value];
        const VLConverted = VL / vlUnit;


        document.getElementById("resultTotalImpedance").textContent = this.formatNumberWithExponent(ZConverted);
        document.getElementById("resultXL").textContent = this.formatNumberWithExponent(XLConverted);
        document.getElementById("resultXC").textContent = this.formatNumberWithExponent(XCConverted);
        document.getElementById("resultXR").textContent = this.formatNumberWithExponent(XRConverted);
        document.getElementById("resultTotalCurrent").textContent = this.formatNumberWithExponent(totalCurrentConverted);
        document.getElementById("resultVc").textContent = this.formatNumberWithExponent(VcConverted);
        document.getElementById("resultVr").textContent = this.formatNumberWithExponent(VrConverted);
        document.getElementById("resultVL").textContent = this.formatNumberWithExponent(VLConverted);
    }
}