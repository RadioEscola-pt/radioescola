class ComponentAdder {
    constructor() {
        new LoadChapter("ComponentAdder", this);

       

        
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

        
        

        

        this.addRowBtn.onclick=this.addRow.bind(this);
        this.removeRowBtn.onclick=this.removeRow.bind(this);
        this.calculateBtn.onclick=this.calculateTotal.bind(this);
        this.componentsTable = document.getElementById("componentsTable").getElementsByTagName('tbody')[0];

    }

    addRow() {
        if (this.componentsTable.rows.length < 10) {
            const newRow = this.componentsTable.insertRow(-1);
            const rowNumber = this.componentsTable.rows.length;

            const numberCell = newRow.insertCell(0);
            const unitsCell = newRow.insertCell(1);

            numberCell.innerHTML = `<input type="text"  value="${rowNumber}">`;
            unitsCell.innerHTML = `
                <select>
                    <option value="MEGA">MEGA</option>
                    <option value="KILO">KILO</option>
                    <option value="MILI">MILI</option>
                    <option value="MICRO">MICRO</option>
                    <option value="NANO">NANO</option>
                    <option value="NONE">NONE</option>
                </select>
            `;
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
        if (componentType === "Resistor") {
            // Example: For resistors, calculate the value based on series or parallel
            if (seriesParallelType === "series") {
                isInverted=false;
            } else {
                isInverted=true;
            }
        } else if (componentType === "Capacitor") {
            // Example: For capacitors, calculate the value based on series or parallel
            if (seriesParallelType === "series") {
                isInverted=true;
            } else {
                isInverted=false;
            }
        } else if (componentType === "Inductor") {
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

            // Replace this logic with your specific calculation formula
            



            // Adjust the calculated value based on selected units
            switch (selectedUnits) {
                case "KILO":
                    numberValue *= 1000;
                    break;
                case "MEGA":
                    numberValue *= 1000000;
                    break;
                case "MILI":
                    numberValue /= 1000;
                    break;
                case "MICRO":
                    numberValue /= 1000000;
                    break;
                case "NANO":
                    numberValue /= 1000000000;
                    break;
                case "NONE":
                    break;
            }
            if (isInverted ==false) {
                totalValue += numberValue; // Replace with your calculation
            } else {
                invertedValue += 1/numberValue; // Replace with your calculation
            }



            // Accumulate the total value
            

        }
        let selectedresultUnits = this.resultIn.value;
        let resultMult =0; 


        switch (selectedresultUnits) {
            case "KILO":
                resultMult = 1/1000;
                break;
            case "MEGA":
                resultMult = 1/1000000;
                break;
            case "MILI":
                resultMult = 1000;
                break;
            case "MICRO":
                resultMult = 1000000;
                break;
            case "NANO":
                resultMult = 1000000000;
                break;
            case "NONE":
                break;
        }


        


        if (isInverted ==false) {
            totalValue*=resultMult;

            this.totalValueDisplay.textContent = `Total Value: ${totalValue.toFixed(2)}`;
        } else {
            invertedValue=1/invertedValue;
            invertedValue*=resultMult;
            this.totalValueDisplay.textContent = `Total Value: ${invertedValue.toFixed(2)}`;
        }
       

        
    }
}