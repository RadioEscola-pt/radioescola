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



	}
	saveFav() {
		var favorites=JSON.parse(localStorage.getItem(this.existingRecords + "Fav"));
		// Get the unique ID of the question associated with the clicked star
		const index = favorites.indexOf(this.unitqueId);
		if (index === -1) {
			// If not in favorites, add it
			favorites.push(this.unitqueId);
			this.src = "images/starfav.png"; // Set the path to your favorite star icon image
		} else {
			// If already in favorites, remove it
			favorites.splice(index, 1);
			this.src = "images/starnotfav.png"; // Set the path to your regular star icon image
		}

		// Save the updated favorites array back to local storage
		localStorage.setItem(this.existingRecords + "Fav", JSON.stringify(favorites));
		MatomoOptOutManager.update();
	}

}