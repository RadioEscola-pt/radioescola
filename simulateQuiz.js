
class simulateQuiz {

	static UNANSWERED=0;
	static WRITE=1;
	static WRONG=2;
    static messagesArray = new Object();
    static pageBlocks = [];

    static checkQuestions() {

        for (var questionIndex in simulateQuiz.messagesArray.questions) {
            var elements = document.getElementsByName("n" + questionIndex);
            var answers=array();
			for (var i = 0; i < elements.length; i++) {
				answers[i]=simulateQuiz.UNANSWERED;
                if (elements[i].checked) {
					
					if (simulateQuiz.messagesArray.questions[questionIndex].correctIndex==i)
					{
						answers[i]=simulateQuiz.WRITE;
					}
					else
					{
						answers[i]=simulateQuiz.WRONG;
					}
					
					
					
					
				}
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

                    //btn.onclick = simulateQuiz.showPage;
                    indexBlock.appendChild(btn);
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
