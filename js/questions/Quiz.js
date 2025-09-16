class Quiz extends Classes([Questions, Storage]) {
	static messagesArray = {};

	static currentPage = 0;
	static test = false;
	constructor(json) {
		super();
		this.jsonFile = json;
		this.pageBlocks = [];
		this.questionsPerPage = 10;
		this.paginationWindow = 2;
		this.filename = this.getfilename();
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
					let storedPage = this.quiz.getStorePage();



					Quiz.messagesArray = JSON.parse(ajaxRequest.responseText);
					this.quiz.questions = Quiz.messagesArray.questions;
					var welcomeDiv = document.getElementById("welcome");
					welcomeDiv.innerHTML = "";
					var indexBlock = document.createElement("div");
					indexBlock.id = "qIndex";
					indexBlock.className = "max-w-screen-md m-auto list-none m-0 p-2 rounded mb-5 overflow-x-scroll overflow-y-hidden bg-slate-200 dark:bg-slate-600 sticky flex items-center justify-start top-[10px] gap-[5px]";

					welcomeDiv.appendChild(indexBlock);
					this.quiz.indexBlock = indexBlock;
					var index = 0;
					let currentPageBlock = null;
					for (var qindex in Quiz.messagesArray.questions) {
						Quiz.messagesArray.questions[qindex].index = index;
						index++;
						if ((questionCounter % this.quiz.questionsPerPage == 0) || (questionCounter == 0)) {
							currentPageBlock = document.createElement("div");
							currentPageBlock.id = "Page" + questionCounter;
							currentPageBlock.style.display = "none";
							currentPageBlock.className = 'page';
							this.quiz.pageBlocks.push(currentPageBlock);
						}
						questionCounter++;
						this.quiz.addQuestion(welcomeDiv, currentPageBlock, Quiz.messagesArray.questions[qindex], qindex);
					}

					const totalPages = this.quiz.pageBlocks.length;
					if (totalPages === 0) {
						return;
					}

					if (typeof storedPage !== "number" || Number.isNaN(storedPage)) {
						storedPage = 0;
					}

					if (storedPage >= totalPages) {
						storedPage = totalPages - 1;
					}

					if (storedPage < 0) {
						storedPage = 0;
					}

					this.quiz.currentPage = storedPage;

					for (const page of this.quiz.pageBlocks) {
						page.style.display = "none";
					}
					this.quiz.pageBlocks[storedPage].style.display = "block";
					this.quiz.renderPagination(storedPage);

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

		renderPagination(currentPage = 0) {
		const indexBlock = this.indexBlock || document.getElementById("qIndex");
		if (!indexBlock) {
			return;
		}

		const totalPages = this.pageBlocks.length;
		if (totalPages === 0) {
			indexBlock.innerHTML = "";
			return;
		}

		const pageSize = this.questionsPerPage || 10;
		const safePage = Math.max(0, Math.min(currentPage, totalPages - 1));
		this.currentPage = safePage;

		indexBlock.innerHTML = "";

		const createButton = (label, pageIndex, options = {}) => {
			const { isActive = false, isDisabled = false } = options;
			const button = document.createElement("button");
			button.type = "button";
			button.innerHTML = label;
			button.value = pageIndex * pageSize;
			button.pageBlocks = this.pageBlocks;
			button.quiz = this;

			if (isDisabled) {
				button.disabled = true;
				button.className = "bg-slate-200 text-slate-500 p-2 rounded cursor-not-allowed dark:bg-slate-700 dark:text-slate-300";
			} else {
				button.onclick = this.showPageWithStorage;
				button.className = isActive ? "bg-slate-400 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-900 p-2 rounded cursor-pointer" : "bg-slate-300 hover:bg-slate-400 p-2 rounded cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-800";
			}

			indexBlock.appendChild(button);
		};

		const isAtStart = safePage === 0;
		const previousPage = Math.max(safePage - 1, 0);
		createButton("Start", 0, { isDisabled: isAtStart });
		createButton("Back", previousPage, { isDisabled: isAtStart });

		const pagesAround = typeof this.paginationWindow === "number" ? Math.max(0, this.paginationWindow) : 3;

		const startPage = Math.max(safePage - pagesAround, 0);
		const endPage = Math.min(safePage + pagesAround, totalPages - 1);

		for (let page = startPage; page <= endPage; page++) {
			createButton(page + 1, page, { isActive: page === safePage });
		}

		const isAtEnd = safePage === totalPages - 1;
		const nextPage = Math.min(safePage + 1, totalPages - 1);
		createButton("Next", nextPage, { isDisabled: isAtEnd });
		createButton("Last", totalPages - 1, { isDisabled: isAtEnd });
	}



}
