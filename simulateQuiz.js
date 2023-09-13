
class simulateQuiz {

	static UNANSWERED = 0;
	static CORRECT = 1;
	static INCORRECT = -0.25;
	static COUINTERTIMEOT = 60 * 60;
	static questions = new Object();
	static PER_PAGE = 10;
	static QUESTION_AMOUNT = 40;
	static pageBlocks = [];
	static timeout = 0;
	static timer = 0;


	static checkTimer() {
		var counterDiv = document.getElementById("timer");
		if (counterDiv == null) {
			window.clearTimeout(simulateQuiz.timer);
			return;
		}
		counterDiv.innerHTML = new Date(simulateQuiz.timeout * 1000).toISOString().slice(11, 19);
		simulateQuiz.timeout--;
		if (simulateQuiz.timeout < 0) {
			simulateQuiz.checkQuestions();

		}
	}
	static showPage() {
		window.scrollTo(0, 0);
		for (var page of simulateQuiz.pageBlocks) {
			page.style.display = "none";
			page.classList.remove("active");
		}
		var currentPage = document.querySelector(`.page[data-page="${this.value}"]`);

		if (document.querySelector('#qIndex button.active')) {
			document.querySelector('#qIndex button.active').classList.remove("active")
		}
		
		currentPage.style.display = "block";
		currentPage.classList.add('active')

		simulateQuiz.generatePagination()
		
		document.querySelector(`#qIndex button[value="${this.value}"]`).classList.add("active")
	}

	static generatePagination() {
		var currentPage = parseInt(document.querySelector(`.page.active`).dataset.page);
		let buttons = document.querySelector('#pagination')
		buttons.innerHTML = ''

		let previousButton = document.createElement('button');
		previousButton.innerText = 'Anterior'
		previousButton.value = currentPage - 1;
		previousButton.onclick = simulateQuiz.showPage
		previousButton.disabled = currentPage == 1
		buttons.append(previousButton)

		for (let i = 0 ; i < simulateQuiz.numberOfPages(); i++) {
			
			let pageBtn = document.createElement("button");
			pageBtn.innerText = i + 1
			pageBtn.value = i + 1;
			pageBtn.onclick = simulateQuiz.showPage;
			if (currentPage == i + 1) {
				pageBtn.className = 'active';
			}
			buttons.appendChild(pageBtn);
		}

		let nextButton = document.createElement('button');
		nextButton.innerText = 'Seguinte'
		nextButton.value = currentPage + 1;
		nextButton.onclick = simulateQuiz.showPage
		nextButton.disabled = currentPage == simulateQuiz.numberOfPages()
		buttons.append(nextButton)

		let spacer = document.createElement('div')
		spacer.style.display = 'flex';
		spacer.style.flex = 1;
		buttons.append(spacer)

		let btn = document.createElement("button");
		btn.innerHTML = "Finalizar";
		simulateQuiz.timeout = simulateQuiz.COUINTERTIMEOT;
		window.clearTimeout(simulateQuiz.timer);
		simulateQuiz.timer = window.setInterval(simulateQuiz.checkTimer, 1000);
		btn.onclick = simulateQuiz.checkQuestions;
		btn.id = 'submitQuiz'
		buttons.appendChild(btn);
	}

	static numberOfPages() {
		return simulateQuiz.pageBlocks.length
	}

	static checkQuestions() {
		var answers = Array();
		window.clearTimeout(simulateQuiz.timer);
		for (var questionIndex in simulateQuiz.questions) {
			var elements = document.getElementsByName("n" + questionIndex);
			answers[questionIndex] = simulateQuiz.UNANSWERED;
			var noteDiv = document.getElementById("note" + simulateQuiz.questions[questionIndex].index);

			for (var i = 0; i < elements.length; i++) {

				if (elements[i].checked) {
					const correctIndex = parseInt(simulateQuiz.questions[questionIndex].correctIndex);
					if (correctIndex == i + 1) {
						answers[questionIndex] = simulateQuiz.CORRECT;
					} else {
						answers[questionIndex] = simulateQuiz.INCORRECT;
						elements[i].parentElement.style.color = '#7F1D1D';
						elements[correctIndex - 1].parentElement.style.color = '#22C55E';
					}

				}
			}
			if (answers[questionIndex] != simulateQuiz.CORRECT) {
				noteDiv.innerHTML = "Resposta certa: " + simulateQuiz.questions[questionIndex].correctIndex;
				noteDiv.className = "incorrect";
				noteDiv.innerHTML += "<br>" + simulateQuiz.questions[questionIndex].notes;

				noteDiv.parentElement.parentElement.parentElement.style.boxShadow = '0px 0px 5px #7F1D1D'
				elements[parseInt(simulateQuiz.questions[questionIndex].correctIndex - 1)].parentElement.style.color = '#22C55E';
			}

		}
		var total = 0;
		for (var answer of answers) {
			total += answer;

		}
		var counterDiv = document.getElementById("timer");
		counterDiv.innerHTML = "Pontos:" + total + " em 40  a classificação mínima de 20 pontos";
	}

