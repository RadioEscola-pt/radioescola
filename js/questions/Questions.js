class Questions {
  constructor() {
    this.hideOnUnselect = false;
    this.filename = "";
  }
  checkQuestion() {
    const index = parseInt(this.value);
    const question = Quiz.messagesArray.questions[index];
    const answer = question.correctIndex;
    const elements = document.getElementsByName("n" + index);
    var uniqueId = question.uniqueID;
    let infoDiv = document.getElementById("infoDiv" + uniqueId);

    for (let i = 0; i < elements.length; i++) {
      if (elements[i].checked) {
        if (answer - 1 === i) {
          this.className = "bg-green-500 text-white p-2 mt-2 rounded w-52 hidden";
          this.parentElement.querySelector("span.text-lg").classList.add("text-green-400");
          this.parentElement.querySelector("span.text-lg").classList.remove("text-red-400");
          this.parentElement.parentElement.classList.add("border-green-400");
          this.parentElement.parentElement.classList.remove("border-red-400");
          this.innerHTML = "CERTO";
          this.quiz.storeAnswer(true, uniqueId);
          this.quiz.loadQuestionInfo(infoDiv, question)


            const nextQuestion = document.getElementById("questionBlock" + (index + 1));
            if (nextQuestion) {
              this.parentElement.parentElement.classList.add("animate-correct");
              setTimeout(() => {

                // Blink the entire this.parentElement.parentElement
                
                  this.parentElement.parentElement.classList.remove("animate-correct");


                nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 500);
            }
          

          return;
        }
      }
    }

    if (question.notes != "Notas") {
      const noteElement = document.getElementById("note" + index);
      noteElement.className = "bg-slate-200 text-slate-900 p-2 mt-2 rounded";
      noteElement.innerHTML = question.notes;
    }

    
    this.innerHTML = "ERRADO";
    this.className = "bg-red-200 text-red-900 p-2 mt-2 rounded w-52 hidden";
    this.parentElement.querySelector("span.text-lg").classList.add("text-red-400");
    this.parentElement.querySelector("span.text-lg").classList.remove("text-green-400");
    this.parentElement.parentElement.classList.add("border-red-400");
    this.parentElement.parentElement.classList.remove("border-green-400");

    this.quiz.storeAnswer(false, uniqueId);
    this.quiz.loadQuestionInfo(infoDiv, question)
  }
  /**
   * Adds a question to the page.
   *
   * @param {HTMLElement} welcomeDiv - The welcome div element.
   * @param {HTMLElement} pageBlock - The page block element.
   * @param {Array} questions - The array of questions.
   * @param {number} qindex - The index of the question.
   */
  addQuestion(welcomeDiv, pageBlock, questions, qindex, exitOnEmptyFav=false) {
    var questionBlock = document.createElement("div");
    questionBlock.className =
      "scroll-m-20 max-w-screen-md m-auto p-6 mb-8 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700";
    questionBlock.id = "questionBlock" + qindex;

    var questionCard = document.createElement("div");
    questionCard.className = "questionCard";
    questionCard.id = "questionCardId" + qindex;
    questionBlock.appendChild(questionCard);

    var questiontxt = document.createElement("span");
    questiontxt.className = "text-lg md:text-xl font-bold";
    questiontxt.innerHTML = questions.index + 1 + ") " + questions.question;
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
      btn.className =
        "hidden md:hidden mt-8 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-sky-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800";
      btn.value = qindex;
      btn.quiz = this;
      btn.onclick = this.checkQuestion;
      questionCard.appendChild(btn);
      this.addStar(questionCard, qindex, questions.uniqueID,exitOnEmptyFav);

      // Add onchange to radio buttons to auto-verify
      answers.querySelectorAll('input[type="radio"]').forEach(input => {
        input.onchange = () => btn.click();
      });
    }
    let infoDiv = document.createElement("div");
    infoDiv.className = "questionInfo border-t-1 border-gray-100 pt-2 items-center flex flex-row gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400";
    infoDiv.id = "infoDiv" + questions.uniqueID;
    this.loadQuestionInfo(infoDiv, questions);
    questionCard.appendChild(infoDiv);

  }
  LinkFontes(fontes, infoDiv) {
    const updatedBaseUrl = `exams`; // Construct the updated base URL

    const linksContainer = document.createElement('div'); // Create a div to hold links
    linksContainer.style.display = 'none'; // Initially hide the container

    for (let i = 0; i < fontes.length; i++) {
      const source = fontes[i];
      const parts = source.split('p');

      if (parts.length === 2) {
        const pdffileName = parts[0] + '.pdf';
        const urlLink = `${updatedBaseUrl}/${pdffileName}`;

        const link = document.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('href', urlLink);
        link.textContent = "Exame " + parts[0] + " Pergunta " + parts[1];

        const br = document.createElement('br'); // Create a line break element

        linksContainer.appendChild(link); // Append link to the container
        linksContainer.appendChild(br); // Append line break to create a new line

      } else {
        console.log(`Invalid source format: ${source}`);
      }
    }

    const toggle = infoDiv.querySelector('.checked');

    // Show/hide functionality when clicked
    toggle.addEventListener('click', () => {
      if (linksContainer.style.display === 'none') {
        linksContainer.style.display = 'block';
      } else {
        linksContainer.style.display = 'none';
      }
    });

    // infoDiv.appendChild(toggle); // Append the show/hide text to the provided infoDiv
    infoDiv.appendChild(linksContainer); // Append the container to the provided infoDiv
  }

  showPageWithStorage() {
    const index = parseInt(this.value, 10);
    if (Number.isNaN(index)) {
      return;
    }

    this.pageIndex = index;
    window.scrollTo(0, 0);

    const pageSize = this.quiz && this.quiz.questionsPerPage ? this.quiz.questionsPerPage : 10;
    const maxIndex = this.pageBlocks.length - 1;
    const normalizedIndex = Math.max(0, Math.min(Math.floor(index / pageSize), maxIndex));

    this.pageBlocks.forEach(page => page.style.display = "none");
    if (this.pageBlocks[normalizedIndex]) {
      this.pageBlocks[normalizedIndex].style.display = "block";
    }

    if (this.quiz) {
      this.quiz.currentPage = normalizedIndex;
    }

    if (this.quiz.constructor.name === 'FavQuiz') {
      this.quiz.storeFavPage(normalizedIndex);
    }
    else if (this.quiz.constructor.name === 'Quiz') {
      this.quiz.storePage(normalizedIndex);

    } else if (this.quiz.constructor.name === 'SimulateQuiz') {
      this.quiz.currentPage = parseInt(normalizedIndex);
      this.quiz.generatePagination();
      
    }

    if (typeof this.quiz.renderPagination === 'function') {
      this.quiz.renderPagination(normalizedIndex);
      return;
    }

    const button = document.querySelector('#qIndex button.bg-slate-400');
    if (button) {
      button.classList.replace('bg-slate-400', 'bg-slate-300');
      button.classList.replace('dark:bg-slate-800', 'dark:bg-slate-700');
    }

    this.className = 'bg-slate-400 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-900 p-2 rounded cursor-pointer';
  }

  checkedStatusIcon(source){
    if (source != null) {
      return `<span title="Confirmada em ${source.length} exames" class="inline text-slate-400 dark:text-white cursor-pointer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="inline w-5 h-5 checked">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M3.37752 5.08241C3 5.62028 3 7.21907 3 10.4167V11.9914C3 17.6294 7.23896 20.3655 9.89856 21.5273C10.62 21.8424 10.9807 22 12 22C13.0193 22 13.38 21.8424 14.1014 21.5273C16.761 20.3655 21 17.6294 21 11.9914V10.4167C21 7.21907 21 5.62028 20.6225 5.08241C20.245 4.54454 18.7417 4.02996 15.7351 3.00079L15.1623 2.80472C13.595 2.26824 12.8114 2 12 2C11.1886 2 10.405 2.26824 8.83772 2.80472L8.26491 3.00079C5.25832 4.02996 3.75503 4.54454 3.37752 5.08241ZM15.0595 10.4995C15.3353 10.1905 15.3085 9.71642 14.9995 9.44055C14.6905 9.16467 14.2164 9.19151 13.9405 9.50049L10.9286 12.8739L10.0595 11.9005C9.78358 11.5915 9.30947 11.5647 9.00049 11.8405C8.69151 12.1164 8.66467 12.5905 8.94055 12.8995L10.3691 14.4995C10.5114 14.6589 10.7149 14.75 10.9286 14.75C11.1422 14.75 11.3457 14.6589 11.488 14.4995L15.0595 10.4995Z" fill="currentColor"/>
        </svg>
      </span>`;
    } else {
      return '<img title="Sem confirmação" src="./images/icons/shield-cross.svg" class="inline w-5 h-5" alt="Unchecked">';
    }
  }

  correctAnswersBadge(percentage) {
    let badgeColor;

    if (percentage >= 90) {
      badgeColor = 'bg-lime-400';
    } else if (percentage >= 75) {
      badgeColor = 'bg-yellow-400';
    } else {
      badgeColor = 'bg-red-400';
    }
    if (percentage === undefined) {
      return
    }
    return `<span title="Percentagem de vezes que acertou a resposta." class="inline-block px-2 py-1 text-xs text-white ${badgeColor} rounded-full">${percentage}%</span>`;
  }

  loadQuestionInfo(infoDiv, questions, showPercentage = true) {
    // Clear existing content
    infoDiv.innerHTML = '';

    const uniqueID = questions.uniqueID;
    const fonte = questions.fonte;
    const checkedIcon = this.checkedStatusIcon(fonte);
    const confirmationText = checkedIcon

    if (!showPercentage) {
      infoDiv.innerHTML = `<p class="text-xs">ID ${uniqueID}</p>${confirmationText}`;
    } else {
      const percentage = this.calculateTruePercentageForQuestion(uniqueID);
      infoDiv.innerHTML = `<p class="text-xs">ID ${uniqueID}</p>${confirmationText}`;

      if (percentage !== undefined) {
        infoDiv.innerHTML += this.correctAnswersBadge(percentage);
      }

      if (fonte != null) {
        this.LinkFontes(fonte, infoDiv);
      }

      if (questions.calc != null) {
        const calcLink = document.createElement('a');
        calcLink.className = "inline text-slate-400 dark:text-white cursor-pointer";
        calcLink.href = `#${questions.calc}`;
        calcLink.title = "Abrir calculadora";
        const calcIcon = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
        <svg width="20" height="20" class="inline w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22ZM8.75 6.49998C8.75 6.08576 8.41421 5.74998 8 5.74998C7.58579 5.74998 7.25 6.08576 7.25 6.49998L7.25 7.74999H6C5.58579 7.74999 5.25 8.08578 5.25 8.49999C5.25 8.91421 5.58579 9.24999 6 9.24999L7.25 9.24999V10.5C7.25 10.9142 7.58579 11.25 8 11.25C8.41421 11.25 8.75 10.9142 8.75 10.5V9.24999H10C10.4142 9.24999 10.75 8.91421 10.75 8.49999C10.75 8.08578 10.4142 7.74999 10 7.74999H8.75L8.75 6.49998ZM14 7.74998C13.5858 7.74998 13.25 8.08576 13.25 8.49998C13.25 8.91419 13.5858 9.24998 14 9.24998H18C18.4142 9.24998 18.75 8.91419 18.75 8.49998C18.75 8.08576 18.4142 7.74998 18 7.74998H14ZM14 13.75C13.5858 13.75 13.25 14.0858 13.25 14.5C13.25 14.9142 13.5858 15.25 14 15.25H18C18.4142 15.25 18.75 14.9142 18.75 14.5C18.75 14.0858 18.4142 13.75 18 13.75H14ZM7.03033 13.9697C6.73744 13.6768 6.26256 13.6768 5.96967 13.9697C5.67678 14.2626 5.67678 14.7374 5.96967 15.0303L6.93935 16L5.96968 16.9697C5.67679 17.2626 5.67679 17.7374 5.96968 18.0303C6.26258 18.3232 6.73745 18.3232 7.03034 18.0303L8.00001 17.0607L8.96966 18.0303C9.26255 18.3232 9.73742 18.3232 10.0303 18.0303C10.3232 17.7374 10.3232 17.2626 10.0303 16.9697L9.06067 16L10.0303 15.0303C10.3232 14.7374 10.3232 14.2626 10.0303 13.9697C9.73744 13.6768 9.26256 13.6768 8.96967 13.9697L8.00001 14.9393L7.03033 13.9697ZM14 16.75C13.5858 16.75 13.25 17.0858 13.25 17.5C13.25 17.9142 13.5858 18.25 14 18.25H18C18.4142 18.25 18.75 17.9142 18.75 17.5C18.75 17.0858 18.4142 16.75 18 16.75H14Z" fill="currentColor"/>
        </svg>`
        calcLink.innerHTML = calcIcon;
        infoDiv.appendChild(calcLink);
        infoDiv.appendChild(document.createElement('br'));
      }
    }

    if (questions.tutorial != null) {
      const tutorialLink = document.createElement('a');
      tutorialLink.href = `?LoadChapter=${questions.tutorial}`;
      tutorialLink.target = '_blank';
      tutorialLink.textContent = 'Abrir Tutorial';
      infoDiv.appendChild(tutorialLink);
    }
  }

  /**
   * Adds a star icon to a question card.
   *
   * @param {object} questionCard - The question card DOM element.
   * @param {number} qindex - The index of the question.
   * @param {string} uniqueID - The unique ID of the star icon.
   */
  addStar(questionCard, qindex, uniqueID, exitOnEmptyFav) {
    let starIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    starIcon.setAttribute('viewBox', '0 0 24 24');
    starIcon.setAttribute('stroke', '#fcd34d');
    starIcon.existingRecords = this.filename;

    if (MatomoOptOutManager.hasConsent()) {
      starIcon.uniqueID = uniqueID;
      starIcon.setAttribute('class', 'w-6 h-6 block fill-[#fefce8] dark:fill-slate-700');
      const favorites =
        JSON.parse(localStorage.getItem(starIcon.existingRecords + "Fav")) ||
        [];

      starIcon.innerHTML = `
		
		<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
		
		`;

      if (favorites.includes(starIcon.uniqueID)) {
        starIcon.setAttribute('class', 'w-6 h-6 block fill-[#fcd34d]');
      }

      starIcon.value = qindex;
      starIcon.jsonFile = this.jsonFile;
      starIcon.hideOnUnselect = this.hideOnUnselect;
      starIcon.exitOnEmptyFav=exitOnEmptyFav;
      
      // Add a click event listener to the star icon
      starIcon.onclick = this.saveFav;
      
      var cardFooter = document.createElement("div");
      cardFooter.className = "flex justify-end";
      cardFooter.appendChild(starIcon);
      questionCard.appendChild(cardFooter);
    }
  }


  saveFav() {
    // Retrieve the favorites array from local storage
    var favoritesJSON = localStorage.getItem(this.existingRecords + "Fav");
    var favorites = favoritesJSON ? JSON.parse(favoritesJSON) : [];

    // Get the unique ID of the question associated with the clicked star
    const index = favorites.indexOf(this.uniqueID);

    if (index === -1) {
      // If not in favorites, add it
      favorites.push(this.uniqueID);
      this.setAttribute('class', 'w-6 h-6 block fill-[#fcd34d]');
    } else {
      // If already in favorites, remove it
      const elements = document.getElementById("questionBlock" + this.value);
      if (elements != null) {
        if (this.hideOnUnselect == true) elements.style.display = "none";
      }

      favorites.splice(index, 1);
      this.setAttribute('class', 'w-6 h-6 block fill-[#fefce8]');
      if (favorites.length === 0 && this.exitOnEmptyFav==true) {
        new Quiz(this.jsonFile);
      }
    }

    // Save the updated favorites array back to local storage
    localStorage.setItem(
      this.existingRecords + "Fav",
      JSON.stringify(favorites)
    );

    // Call the showFavElement function for specific HTML elements
    FavQuiz.showFavElement("question3", "favQuiz3");
    FavQuiz.showFavElement("question2", "favQuiz2");
    FavQuiz.showFavElement("question1", "favQuiz1");
  }
}
