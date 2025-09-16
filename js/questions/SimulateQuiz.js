window.timers = [];
class SimulateQuiz extends  Classes([Questions,Storage])  {

	static UNANSWERED = 0;
	static CORRECT = 1;
	static INCORRECT = -0.25;
	static COUNTER_TIMEOUT = 60 * 60;
	static questions = new Object();
	static PER_PAGE = 10;
	static QUESTION_AMOUNT = 40;



	checkTimer(simulateQuiz) {
		var counterDiv = document.getElementById("timer");
		if (counterDiv == null) {
			window.clearTimeout(SimulateQuiz.timer);
			return;
		}
		
		counterDiv.innerHTML = new Date(simulateQuiz.timeout * 1000).toISOString().slice(11, 19);
		simulateQuiz.timeout--;
		if (simulateQuiz.timeout < 0) {
			simulateQuiz.checkQuestions();

		}
	}
	stoptimer()
	{
		this.simulateQuiz.timeout=0;
	}

		generatePagination() {
		const paginationContainer = document.querySelector('#pagination');
		if (!paginationContainer) {
			return;
		}

		paginationContainer.innerHTML = '';

		const totalPages = this.numberOfPages();
		if (totalPages === 0) {
			return;
		}

		const safePage = Math.max(0, Math.min(this.currentPage, totalPages - 1));
		this.currentPage = safePage;
		const pageSize = this.questionsPerPage || SimulateQuiz.PER_PAGE;

		const createButton = (label, pageIndex, options = {}) => {
			const { isActive = false, isDisabled = false } = options;
			const button = document.createElement('button');
			button.type = 'button';
			button.innerText = label;
			button.value = pageIndex * pageSize;
			button.pageBlocks = this.pageBlocks;
			button.quiz = this;

			if (isDisabled) {
				button.disabled = true;
				button.className = 'bg-slate-200 text-slate-500 p-2 rounded cursor-not-allowed dark:bg-slate-700 dark:text-slate-300';
			} else {
				button.onclick = this.showPageWithStorage;
				button.className = isActive ? 'block aspect-square bg-slate-500 text-white dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-900 p-2 rounded cursor-pointer' : 'bg-slate-300 hover:bg-slate-400 p-2 rounded cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-800';
			}

			paginationContainer.appendChild(button);
		};

		const isAtStart = safePage === 0;
		const previousPage = Math.max(safePage - 1, 0);
		// createButton('Start', 0, { isDisabled: isAtStart });
		// createButton('Back', previousPage, { isDisabled: isAtStart });


		const pagesAround = typeof this.paginationWindow === 'number' ? Math.max(0, this.paginationWindow) : 3;
		const startPage = Math.max(safePage - pagesAround, 0);
		const endPage = Math.min(safePage + pagesAround, totalPages - 1);

		for (let page = startPage; page <= endPage; page++) {
			createButton(page + 1, page, { isActive: page === safePage });
		}

		const isAtEnd = safePage === totalPages - 1;
		const nextPage = Math.min(safePage + 1, totalPages - 1);
		// createButton('Next', nextPage, { isDisabled: isAtEnd });
		// createButton('Last', totalPages - 1, { isDisabled: isAtEnd });

		const spacer = document.createElement('div');
		spacer.style.display = 'flex';
		spacer.style.flex = 1;
		paginationContainer.append(spacer);

		const finishButton = document.createElement('button');
		finishButton.innerHTML = 'Finalizar';
		finishButton.className = 'bg-lime-50 hover:bg-lime-200 px-4 rounded shadow text-lime-700 font-bold cursor-pointer';
		finishButton.onclick = this.stoptimer;
		finishButton.simulateQuiz = this;
		finishButton.id = 'submitQuiz';
		paginationContainer.appendChild(finishButton);
	}

	numberOfPages() {
		return this.pageBlocks.length
	}

