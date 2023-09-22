class Questions {
		constructor() {

			
		}

	showPage() {
		var index = parseInt(this.value);
		window.scrollTo(0, 0);

		if (index == 0) {

			index = 0;
		} else {
			index = index / 10;
		}
		for (const page of Quiz.pageBlocks) {
			page.style.display = "none";
		}
		Quiz.pageBlocks[index].style.display = "block";
		Quiz.currentPage = index;
	}
}