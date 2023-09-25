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
					this.innerHTML = "CERTO";
					this.quiz.stroreAnswer(true, uniqueId);
					
					return;
				}
			}
		}

		const noteElement = document.getElementById('note' + index);
		noteElement.innerHTML = question.notes;
		this.style.background = "#FF0000";
		this.innerHTML = "ERRADO";
		noteDiv.className = "incorrect";
		this.quiz.stroreAnswer(false, uniqueId);



	}
	addQuestion(welcomeDiv,pageBlock,questions,qindex){
		var questionBlock = document.createElement("div");
		questionBlock.className = "questionBlock";
		questionBlock.id = "questionBlock"+qindex;

		var questionCard = document.createElement("div");
		questionCard.className = "questionCard";
		questionCard.id = "questionCardId"+qindex;
		questionBlock.appendChild(questionCard);

		var questiontxt = document.createElement("span");
		questiontxt.className = "question";
		questiontxt.innerHTML = questions.index + 1 + ") " + questions.question
		questionCard.appendChild(questiontxt);

		var answers = document.createElement("div");
		answers.className = "answers";

		var noteBlock = document.createElement("div");
		noteBlock.id = "note" + qindex;
		noteBlock.className = "questionImage";

		let i = 1;
		for (var key of questions.answers) {

			let label = document.createElement("label");

			let input = document.createElement("input");
			input.type = "radio";
			input.value = i;
			input.name = "n" +qindex;

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
			btn.value = qindex;
			btn.quiz = this;
			btn.onclick = this.checkQuestion;
			questionCard.appendChild(btn);

			let starIcon = document.createElement("img");
			starIcon.uniqueID = questions.uniqueID;

			starIcon.existingRecords = this.parts[0];
			if (localStorage && localStorage.getItem(starIcon.existingRecords + "Fav") !== null) {
				const favorites = JSON.parse(localStorage.getItem(starIcon.existingRecords + "Fav")) || [];
				if (favorites.includes(starIcon.uniqueID)) {
					starIcon.src = "images/starfav.png"; // Set the path to your star icon image
				} else {
					starIcon.src = "images/starnotfav.png"; // Set the path to your star icon image
				}
			} else {
				// Handle the case where localStorage is not available or favorites array is null
				starIcon.src = "images/starnotfav.png"; // Set the path to your default star icon image
				localStorage.setItem(starIcon.existingRecords + "Fav", JSON.stringify([]));
			}
			starIcon.value = qindex;
			starIcon.jsonFile=this.jsonFile;



			// Add a click event listener to the star icon
			starIcon.onclick = this.saveFav;

			

			questionCard.appendChild(starIcon);
			}
		}

	showPage() {
		var index = parseInt(this.value);
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
		this.currentPage = index;
	}
}