	checkQuestions() {
		var answers = Array();
		window.clearTimeout(this.timer);
		for (var questionIndex in this.questions) {
			let uID=this.questions[questionIndex].uniqueID;
			var elements = document.getElementsByName("n" + uID);
			answers[questionIndex] = SimulateQuiz.UNANSWERED;
			var noteDiv = document.getElementById("note" + uID);

			for (var i = 0; i < elements.length; i++) {

				if (elements[i].checked) {
					const correctIndex = parseInt(this.questions[questionIndex].correctIndex);
					if (correctIndex == i + 1) {
						answers[questionIndex] = SimulateQuiz.CORRECT;
						this.storeAnswer(true, this.questions[questionIndex].uniqueID);
					} else {
						answers[questionIndex] = SimulateQuiz.INCORRECT;
						elements[i].parentElement.style.color = '#7F1D1D';
						elements[correctIndex - 1].parentElement.style.color = '#22C55E';
						this.storeAnswer(false, this.questions[questionIndex].uniqueID);
					}

				}
				else
				{
					this.storeAnswer(false, this.questions[questionIndex].uniqueID);
				}
			}
			if (answers[questionIndex] != SimulateQuiz.CORRECT) {
				noteDiv.innerHTML = "Resposta certa: " + this.questions[questionIndex].correctIndex;
				noteDiv.className = "incorrect";
				noteDiv.innerHTML += "<br>" + this.questions[questionIndex].notes;

				noteDiv.parentElement.parentElement.parentElement.style.border = '1px solid #aa1d1d'
				elements[parseInt(this.questions[questionIndex].correctIndex - 1)].parentElement.style.color = '#22C55E';
			}

		}
		var total = 0;
		for (var answer of answers) {
			total += answer;

		}
		const modalId = 'simulateQuizResultModal';
		const existingModal = document.getElementById(modalId);
		if (existingModal) {
			existingModal.remove();
		}

		const formattedScore = Math.round(total * 100) / 100;
		const scoreText = Number.isInteger(formattedScore) ? formattedScore.toString() : formattedScore.toFixed(2);

		const answeredCount = this.questions.length - answers.filter(a => a === SimulateQuiz.UNANSWERED).length;
		const modalHTML = `
			<div id="${modalId}" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/80 backdrop-blur-md shadow-lg" role="dialog" aria-modal="true">
				<div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 max-w-md w-full text-center space-y-4">
					<h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Resultado do Exame</h2>
					<p class="text-4xl font-semibold ${scoreText >= 20 ? 'text-lime-500' : 'text-red-500'}">${scoreText}/40</p>
					<p class="text-md text-gray-600 dark:text-gray-400">Respondeu a <span class="font-semibold">${answeredCount}</span> de <span class="font-semibold">${this.questions.length}</span> perguntas. <br/> Necessário para aprovação: 20 pontos.</p>
					<table class="min-w-full divide-y divide-gray-200">
						<thead>
							<tr>
								<th class="px-4 py-2 text-left text-sm font-medium text-gray-500">Resposta</th>
								<th class="px-4 py-2 text-left text-sm font-medium text-gray-500">Pontuação</th>
							</tr>
						</thead>
						<tbody class="bg-white divide-y divide-gray-200">
							<tr>
								<td class="px-4 py-2 text-sm text-gray-700 text-left">Correta</td>
								<td class="px-4 py-2 text-sm text-gray-700 text-left">+1 ponto</td>
							</tr>
							<tr>
								<td class="px-4 py-2 text-sm text-gray-700 text-left">Errada</td>
								<td class="px-4 py-2 text-sm text-gray-700 text-left">-0.25 pontos</td>
							</tr>
							<tr>
								<td class="px-4 py-2 text-sm text-gray-700 text-left">Sem Resposta</td>
								<td class="px-4 py-2 text-sm text-gray-700 text-left">0 pontos</td>
							</tr>
						</tbody>
					</table>
					<button type="button" class="inline-flex items-center justify-center rounded-md bg-lime-600 px-5 py-2 font-semibold text-white hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 mt-4 transition duration-200" onclick="document.getElementById('${modalId}').remove();">Fechar</button>
				</div>
			</div>
		`;

		document.body.insertAdjacentHTML('beforeend', modalHTML);
		submitQuiz.style.display = "none";

	}

