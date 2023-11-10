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
        this.calculationType = document.getElementById("calculationType");
        this.calculateButton = document.getElementById("calculateBtn");

        this.voltagesFields = document.querySelector("#tensions");
        this.impedancesFields = document.querySelector("#impedances");

        this.calculationType.addEventListener("change", () => this.toggleFields());

        this.calculateButton.addEventListener("click", () => this.calculateVSWR());
    }

    toggleFields() {
        if (this.calculationType.value === "tension") {
            this.showTensionFields();
        } else {
            this.showImpedanceFields();
        }
    }

    showTensionFields() {
        this.voltagesFields.classList.remove("hidden");
        this.impedancesFields.classList.add("hidden");
    }

    showImpedanceFields() {
        this.impedancesFields.classList.remove("hidden");
        this.voltagesFields.classList.add("hidden");
    }

    calculateVSWR() {
        var calcMethod = this.calculationType.value;

        if (calcMethod === "tension") {
            var vmax = parseFloat(this.vmaxInput.value);
            var vmin = parseFloat(this.vminInput.value);

            if (!isNaN(vmax) && !isNaN(vmin)) {
                var vswr = vmax / vmin;
                this.vswrResult.innerText = "VSWR = " + vswr.toFixed(2);
            } else {
                alert("Por favor, insira valores numéricos válidos para Vmax e Vmin.");
            }
        } else if (calcMethod === "impedance") {
            var zl = parseFloat(this.zlInput.value);
            var zo = parseFloat(this.zoInput.value);

            if (!isNaN(zl) && !isNaN(zo)) {
                var reflectionCoefficient = (zl - zo) / (zl + zo);
                var vswr = (1 + Math.abs(reflectionCoefficient)) / (1 - Math.abs(reflectionCoefficient));
                this.vswrResult.innerText = "VSWR = " + vswr.toFixed(2);
            } else {
                alert("Por favor, insira valores numéricos válidos para ZL e Zo.");
            }
        }
    }
}