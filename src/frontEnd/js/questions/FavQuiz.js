class FavQuiz extends Classes([Questions, Storage]) {
	static messagesArray = {};

	static currentPage = 0;
	static test = false;
	constructor(json) {
		super();
		this.jsonFile = json;
		this.pageBlocks = [];


		super.hideOnUnselect = true;
		this.createQuiz();

	}

	createQuiz() {

		var numberOfUnanswered = 0;
		var questionCounter = 0;
		var ajaxRequest = new XMLHttpRequest();
		ajaxRequest.quiz = this;
		ajaxRequest.onreadystatechange = function () {

			if (ajaxRequest.readyState == 4) {
				//the request is completed, now check its status
				if (ajaxRequest.status == 200) {
					//turn JSON into array


					Quiz.messagesArray = JSON.parse(ajaxRequest.responseText);
					this.quiz.questions = Quiz.messagesArray.questions;
					var welcomeDiv = document.getElementById("welcome");

					welcomeDiv.innerHTML = "";
					var indexBlock = document.createElement("div");
					indexBlock.id = "qIndex";
					indexBlock.className = "list-none m-0 p-2 rounded mb-5 overflow-x-scroll overflow-y-hidden bg-slate-200 sticky flex items-center justify-between top-[10px] gap-[10px]";

					welcomeDiv.appendChild(indexBlock);
					var index = 0;
					let storedPage = this.quiz.getStoreFavPage();

					const favorites = this.quiz.getFavQuestions();
					for (var qindex in Quiz.messagesArray.questions) {
						if (favorites.includes(this.quiz.questions[qindex].uniqueID) == false) continue;
						var pageBlock;
						Quiz.messagesArray.questions[qindex].index = index;
						index++;
						if ((questionCounter % 10 == 0) || (questionCounter == 0)) {
							pageBlock = document.createElement("div");
							pageBlock.id = "Page" + questionCounter;
							pageBlock.style.display = "none";
							pageBlock.className = 'page';
							let btn = document.createElement("button");
							btn.innerHTML = questionCounter / 10 + 1;
							btn.className = "bg-slate-300 hover:bg-slate-400 p-2 rounded cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-800";
							btn.value = questionCounter;
							let currentPageIndex = 0;
							if (questionCounter == 0) {

								currentPageIndex = 0;
							} else {
								currentPageIndex = questionCounter / 10;
							}
							if (storedPage == currentPageIndex) {
								btn.classList.replace('bg-slate-300', 'bg-slate-400');
								btn.classList.replace('dark:bg-slate-700', 'dark:bg-slate-800');
							}

							btn.onclick = this.quiz.showPageWithStorage;
							btn.pageBlocks = this.quiz.pageBlocks;
							indexBlock.appendChild(btn);
							this.quiz.pageBlocks.push(pageBlock);
							btn.quiz = this.quiz;
						}
						questionCounter++;
						this.quiz.addQuestion(welcomeDiv, pageBlock, Quiz.messagesArray.questions[qindex], qindex);


					}

					for (const page of this.quiz.pageBlocks) {
						page.style.display = "none";
					}
					this.quiz.pageBlocks[storedPage].style.display = "block";

					console.log("Unanswered" + numberOfUnanswered);

				} else {
					console.log("Status error: " + ajaxRequest.status);
				}
			} else {
				console.log("Ignored readyState: " + ajaxRequest.readyState);
			}
		};
		ajaxRequest.open('GET', this.jsonFile);
		ajaxRequest.send();
	}
	static showFavElement(cat, id) {

		const favorites = Storage.getFavQuestions(cat); // Parse and handle null/empty array
		const element = document.getElementById(id);

		if (favorites === null || favorites.length === 0) {
			element.style.display = "none"; // Hide the element if favorites is null or empty
		} else {
			element.style.display = "block"; // Show the element if it's in favorites
		}

	}

	static hideFavElement(cat, id) {
		const element = document.getElementById(id);
		element.style.display = "none"; // Hide the element if it's not in favorites


	}


}