class Questions {
	constructor() {


	}
	checkQuestion() {
		const index = parseInt(this.value);
		const question = Quiz.messagesArray.questions[index];
		const answer = question.correctIndex;
		const elements = document.getElementsByName('n' + index);
		var uniqueId = question.uniqueID;

		for (let i = 0; i < elements.length; i++) {
			if (elements[i].checked) {
				if (answer - 1 === i) {
					this.style.background = "#00FF00";
					this.style.color = "#000000";
					this.innerHTML = "CERTO";
					this.quiz.storeAnswer(true, uniqueId);

					return;
				}
			}
		}

		const noteElement = document.getElementById('note' + index);
		noteElement.innerHTML = question.notes;
		this.style.background = "#FF0000";
		this.innerHTML = "ERRADO";
		noteElement.className = "bg-red-200 text-red-900 p-2 mt-2";
		this.quiz.storeAnswer(false, uniqueId);



	}
	addQuestion(welcomeDiv, pageBlock, questions, qindex) {
		var questionBlock = document.createElement("div");
		questionBlock.className = "max-w-screen-md m-auto p-6 mb-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700";
		questionBlock.id = "questionBlock" + qindex;

		var questionCard = document.createElement("div");
		questionCard.className = "questionCard";
		questionCard.id = "questionCardId" + qindex;
		questionBlock.appendChild(questionCard);

		var questiontxt = document.createElement("span");
		questiontxt.className = "text-xl font-bold";
		questiontxt.innerHTML = questions.index + 1 + ") " + questions.question
		questionCard.appendChild(questiontxt);

		var answers = document.createElement("div");
		answers.className = "flex flex-col mt-5 leading-normal";

		var noteBlock = document.createElement("div");
		noteBlock.id = "note" + qindex;
		noteBlock.className = "questionImage";

		let i = 1;
		for (var key of questions.answers) {

			let label = document.createElement("label");

			let input = document.createElement("input");
			input.type = "radio";
			input.value = i;
			input.name = "n" + qindex;
			input.className = "mr-4";

			label.appendChild(input);
			label.innerHTML += key;

			answers.appendChild(label);
			i++;
		}

		questionCard.appendChild(answers);
		pageBlock.appendChild(questionBlock);

		if (questions.img) {
			var image = document.createElement("img");
			image.className = "questionImage";
			image.src = questions.img;
			questionBlock.appendChild(image);
		} else {

		}


		welcomeDiv.appendChild(pageBlock);

		questionCard.appendChild(noteBlock);
		if (questions.correctIndex == null) {
			console.log("ERROR Q" + questions.uniqueID);
		}
		if (questions.notes == null) {
			console.log("ERROR Q" + questions.uniqueID);
		}

		if (Quiz.messagesArray.questions[qindex].correctIndex == 0) {
			let notAvailble = document.createElement("div");
			notAvailble.innerHTML = "resposta Indisponivel";
			questionBlock.appendChild(notAvailble);
			console.log(questions.numb);
			numberOfUnanswered++;
		} else {

			let btn = document.createElement("button");
			btn.innerHTML = "Verificar";
			btn.className = "inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-sky-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
			btn.value = qindex;
			btn.quiz = this;
			btn.onclick = this.checkQuestion;
			questionCard.appendChild(btn);

			let starIcon = document.createElement("img");
			starIcon.existingRecords = this.parts[0];


			if (MatomoOptOutManager.hasConsent()) {

				starIcon.uniqueID = questions.uniqueID;
				starIcon.style.float = "right";
				const favorites = JSON.parse(localStorage.getItem(starIcon.existingRecords + "Fav")) || [];

				if (favorites.includes(starIcon.uniqueID)) {
					starIcon.src = "images/starfav.png"; // Set the path to your star icon image
				} else {
					starIcon.src = "images/starnotfav.png"; // Set the path to your star icon image
				}
				starIcon.value = qindex;
				starIcon.jsonFile = this.jsonFile;
				// Add a click event listener to the star icon
				starIcon.onclick = this.saveFav;
				questionCard.appendChild(starIcon);
			}

		}
	}

	showPage() {
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
	

	}
}