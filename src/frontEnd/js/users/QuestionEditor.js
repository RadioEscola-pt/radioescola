class QuestionEditor {
    constructor() {
        this.xhrWelcome = new XMLHttpRequest();
        this.xhrWelcome.onreadystatechange = this.setform.bind(this);
        this.xhrWelcome.open('GET', 'users/QuestionEditor/index.html');
        this.xhrWelcome.send();
    }
    setform() {
        if (this.xhrWelcome.readyState == 4 && this.xhrWelcome.status == 200) {
            var welcomeDiv = document.getElementById("welcome");
            welcomeDiv.innerHTML = this.xhrWelcome.responseText;
            this.fileSelector = document.getElementById('fileSelector');
            this.currentAnswer = document.getElementById('correctAnswer');
            this.uniqueIdInput = document.getElementById('uniqueIdInput');
            this.loadButton = document.getElementById('loadButton');
            this.questionForm = document.getElementById('questionForm');
            this.questionText = document.getElementById('questionText');
            this.answers = [
                document.getElementById('answer1'),
                document.getElementById('answer2'),
                document.getElementById('answer3'),
                document.getElementById('answer4')
            ];
            this.questionNotes = document.getElementById('questionNotes');
            this.questionImg = document.getElementById('questionImg');
            this.questionFonte = document.getElementById('questionFonte');
            this.questionTutorial = document.getElementById('questionTutorial');
            this.questionMateria = document.getElementById('questionMateria');
            this.saveButton = document.getElementById('saveButton');
            this.data = null; // Store the loaded data
            this.currentQuestionIndex = -1; // Store the index of the current loaded question

            this.attachEventListeners();
        }
    }

    attachEventListeners() {
        this.loadButton.addEventListener('click', () => this.loadQuestion());
        this.saveButton.addEventListener('click', () => this.saveQuestion());
    }

    loadQuestion() {
        const fileName ="perguntas/"+ this.fileSelector.value;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', fileName, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                this.data = JSON.parse(xhr.responseText); // Load and store the data
                const uniqueId = parseInt(this.uniqueIdInput.value, 10);
                this.currentQuestionIndex = this.data.questions.findIndex(q => q.uniqueID === uniqueId);
                if (this.currentQuestionIndex === -1) {
                    alert('Question not found!');
                    return;
                }
                this.displayQuestionForm(this.data.questions[this.currentQuestionIndex]);
            } else if (xhr.readyState === 4) {
                console.error('Error loading the file:', xhr.status);
            }
        };
        xhr.send();
    }

    displayQuestionForm(question) {
        this.questionText.value = question.question;
        for (let i = 0; i < this.answers.length; i++) {
            this.answers[i].value = question.answers[i];
        }
        this.questionNotes.value = question.notes || '';
        this.questionImg.value = question.img || '';
        this.questionFonte.value = (question.fonte || []).join(', ');
        this.questionTutorial.value = question.tutorial || '';
        this.questionMateria.value = question.materia || '';
        this.currentAnswer.value = question.correctAnswer;
        this.currentAnswer.selectedIndex = question.correctIndex; // Set the dropdown to the correct index
        


        this.questionForm.style.display = 'block';
    }

    saveQuestion() {
        if (this.currentQuestionIndex === -1) {
            alert('No question loaded or selected for saving.');
            return;
        }

        const question = this.data.questions[this.currentQuestionIndex];
        question.question = this.questionText.value;
        
        for (let i = 0; i < question.answers.length; i++) {
            question.answers[i] = this.answers[i].value; // Directly update the answers
        }
        question.notes = this.questionNotes.value;
        question.img = this.questionImg.value;
        question.fonte = this.questionFonte.value.split(', ');
        question.tutorial = this.questionTutorial.value;
        question.materia = this.questionMateria.value;

        console.log('Updated question:', question);
    }
}


