class ComponentAdder extends ElectricalUnits{
    constructor() {
        super();
        new Popup("ComponentAdder", this);


    }
    endRequest()
    {
        this.addRowBtn = document.getElementById("addRowBtn");
        this.removeRowBtn = document.getElementById("removeRowBtn");
        this.calculateBtn = document.getElementById("calculateBtn");
        
        this.totalValueDisplay = document.getElementById("totalValue");
        this.seriesParallelSelect = document.getElementById("seriesParallel");
        this.componentTypeSelect = document.getElementById("componentType");
        this.resultIn = document.getElementById("ResultIn");
        
  
        this.componentTypeSelect.addEventListener("change", this.changeUnit.bind(this));
        this.addRowBtn.onclick=this.addRow.bind(this);
        this.removeRowBtn.onclick=this.removeRow.bind(this);
        this.calculateBtn.onclick=this.calculateTotal.bind(this);
        this.componentsTable = document.getElementById("componentsTable").getElementsByTagName('tbody')[0];
        this.changeUnit();


    }
    changeUnit()
    {
        let componentType = this.componentTypeSelect.value;
        this.totalValueDisplay.textContent ="";

        this.loadOptions(this.resultIn, componentType);
        let rows = this.componentsTable.getElementsByTagName("tr");

        for (let i = 0; i < rows.length; i++) {

            let row = rows[i];
            let unitsSelect = row.querySelector("select");
            this.loadOptions(unitsSelect, componentType);
        }
  

    }

    addRow() {
        let componentType = this.componentTypeSelect.value;
        if (this.componentsTable.rows.length < 10) {
            const newRow = this.componentsTable.insertRow(-1);
            const rowNumber = this.componentsTable.rows.length;

            const numberCell = newRow.insertCell(0);
            const unitsCell = newRow.insertCell(1);

            numberCell.innerHTML = `<input type="text"  value="${rowNumber}" class="w-28 rounded shadow-sm border-gray-400 focus:border-slate-800 focus:ring focus:ring-slate-200 focus:ring-opacity-50">`;
            var selectElement = document.createElement('select');
            selectElement.className = "w-28 rounded shadow-sm border-gray-400 focus:border-slate-800 focus:ring focus:ring-slate-200 focus:ring-opacity-50";
            this.loadOptions(selectElement,componentType);
            unitsCell.append(selectElement);
        }

    }

    removeRow() {
        if (this.componentsTable.rows.length > 2) {
            this.componentsTable.deleteRow(-1);
        }
    }

    calculateTotal() {
        let totalValue = 0;
        let invertedValue = 0;
        let isInverted=false;
        let rows = this.componentsTable.getElementsByTagName("tr");
        let seriesParallelType = this.seriesParallelSelect.value;
        let componentType = this.componentTypeSelect.value;


        if (componentType === "Ω") {
            // Example: For resistors, calculate the value based on series or parallel
            if (seriesParallelType === "series") {
                isInverted=false;
            } else {
                isInverted=true;
            }
        } else if (componentType === "F") {
            // Example: For capacitors, calculate the value based on series or parallel
            if (seriesParallelType === "series") {
                isInverted=true;
            } else {
                isInverted=false;
            }
        } else if (componentType === "H") {
            // Example: For inductors, calculate the value based on series or parallel
            if (seriesParallelType === "series") {
                isInverted=false;
            } else {
                isInverted=true;
            }
        }

        for (let i = 0; i < rows.length; i++) {
            let row = rows[i];
            let unitsSelect = row.querySelector("select");
            let numberInput = row.querySelector("input");

            let selectedUnits = unitsSelect.value;
            let numberValue = parseFloat(numberInput.value);


            numberValue *=  this.unitMultipliers[selectedUnits];
            if (isInverted ==false) {
                totalValue += numberValue; // Replace with your calculation
            } else {
                invertedValue += 1/numberValue; // Replace with your calculation
            }



            // Accumulate the total value
            

        }
        let selectedresultUnits = this.resultIn.value;
        let unit1 = this.resultIn.value;
        

        if (isInverted ==false) {
            totalValue/=this.unitMultipliers[unit1];
            let result=this.formatNumberWithExponent(totalValue);
            this.totalValueDisplay.textContent = `Valor Total: `+result;
        } else {
            invertedValue=1/invertedValue;
            invertedValue/=this.unitMultipliers[unit1];
            let result=this.formatNumberWithExponent(invertedValue);
            this.totalValueDisplay.textContent = `Total Value: `+result;
        }
       

        
    }
}