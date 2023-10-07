class Storage {
	constructor() {

	}


	storePage(page) {
		const parts = this.jsonFile.split('.');
		// Check if there is an existing record in local storage
		const existingRecords = JSON.parse(localStorage.getItem(parts[0])) || {};


		// If a record exists, append the new correctness value to the array
		existingRecords.page = page;


		// Save the updated records back to local storage
		localStorage.setItem(parts[0], JSON.stringify(existingRecords));





	}
	storeFavPage(page)
	{
		const parts = this.jsonFile.split('.');
		// Check if there is an existing record in local storage
		const existingRecords = JSON.parse(localStorage.getItem(parts[0])) || {};


		// If a record exists, append the new correctness value to the array
		existingRecords.favPage = page;


		// Save the updated records back to local storage
		localStorage.setItem(parts[0], JSON.stringify(existingRecords));




	}

	getStorePage() {
		const parts = this.jsonFile.split('.');
		// Check if there is an existing record in local storage
		const existingRecords = JSON.parse(localStorage.getItem(parts[0])) || {};


		if (existingRecords.hasOwnProperty("page")) {
			return existingRecords.page ;

		}

		return 0;



	}

	getStoreFavPage() {
		const parts = this.jsonFile.split('.');
		// Check if there is an existing record in local storage
		const existingRecords = JSON.parse(localStorage.getItem(parts[0])) || {};


		if (existingRecords.hasOwnProperty("favPage")) {
			return existingRecords.favPage ;

		}

		return 0;



	}
	storeAnswer(isCorrect, answerId) {
		const parts = this.jsonFile.split('.');
		// Check if there is an existing record in local storage
		const existingRecords = JSON.parse(localStorage.getItem(parts[0])) || {};

		// Check if a record already exists for the answerId
		if (existingRecords.hasOwnProperty(answerId)) {
			// If a record exists, append the new correctness value to the array
			existingRecords[answerId].isCorrect.push(isCorrect);
		} else {
			// If no record exists, create a new one with an array containing the initial value
			existingRecords[answerId] = {
				isCorrect: [isCorrect],
			};
		}

		// Save the updated records back to local storage
		localStorage.setItem(parts[0], JSON.stringify(existingRecords));



	}
	plotAnswers(answers) {

		const canvasDiv = document.getElementById('answerDisplay');
		canvasDiv.style.display = 'block'; // Show the canvas div
		canvasDiv.onclick = function () {
			canvasDiv.style.display = 'none';
		}

		const canvas = document.getElementById('canvas');
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const trueColor = 'green';
		const falseColor = 'red';

		const answerWidth = 30; // Width of each answer box
		const spacing = 10; // Spacing between answer boxes

		let x = 10;
		let y = 10;

		for (const answer of answers) {
			const color = answer ? trueColor : falseColor;

			ctx.fillStyle = color;
			ctx.fillRect(x, y, answerWidth, answerWidth);

			x += answerWidth + spacing;

			// Move to the next row if the canvas width is reached
			if (x + answerWidth > canvas.width) {
				x = 10;
				y += answerWidth + spacing;
			}
		}
	}

	saveFav() {
		var favorites = JSON.parse(localStorage.getItem(this.existingRecords + "Fav"));
		// Get the unique ID of the question associated with the clicked star
		var index = -1;
		if (favorites == null) {
			favorites = [];
		}
		else {
			index = favorites.indexOf(this.uniqueID);
		}
		if (index === -1) {
			// If not in favorites, add it
			favorites.push(this.uniqueID);
			this.src = "images/starfav.png"; // Set the path to your favorite star icon image
		} else {
			// If already in favorites, remove it
			favorites.splice(index, 1);
			this.src = "images/starnotfav.png"; // Set the path to your regular star icon image
		}

		// Save the updated favorites array back to local storage
		localStorage.setItem(this.existingRecords + "Fav", JSON.stringify(favorites));
		FavQuiz.showFavElement("question3", "favQuiz3");
		FavQuiz.showFavElement("question2", "favQuiz2");
		FavQuiz.showFavElement("question1", "favQuiz1");

	}

}