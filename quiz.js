var messagesArray;
function checkQuestion() {
    var question = messagesArray.questions[parseInt(this.value) - 1];
    var answer = question.correctIndex;
    var elements = document.getElementsByName("n" + this.value);

    for (i = 0; i < elements.length; i++) {
        if (elements[i].checked) {
            if (answer - 1 == i) {

                this.style.background = '#00FF00';
                this.innerHTML = "CERTO";

                return;
            }
        }
    }
    var noteElement = document.getElementById("note" + question.numb);
    noteElement.innerHTML = question.notes;
    this.style.background = '#FF0000';
    this.innerHTML = "ERRDO";
}
function getWelcome() {

    var ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onreadystatechange = function () {

        if (ajaxRequest.readyState == 4) {
            //the request is completed, now check its status
            if (ajaxRequest.status == 200) {
                //turn JSON into array
                messagesArray = JSON.parse(ajaxRequest.responseText);
                var welcomeDiv = document.getElementById("welcome");
                for (question of messagesArray.questions) {

                    questionBlock = document.createElement("div");
                    questiontxt = document.createElement("div");
                    noteBlock = document.createElement("div");
                    noteBlock.id = "note" + question.numb;
                    questiontxt.innerHTML = question.numb + ")" + question.question;

                    questionBlock.appendChild(questiontxt);
                    let i = 1;
                    for (key of question.answers) {

                        let label = document.createElement("label");
                        let span = document.createElement("span");
                        label.innerText = key;

                        let input = document.createElement("input");
                        input.type = "radio";
                        input.value = i;
                        input.name = "n" + question.numb;
                        input.questionIndex = question.numb;
                        label.appendChild(input);
                        label.appendChild(span);
                        span.className = "checkmark";
                        label.className = "container";
                        questionBlock.appendChild(label);
                        welcomeDiv.appendChild(questionBlock);
                        i++;
                    }

                    questionBlock.appendChild(noteBlock);
                    if (question.correctIndex == 0) {
                        let notAvailble = document.createElement("div");
                        notAvailble.innerHTML = "resposta Indisponivel";
                        questionBlock.appendChild(notAvailble);
						console.log( question.numb)  ;
                    } else {

                        let btn = document.createElement("button");
                        btn.innerHTML = "Verificar";
                        btn.value = question.numb;
                        btn.onclick = checkQuestion;
                        questionBlock.appendChild(btn);
                    }
                }

            } else {
                console.log("Status error: " + ajaxRequest.status);
            }
        } else {
            console.log("Ignored readyState: " + ajaxRequest.readyState);
        }
    };
    ajaxRequest.open('GET', 'question2.json');
    ajaxRequest.send();
}
