class Storage {
	constructor() {

		}


	stroreAnswer(isCorrect, answerId) {
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

		this.plotAnswers(existingRecords[answerId].isCorrect);

	}

}