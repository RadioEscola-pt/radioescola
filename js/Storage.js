class Storage {
	constructor() {

	}
	
    static storeDarkMode(isDark) {
        // Check if there is an existing record in local storage
        let existingRecords = JSON.parse(localStorage.getItem("DarkMode")) || {};

        // Set the dark mode setting
        existingRecords.isDark = isDark;

        // Save the updated records back to local storage
        localStorage.setItem("DarkMode", JSON.stringify(existingRecords));
    }

    static getDarkMode() {
        // Check if there is an existing record in local storage
        const existingRecords = JSON.parse(localStorage.getItem("DarkMode")) || {};

        // Return the dark mode setting if it exists, or false if not
        return existingRecords.hasOwnProperty("isDark") ? existingRecords.isDark : false;
    }


	storePage(page) {
		// Check if there is an existing record in local storage
		const existingRecords = JSON.parse(localStorage.getItem(this.getfilename())) || {};


		// If a record exists, append the new correctness value to the array
		existingRecords.page = page;


		// Save the updated records back to local storage
		localStorage.setItem(this.getfilename(), JSON.stringify(existingRecords));





	}
	storeFavPage(page)
	{
	
		// Check if there is an existing record in local storage
		const existingRecords = JSON.parse(localStorage.getItem(this.getfilename())) || {};


		// If a record exists, append the new correctness value to the array
		existingRecords.favPage = page;


		// Save the updated records back to local storage
		localStorage.setItem(this.getfilename(), JSON.stringify(existingRecords));




	}
	getfilename() {
		let parts = this.jsonFile.split('.');
		parts = parts[0].split('/');
		const filename = parts[parts.length - 1];
		return filename;
	}


	getStorePage() {

		// Check if there is an existing record in local storage
		const existingRecords = JSON.parse(localStorage.getItem(this.getfilename())) || {};


		if (existingRecords.hasOwnProperty("page")) {
			return existingRecords.page ;

		}

		return 0;



	}

	getStoreFavPage() {
		// Check if there is an existing record in local storage
		const existingRecords = JSON.parse(localStorage.getItem(this.getfilename())) || {};


		if (existingRecords.hasOwnProperty("favPage")) {
			return existingRecords.favPage ;

		}

		return 0;



	}
	storeAnswer(isCorrect, answerId) {
		// Check if there is an existing record in local storage
		const existingRecords = JSON.parse(localStorage.getItem(this.getfilename())) || {};

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
		localStorage.setItem(this.getfilename(), JSON.stringify(existingRecords));



	}
	calculateTruePercentageForQuestion(answerId) {
		const existingRecords = JSON.parse(localStorage.getItem(this.getfilename())) || {};
	
		if (existingRecords.hasOwnProperty(answerId)) {
			const record = existingRecords[answerId];
			const total = record.isCorrect.length;
			const trueCount = record.isCorrect.filter(value => value === true).length;
	
			if (total > 0) {
				const truePercentage = (trueCount / total) * 100;
				return truePercentage.toFixed(2)+"%";
			} else {
				return 'No records available for this question.';
			}
		} else {
			return 'No records available for this question.';
		}
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


}