	constructor(json) {
		super();
		this.jsonFile=json;
		this.filename = this.getfilename();
		var numberOfUnaswered = 0;
		var questionCounter = 0;
		this.pageBlocks = []
		this.currentPage = 0;
		this.questionsPerPage = SimulateQuiz.PER_PAGE;
		this.paginationWindow = 3;
		var ajaxRequest = new XMLHttpRequest();
		ajaxRequest.simulateQuiz=this;
		ajaxRequest.pageBlocks = this.pageBlocks;
		ajaxRequest.onreadystatechange = function() {

			if (ajaxRequest.readyState == 4) {
				//the request is completed, now check its status
				if (ajaxRequest.status == 200) {
					//turn JSON into array

					var allMessagesArray = JSON.parse(ajaxRequest.responseText);
					allMessagesArray = allMessagesArray.questions;
					var randomQ = [];
					for (let i = 0; i < SimulateQuiz.QUESTION_AMOUNT; i++) {
						var questionIndex = Math.floor(Math.random() * allMessagesArray.length);
						randomQ.push(allMessagesArray[questionIndex]);
						allMessagesArray.splice(questionIndex, 1);
					}
					this.simulateQuiz.questions = randomQ;
					var welcomeDiv = document.getElementById("welcome");
					welcomeDiv.innerHTML = "";
					var indexBlock = document.createElement("div");
					indexBlock.id = "qIndex";
					indexBlock.className = "max-w-screen-md m-auto list-none m-0 p-2 rounded mb-5 overflow-x-scroll overflow-y-hidden bg-slate-200 dark:bg-slate-600 sticky flex items-center justify-between top-[10px] gap-[10px]";

					let buttons = document.createElement('div')
					buttons.id = 'pagination'
					buttons.className = 'flex w-full gap-[5px]'

					welcomeDiv.appendChild(indexBlock);
					var index = 0;
					for (var qindex in randomQ) {
						var pageBlock;
						randomQ[qindex].index = index;
						index++;
						if (questionCounter == 0) {
							pageBlock = document.createElement("div");
							pageBlock.className = "page active";
							pageBlock.dataset.page =  questionCounter / SimulateQuiz.PER_PAGE + 1;
							pageBlock.style.display = "block";

							this.pageBlocks.push(pageBlock);

						} else if (questionCounter % 10 == 0) {
							pageBlock = document.createElement("div");
							pageBlock.className = "page";
							pageBlock.dataset.page =  questionCounter / SimulateQuiz.PER_PAGE + 1;
							pageBlock.style.display = "none";

							this.pageBlocks.push(pageBlock);
						}
						questionCounter++;

						var questionBlock = document.createElement("div");
						questionBlock.className = "max-w-screen-md m-auto p-6 mb-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700";

						var questionCard = document.createElement("div");
						questionCard.className = "questionCard";
						questionBlock.appendChild(questionCard);

						var questiontxt = document.createElement("span");
						questiontxt.className = "text-xl font-bold";
						questiontxt.innerHTML = index+ ") " + this.simulateQuiz.questions[qindex].question
						questionCard.appendChild(questiontxt);

						var answers = document.createElement("div");
						answers.className = "flex flex-col mt-5 leading-normal";

						var noteBlock = document.createElement("div");
						noteBlock.id = "note" + this.simulateQuiz.questions[qindex].uniqueID;
						noteBlock.className = "questionImage";

						let i = 1;
						for (let key of this.simulateQuiz.questions[qindex].answers) {
							let label = document.createElement("label");

							let input = document.createElement("input");
							input.type = "radio";
							input.value = i;
							input.name = "n" + this.simulateQuiz.questions[qindex].uniqueID;
							input.className = "mr-4";

							label.appendChild(input);
							label.innerHTML += key;

							answers.appendChild(label);
							i++;
						}

						questionCard.appendChild(answers);
						this.simulateQuiz.addStar( questionCard,qindex, this.simulateQuiz.questions[qindex].uniqueID);
						pageBlock.appendChild(questionBlock);

						if (this.simulateQuiz.questions[qindex].img) {
							var image = document.createElement("img");
							image.className = "questionImage";
							image.src = this.simulateQuiz.questions[qindex].img;
							questionBlock.appendChild(image);
						} else {

						}


						welcomeDiv.appendChild(pageBlock);

						answers.appendChild(noteBlock);
						if (this.simulateQuiz.questions[qindex].correctIndex == null) {
							console.log("ERROR Q" + this.simulateQuiz.questions[qindex].uniqueID);
						}
						if (this.simulateQuiz.questions[qindex].notes == null) {
							console.log("ERROR Q" + this.simulateQuiz.questions[qindex].uniqueID);
						}
						let infoDiv=document.createElement("div");
						infoDiv.className = "questionInfo items-center flex flex-row gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400";
						infoDiv.id="infoDiv"+this.simulateQuiz.questions[qindex].uniqueID;
						this.simulateQuiz.loadQuestionInfo(infoDiv, this.simulateQuiz.questions[qindex], false);
						questionCard.appendChild(infoDiv);					

					}

					indexBlock.append(buttons);
					this.simulateQuiz.generatePagination();

					var timerBlock = document.createElement("div");
					timerBlock.id = "timer";
					timerBlock.textContent = '01:00:00';
					timerBlock.className = "font-mono text-lg";
					indexBlock.appendChild(timerBlock);

					//console.log("Unanswered" + numberOfUnaswered);
					this.simulateQuiz.timeout = SimulateQuiz.COUNTER_TIMEOUT;
					
					window.timers.forEach(element => {
						window.clearInterval(element);
					});

					this.simulateQuiz.timer = window.setInterval(this.simulateQuiz.checkTimer, 1000,this.simulateQuiz);
					window.timers.push(this.simulateQuiz.timer)

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
