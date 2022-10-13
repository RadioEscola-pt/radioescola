
class simulateQuiz {

    static UNANSWERED = 0;
    static WRITE = 1;
    static WRONG = 2;
	static COUINTERTIMEOT = 45*60;
    static messagesArray = new Object();
    static pageBlocks = [];
	static timeout = 0;
	static timer = 0;
	
	 static checkTimer() {
		 var counterDiv = document.getElementById("couter");
		 counterDiv.innerHTML=simulateQuiz.timeout+" sec";
		 simulateQuiz.timeout--;
		 if (simulateQuiz.timeout<0)
		 {
			 simulateQuiz.checkQuestions();
			 window.clearTimeout(simulateQuiz.timer);
		 }
	 }

    static checkQuestions() {
        var answers = Array();
        for (var questionIndex in simulateQuiz.messagesArray.questions) {
            var elements = document.getElementsByName("n" + questionIndex);
            answers[questionIndex] = simulateQuiz.UNANSWERED;
			var noteDiv = document.getElementById("note" + simulateQuiz.messagesArray.questions[questionIndex].index);
			 
            for (var i = 0; i < elements.length; i++) {

                if (elements[i].checked) {

                    if (simulateQuiz.messagesArray.questions[questionIndex].correctIndex == i + 1) {
                        answers[questionIndex] = simulateQuiz.WRITE;
                    } else {
                        answers[questionIndex] = simulateQuiz.WRONG;
                    }

                }
            }
			if (answers[questionIndex]!=simulateQuiz.WRITE)
			{
				noteDiv.innerHTML="Resposta certa "+simulateQuiz.messagesArray.questions[questionIndex].correctIndex
			}

        }
    }

    constructor() {

        var numberOfUnaswered = 0;
        var questionCounter = 0;
        var ajaxRequest = new XMLHttpRequest();
        ajaxRequest.onreadystatechange = function () {

            if (ajaxRequest.readyState == 4) {
                //the request is completed, now check its status
                if (ajaxRequest.status == 200) {
                    //turn JSON into array

                    var allMessagesArray = JSON.parse(ajaxRequest.responseText);
                    for (var qindex in allMessagesArray.questions) {
                        if (allMessagesArray.questions[qindex].correctIndex == 0) {
                            allMessagesArray.questions.splice(qindex, 1);
                        }

                    }
                    simulateQuiz.messagesArray.questions = [];
                    for (let i = 0; i < 40; i++) {
                        var questionIndex = Math.floor(Math.random() * allMessagesArray.questions.length);
                        simulateQuiz.messagesArray.questions.push(allMessagesArray.questions[questionIndex]);
                        allMessagesArray.questions.splice(i, 1);
                    }
                    var welcomeDiv = document.getElementById("welcome");
                    welcomeDiv.innerHTML = "";
                    var indexBlock = document.createElement("div");
                    indexBlock.id = "qIndex";
					
					
					
                    welcomeDiv.appendChild(indexBlock);
                    var index = 0;
                    for (var qindex in simulateQuiz.messagesArray.questions) {
                        var pageBlock;
                        simulateQuiz.messagesArray.questions[qindex].index = index;
                        index++;
                        if (questionCounter == 0) {
                            pageBlock = document.createElement("div");
                            pageBlock.id = "Page" + questionCounter;
                            pageBlock.style.display = "block";
                            let btn = document.createElement("button");
                            btn.innerHTML = questionCounter;
                            btn.value = questionCounter;
                            btn.onclick = simulateQuiz.showPage;
                            indexBlock.appendChild(btn);
                            simulateQuiz.pageBlocks.push(pageBlock);

                        } else if (questionCounter % 10 == 0) {
                            pageBlock = document.createElement("div");
                            pageBlock.id = "Page" + questionCounter;
                            pageBlock.style.display = "none";
                            let btn = document.createElement("button");
                            btn.innerHTML = questionCounter;
                            btn.value = questionCounter;
                            btn.onclick = simulateQuiz.showPage;
                            indexBlock.appendChild(btn);
                            simulateQuiz.pageBlocks.push(pageBlock);
                        }
                        questionCounter++;
                        var questionBlock = document.createElement("div");
                        var questiontxt = document.createElement("div");
                        var noteBlock = document.createElement("div");
                        noteBlock.id = "note" + simulateQuiz.messagesArray.questions[qindex].index;
                        questiontxt.innerHTML = simulateQuiz.messagesArray.questions[qindex].index + ")" + simulateQuiz.messagesArray.questions[qindex].question;

                        questionBlock.appendChild(questiontxt);
                        let i = 1;
                        for (let key of simulateQuiz.messagesArray.questions[qindex].answers) {

                            let label = document.createElement("label");
                            let span = document.createElement("span");
                            label.innerText = key;

                            let input = document.createElement("input");
                            input.type = "radio";
                            input.value = i;
                            input.name = "n" + simulateQuiz.messagesArray.questions[qindex].index;

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
                        if (simulateQuiz.messagesArray.questions[qindex].correctIndex == null) {
                            console.log("ERROR Q" + simulateQuiz.messagesArray.questions[qindex].numb);
                        }
                        if (simulateQuiz.messagesArray.questions[qindex].notes == null) {
                            console.log("ERROR Q" + simulateQuiz.messagesArray.questions[qindex].numb);
                        }

                    }
                    let btn = document.createElement("button");
                    btn.innerHTML = "Finalizar";
					simulateQuiz.timeout=simulateQuiz.COUINTERTIMEOT;
					simulateQuiz.timer=window.setInterval(simulateQuiz.checkTimer, 1000);
                    btn.onclick = simulateQuiz.checkQuestions;
                    indexBlock.appendChild(btn);
					
					var couterBlock = document.createElement("div");
                    couterBlock.id = "couter";
					indexBlock.appendChild(couterBlock);
					
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
}
