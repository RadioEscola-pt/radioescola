class QCalculator extends ElectricalUnits {
    constructor() {
        super();
        new Popup("QCalculator", this);




    }
    endRequest() {
      

      this.LUnits=document.getElementById('LUnit');

      this.FUnits=document.getElementById('FUnit');
        this.loadOptions(this.LUnits, "Hz");
        this.loadOptions(this.FUnits, "Hz");




      this.calculateButton=document.getElementById('calcularBtn')
      this.calculateButton.addEventListener("click", this.calculate.bind(this));
    }

    calculate() {
      const frequencia = parseFloat(document.getElementById('frequencia').value);
      const largura = parseFloat(document.getElementById('largura').value);
      let q = parseFloat(document.getElementById('q').value);
      const lunitValue = this.unitMultipliers[this.LUnits.value];
      const funitValue = this.unitMultipliers[this.FUnits.value];

      if (frequencia && largura && !q) {

        q = (frequencia*funitValue) / (largura*lunitValue);
        let result=this.formatNumberWithExponent(q);
        document.getElementById('q').value = result;
      } else if (frequencia && !largura && q) {

        largura = (frequencia*funitValue / q)/lunitValue;
        let result=this.formatNumberWithExponent(largura);

        document.getElementById('largura').value = result;
      } else if (!frequencia && largura && q) {
        frequencia = ((largura*lunitValue) * q)/funitValue;
        let result=this.formatNumberWithExponent(frequencia);
        document.getElementById('frequencia').value = result;
      } else {
        alert("Por favor, preencha dois campos para calcular o terceiro.");
      }
    }
  }