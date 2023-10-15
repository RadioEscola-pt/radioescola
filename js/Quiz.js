class Quiz extends Classes([Questions,Storage]) {
	static messagesArray = {};

	static currentPage = 0;
	static test = false;
	constructor(json) {
		super();
		this.jsonFile = json;
		this.pageBlocks = [];
		this.parts = this.jsonFile.split('.');
		this.createQuiz();

	}
	showPageWithStorage()
	{
		var index = parseInt(this.value);
		this.pageIndex = index;
		window.scrollTo(0, 0);

		if (index == 0) {

			index = 0;
		} else {
			index = index / 10;
		}
		for (const page of this.pageBlocks) {
			page.style.display = "none";
		}
		this.pageBlocks[index].style.display = "block";
		this.quiz.storePage(index);
		if (document.querySelector('#qIndex button.bg-slate-400')) {
			document.querySelector('#qIndex button.bg-slate-400').classList.replace('bg-slate-400', 'bg-slate-300');
		}
		this.className = 'bg-slate-400 hover:bg-slate-400 p-2 rounded cursor-pointer';
	}



	createQuiz() {

		var numberOfUnanswered = 0;
		var questionCounter = 0;
		var ajaxRequest = new XMLHttpRequest();
		ajaxRequest.quiz = this;
		ajaxRequest.onreadystatechange = function() {

			if (ajaxRequest.readyState == 4) {
				//the request is completed, now check its status
				if (ajaxRequest.status == 200) {
					//turn JSON into array
					let storedPage=this.quiz.getStorePage();
	


					Quiz.messagesArray = JSON.parse(ajaxRequest.responseText);
					this.quiz.questions = Quiz.messagesArray.questions;
					var welcomeDiv = document.getElementById("welcome");
					welcomeDiv.innerHTML = "";
					var indexBlock = document.createElement("div");
					indexBlock.id = "qIndex";
					indexBlock.className = "max-w-screen-md m-auto list-none m-0 p-2 rounded mb-5 overflow-x-scroll overflow-y-hidden bg-slate-200 dark:bg-slate-600 sticky flex items-center justify-start top-[10px] gap-[5px]";

					welcomeDiv.appendChild(indexBlock);
					var index = 0;
					for (var qindex in Quiz.messagesArray.questions) {
						var pageBlock;
						Quiz.messagesArray.questions[qindex].index = index;
						index++;
						 if ((questionCounter % 10 == 0) || (questionCounter == 0) ) {
							pageBlock = document.createElement("div");
							pageBlock.id = "Page" + questionCounter;
							pageBlock.style.display = "none";
							pageBlock.className = 'page';
							let btn = document.createElement("button");
							btn.innerHTML = questionCounter / 10 + 1;
							btn.className = "bg-slate-300 hover:bg-slate-400 p-2 rounded cursor-pointer";
							let currentPageIndex=0;
							if (questionCounter == 0) {

								currentPageIndex = 0;
							} else {
								currentPageIndex = questionCounter / 10;
							}
							if (storedPage==currentPageIndex)
							{
								btn.classList.replace('bg-slate-300', 'bg-slate-400');
							}

							btn.value = questionCounter;
							btn.onclick = this.quiz.showPageWithStorage;
							btn.pageBlocks=this.quiz.pageBlocks; 
							btn.quiz=this.quiz;
							indexBlock.appendChild(btn);
							this.quiz.pageBlocks.push(pageBlock);
						}
						questionCounter++;
						this.quiz.addQuestion(welcomeDiv,pageBlock,Quiz.messagesArray.questions[qindex],qindex);
						

						

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



}