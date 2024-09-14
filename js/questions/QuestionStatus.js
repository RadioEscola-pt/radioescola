class QuestionStatus {
    constructor() {
        this.files = ['question1.json', 'question2.json', 'question3.json'];
        
        new LoadChapter("QuestionStatus", this, true);


    }
    endRequest()
    {
        this.table = document.getElementById('questoesTable');
        this.generateSummary();
    }

    loadJSON(file) {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.open('GET', "perguntas/"+file, true);
        xhr.onreadystatechange = this.processJSONData; // Binding callback with file context
        xhr.parent = this; // Binding parent context
        xhr.file = file; // Binding file context
        xhr.send(null);
    }

    processJSONData() {

        if (this.readyState === 4 && this.status === 200) {
            var data = JSON.parse(this.responseText);
            var totalQuestions = data.questions.length;
            var verifiedQuestions = data.questions.filter(function(question) {
                return question.fonte !== null;
            }).length;
            var anacomFileValue = data.ANACOMFILE || ''; // Get ANACOMFILE value or empty string if not present

            this.parent.updateTable(this.file, totalQuestions, verifiedQuestions, anacomFileValue);
        }
    }

    updateTable(file, totalQuestions, verifiedQuestions, anacomFileValue) {
        var row = this.table.tBodies[0].insertRow(-1);
        this.table.tBodies[0].children.length == 2 ? this.table.tBodies[0].lastElementChild.className = 'bg-slate-100 dark:bg-slate-600' : '';
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        const fileNumber = file.match(/\d+/)[0]; // Extracts the number from the file name
        cell1.innerHTML = `Categoria ${fileNumber}`;
        cell2.innerHTML = totalQuestions;
        cell3.innerHTML = verifiedQuestions;
        cell4.innerHTML = anacomFileValue;
        cell5.innerHTML = anacomFileValue*2;

        cell1.className = 'p-2';
        cell2.className = 'p-2';
        cell3.className = 'p-2';
        cell4.className = 'p-2';
        cell5.className = 'p-2';
    }

    generateSummary() {
        this.files.forEach((file) => {
            this.loadJSON(file);
        });
    }
}