	constructor(json) {

		var numberOfUnaswered = 0;
		var questionCounter = 0;
		simulateQuiz.pageBlocks = []
		var ajaxRequest = new XMLHttpRequest();
		ajaxRequest.onreadystatechange = function() {

			if (ajaxRequest.readyState == 4) {
				//the request is completed, now check its status
				if (ajaxRequest.status == 200) {
					//turn JSON into array

					var allMessagesArray = JSON.parse(ajaxRequest.responseText);
					allMessagesArray = allMessagesArray.questions;
					var randomQ = [];
					for (let i = 0; i < simulateQuiz.QUESTION_AMOUNT; i++) {
						var questionIndex = Math.floor(Math.random() * allMessagesArray.length);
						randomQ.push(allMessagesArray[questionIndex]);
						allMessagesArray.splice(questionIndex, 1);
					}
					simulateQuiz.questions = randomQ;
					var welcomeDiv = document.getElementById("welcome");
					welcomeDiv.innerHTML = "";
					var indexBlock = document.createElement("div");
					indexBlock.id = "qIndex";

					let buttons = document.createElement('div')
					buttons.id = 'pagination'


					welcomeDiv.appendChild(indexBlock);
					var index = 0;
					for (var qindex in randomQ) {
						var pageBlock;
						randomQ[qindex].index = index;
						index++;
						if (questionCounter == 0) {
							pageBlock = document.createElement("div");
							pageBlock.className = "page active";
							pageBlock.dataset.page =  questionCounter / simulateQuiz.PER_PAGE + 1;
							pageBlock.style.display = "block";

							simulateQuiz.pageBlocks.push(pageBlock);

						} else if (questionCounter % 10 == 0) {
							pageBlock = document.createElement("div");
							pageBlock.className = "page";
							pageBlock.dataset.page =  questionCounter / simulateQuiz.PER_PAGE + 1;
							pageBlock.style.display = "none";

							simulateQuiz.pageBlocks.push(pageBlock);
						}
						questionCounter++;

						var questionBlock = document.createElement("div");
						questionBlock.className = "questionBlock";

						var questionCard = document.createElement("div");
						questionCard.className = "questionCard";
						questionBlock.appendChild(questionCard);

						var questiontxt = document.createElement("span");
						questiontxt.className = "question";
						questiontxt.innerHTML = simulateQuiz.questions[qindex].index + 1 + ") " + simulateQuiz.questions[qindex].question
						questionCard.appendChild(questiontxt);

						var answers = document.createElement("div");
						answers.className = "answers";

						var noteBlock = document.createElement("div");
						noteBlock.id = "note" + simulateQuiz.questions[qindex].index;
						noteBlock.className = "questionImage";

						let i = 1;
						for (let key of simulateQuiz.questions[qindex].answers) {
							let label = document.createElement("label");

							let input = document.createElement("input");
							input.type = "radio";
							input.value = i;
							input.name = "n" + simulateQuiz.questions[qindex].index;

							label.appendChild(input);
							label.innerHTML += key;

							answers.appendChild(label);
							i++;
						}

						questionCard.appendChild(answers);
						pageBlock.appendChild(questionBlock);

						if (simulateQuiz.questions[qindex].img) {
							var image = document.createElement("img");
							image.className = "questionImage";
							image.src = simulateQuiz.questions[qindex].img;
							questionBlock.appendChild(image);
						} else {

						}


						welcomeDiv.appendChild(pageBlock);
						

						answers.appendChild(noteBlock);
						if (simulateQuiz.questions[qindex].correctIndex == null) {
							console.log("ERROR Q" + simulateQuiz.questions[qindex].uniqueID);
						}
						if (simulateQuiz.questions[qindex].notes == null) {
							console.log("ERROR Q" + simulateQuiz.questions[qindex].uniqueID);
						}					

					}



					indexBlock.append(buttons)

					simulateQuiz.generatePagination()



					var timerBlock = document.createElement("div");
					timerBlock.id = "timer";
					timerBlock.textContent = '01:00:00';
					indexBlock.appendChild(timerBlock);

					console.log("Unaswered" + numberOfUnaswered);

				} else {
					console.log("Status error: " + ajaxRequest.status);
				}
			} else {
				console.log("Ignored readyState: " + ajaxRequest.readyState);
			}
		};
		ajaxRequest.open('GET', json);
		ajaxRequest.send();
	}
}
