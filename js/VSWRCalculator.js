class VSWRCalculator extends ElectricalUnits {
    constructor() {
        super();
        new Popup("VSWRCalculator", this);

    }
    endRequest() {
        this.vmaxInput = document.getElementById("vmax");
        this.vminInput = document.getElementById("vmin");
        this.zlInput = document.getElementById("zl");
        this.zoInput = document.getElementById("zo");
        this.vswrResult = document.getElementById("vswrResult");
        this.calculateButton = document.getElementById("calculateButton");

        this.voltagesRadio = document.getElementById("voltagesRadio");
        this.impedancesRadio = document.getElementById("impedancesRadio");
        this.voltagesFields = document.querySelector(".voltages-fields");
        this.impedancesFields = document.querySelector(".impedances-fields");

        this.voltagesRadio.addEventListener("click", () => this.showVoltagesFields());
        this.impedancesRadio.addEventListener("click", () => this.showImpedancesFields());

        this.calculateButton.addEventListener("click", () => this.calculateVSWR());
    }

    showVoltagesFields() {
        this.voltagesFields.classList.remove("hidden");
        this.impedancesFields.classList.add("hidden");
    }

    showImpedancesFields() {
        this.impedancesFields.classList.remove("hidden");
        this.voltagesFields.classList.add("hidden");
    }

    calculateVSWR() {
        var calcMethod = document.querySelector('input[name="calcMethod"]:checked').value;

        if (calcMethod === "voltages") {
            var vmax = parseFloat(this.vmaxInput.value);
            var vmin = parseFloat(this.vminInput.value);

            if (!isNaN(vmax) && !isNaN(vmin)) {
                var vswr = vmax / vmin;
                this.vswrResult.innerHTML = vswr;
            } else {
                alert("Por favor, insira valores numéricos válidos para Vmax e Vmin.");
            }
        } else if (calcMethod === "impedances") {
            var zl = parseFloat(this.zlInput.value);
            var zo = parseFloat(this.zoInput.value);

            if (!isNaN(zl) && !isNaN(zo)) {
                var reflectionCoefficient = (zl - zo) / (zl + zo);
                var vswr = (1 + Math.abs(reflectionCoefficient)) / (1 - Math.abs(reflectionCoefficient));
                this.vswrResult.innerHTML = vswr;
            } else {
                alert("Por favor, insira valores numéricos válidos para ZL e Zo.");
            }
        }
    }
}