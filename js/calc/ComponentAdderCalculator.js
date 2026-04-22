class ComponentAdderCalculator extends ElectricalUnits{
    constructor() {
        super();
        new Popup("calculator/ComponentAdderCalculator", this);


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
        this.componentsTable = document.getElementById("componentsTable");
        this.changeUnit();


    }
    get componentRows() {
        return this.componentsTable.querySelectorAll(":scope > .flex");
    }

    changeUnit()
    {
        let componentType = this.componentTypeSelect.value;
        this.totalValueDisplay.textContent = "—";

        this.loadOptions(this.resultIn, componentType);
        for (const row of this.componentRows) {
            this.loadOptions(row.querySelector("select"), componentType);
        }
    }

    addRow() {
        const rows = this.componentRows;
        if (rows.length >= 10) return;

        const componentType = this.componentTypeSelect.value;
        const rowNumber = rows.length + 1;

        const row = document.createElement("div");
        row.className = "flex rounded shadow-sm border border-gray-400 overflow-hidden focus-within:border-slate-800 focus-within:ring focus-within:ring-slate-200 focus-within:ring-opacity-50 dark:border-slate-500";
        row.innerHTML = `
            <input type="text" value="${rowNumber}" class="flex-1 min-w-0 border-0 focus:ring-0 dark:bg-slate-600 px-3 py-2">
            <select class="w-24 text-sm border-0 border-l border-gray-400 focus:ring-0 bg-gray-100 dark:bg-slate-700 dark:border-slate-500 px-2 py-2"></select>
        `;
        this.loadOptions(row.querySelector("select"), componentType);
        this.componentsTable.appendChild(row);
    }

    removeRow() {
        const rows = this.componentRows;
        if (rows.length > 2) {
            rows[rows.length - 1].remove();
        }
    }

    calculateTotal() {
        let totalValue = 0;
        let invertedValue = 0;
        let isInverted=false;
        let rows = this.componentRows;
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