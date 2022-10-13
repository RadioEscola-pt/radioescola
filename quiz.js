var messagesArray;
var pageBlocks=[];

function checkQuestion() {
	var question;
	 for (question of messagesArray.questions) {
        if (question.index==parseFloat(this.value)) {
			break;
        }
    }
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
function showPage()
{
	for (page of pageBlocks) {
		page.style.display = "none";
	}
	 var currentPage = document.getElementById("Page" + this.value);
	 currentPage.style.display = "block";
}

function getWelcome() {

    var numberOfUnaswered = 0;
    var questionCounter = 0;
    var ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onreadystatechange = function () {

        if (ajaxRequest.readyState == 4) {
            //the request is completed, now check its status
            if (ajaxRequest.status == 200) {
                //turn JSON into array

                messagesArray = JSON.parse(ajaxRequest.responseText);
                var welcomeDiv = document.getElementById("welcome");
                indexBlock = document.createElement("div");
                indexBlock.id = "qIndex";
                welcomeDiv.appendChild(indexBlock);
				var index=0;
                for (qindex in messagesArray.questions) {
					var pageBlock;
					messagesArray.questions[qindex].index=index;
					index++;
                    if (questionCounter == 0) {
                        pageBlock = document.createElement("div");
                        pageBlock.id = "Page" + questionCounter ;
                        pageBlock.style.display = "block";
                        let btn = document.createElement("button");
                        btn.innerHTML = questionCounter;
                        btn.value = questionCounter;
                        btn.onclick = showPage;
                        indexBlock.appendChild(btn);
						pageBlocks.push(pageBlock);

                    } else if (questionCounter % 10 == 0) {
                        pageBlock = document.createElement("div");
                        pageBlock.id = "Page" + questionCounter ;
                        pageBlock.style.display = "none";
                        let btn = document.createElement("button");
                        btn.innerHTML = questionCounter;
                        btn.value = questionCounter;
                        btn.onclick = showPage;
                        indexBlock.appendChild(btn);
						pageBlocks.push(pageBlock);
                    }
                    questionCounter++;
                    questionBlock = document.createElement("div");
                    questiontxt = document.createElement("div");
                    noteBlock = document.createElement("div");
                    noteBlock.id = "note" + messagesArray.questions[qindex].index;
                    questiontxt.innerHTML = messagesArray.questions[qindex].numb + ")" + messagesArray.questions[qindex].question;

                    questionBlock.appendChild(questiontxt);
                    let i = 1;
                    for (key of messagesArray.questions[qindex].answers) {

                        let label = document.createElement("label");
                        let span = document.createElement("span");
                        label.innerText = key;

                        let input = document.createElement("input");
                        input.type = "radio";
                        input.value = i;
                        input.name = "n" + messagesArray.questions[qindex].numb;
                        input.questionIndex = messagesArray.questions[qindex].numb;
                        label.appendChild(input);
                        label.appendChild(span);
                        span.className = "checkmark";
                        label.className = "container";
                        questionBlock.appendChild(label);
                        pageBlock.appendChild(questionBlock);
                        welcomeDiv.appendChild(pageBlock);
                        i++;
                    }

                    questionBlock.appendChild(noteBlock);
                    if (messagesArray.questions[qindex].correctIndex == null) {
                        console.log("ERROR Q" + messagesArray.questions[qindex].numb);
                    }
                    if (messagesArray.questions[qindex].notes == null) {
                        console.log("ERROR Q" + messagesArray.questions[qindex].numb);
                    }

                    if (messagesArray.questions[qindex].correctIndex == 0) {
                        let notAvailble = document.createElement("div");
                        notAvailble.innerHTML = "resposta Indisponivel";
                        questionBlock.appendChild(notAvailble);
                        console.log(messagesArray.questions[qindex].numb);
                        numberOfUnaswered++;
                    } else {

                        let btn = document.createElement("button");
                        btn.innerHTML = "Verificar";
                        btn.value = messagesArray.questions[qindex].index;
                        btn.onclick = checkQuestion;
                        questionBlock.appendChild(btn);
                    }
                }
                console.log("Unaswered" + numberOfUnaswered);

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
