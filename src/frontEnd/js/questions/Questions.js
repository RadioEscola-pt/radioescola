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
          this.style.background = "#00FF00";
          this.style.color = "#000000";
          this.innerHTML = "CERTO";
          this.quiz.storeAnswer(true, uniqueId);
          this.quiz.loadQuestionInfo(infoDiv, question)

          return;
        }
      }
    }

    const noteElement = document.getElementById("note" + index);
    noteElement.innerHTML = question.notes;
    this.style.background = "#FF0000";
    this.innerHTML = "ERRADO";
    noteElement.className = "bg-red-200 text-red-900 p-2 mt-2";
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
  addQuestion(welcomeDiv, pageBlock, questions, qindex) {
    var questionBlock = document.createElement("div");
    questionBlock.className =
      "max-w-screen-md m-auto p-6 mb-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700";
    questionBlock.id = "questionBlock" + qindex;

    var questionCard = document.createElement("div");
    questionCard.className = "questionCard";
    questionCard.id = "questionCardId" + qindex;
    questionBlock.appendChild(questionCard);

    var questiontxt = document.createElement("span");
    questiontxt.className = "text-xl font-bold";
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
        "inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-sky-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800";
      btn.value = qindex;
      btn.quiz = this;
      btn.onclick = this.checkQuestion;
      questionCard.appendChild(btn);
      this.addStar(questionCard, qindex, questions.uniqueID);

    }
    let infoDiv = document.createElement("div");
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

    const showText = document.createElement('span'); // Create a text element to show/hide
    showText.textContent = 'Mostrar exames'; // Text to display

    // Show/hide functionality when clicked
    showText.addEventListener('click', () => {
      if (linksContainer.style.display === 'none') {
        linksContainer.style.display = 'block';
        showText.textContent = 'Esconder exames'; // Change text when shown
      } else {
        linksContainer.style.display = 'none';
        showText.textContent = 'Mostrar exames'; // Change text when hidden
      }
    });

    infoDiv.appendChild(showText); // Append the show/hide text to the provided infoDiv
    infoDiv.appendChild(linksContainer); // Append the container to the provided infoDiv
  }

  showPageWithStorage() {
    const index = parseInt(this.value);
    this.pageIndex = index;
    window.scrollTo(0, 0);

    const normalizedIndex = index == 0 ? 0 : index / 10;
    this.pageBlocks.forEach(page => page.style.display = "none");
    this.pageBlocks[normalizedIndex].style.display = "block";


    const button = document.querySelector('#qIndex button.bg-slate-400');
    if (this.quiz.constructor.name === 'FavQuiz') {
      this.quiz.storeFavPage(normalizedIndex);
    }
    else if (this.quiz.constructor.name === 'Quiz') {
      this.quiz.storePage(normalizedIndex);

    } else if (this.quiz.constructor.name === 'SimulateQuiz') {
      this.quiz.currentPage = parseInt(normalizedIndex);
      this.quiz.generatePagination();
      
    }




    if (button) {
      button.classList.replace('bg-slate-400', 'bg-slate-300');
      button.classList.replace('dark:bg-slate-800', 'dark:bg-slate-700');
    }

    this.className = 'bg-slate-400 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-900 p-2 rounded cursor-pointer';
  }

  loadQuestionInfo(infoDiv, questions, showPercentage = true) {
    if (showPercentage == false) {
      if (questions.fonte != null) {
        infoDiv.innerHTML = "ID:" + questions.uniqueID + "Confirmada em  " + questions.fonte.length;
        //this.LinkFontes(questions.fonte, infoDiv);

      }
      else {
        infoDiv.innerHTML = "ID:" + questions.uniqueID + "Em 0 exames ";
      }


      
    }
    else
    {
      if (questions.fonte != null) {
        infoDiv.innerHTML = "<p>ID:" + questions.uniqueID + " Confirmada em " + questions.fonte.length + " exames</p><p> Acertou:" + this.calculateTruePercentageForQuestion(questions.uniqueID) + "</p>";
        this.LinkFontes(questions.fonte, infoDiv);
      }
      else {
        infoDiv.innerHTML = "<p>ID:" + questions.uniqueID + "Sem confirmacao </p><p> Acertou:" + this.calculateTruePercentageForQuestion(questions.uniqueID) + "</p>";
      }
      if (questions.calc != null) {
        let link = "#" + questions.calc;
        let linkElement = document.createElement("a");
        linkElement.href = link;
        linkElement.textContent = "Abrir Calculadora";
        infoDiv.appendChild(linkElement);
        infoDiv.appendChild(document.createElement("br"));
      }
    }
    if (questions.tutorial != null) {
      let link = "?LoadChapter=" + questions.tutorial;
      let linkElement = document.createElement("a");
      linkElement.href = link;
      linkElement.target = "_blank";
      linkElement.textContent = "Abrir Tutorial";
      infoDiv.appendChild(linkElement);
    }

    


  }

  /**
   * Adds a star icon to a question card.
   *
   * @param {object} questionCard - The question card DOM element.
   * @param {number} qindex - The index of the question.
   * @param {string} uniqueID - The unique ID of the star icon.
   */
  addStar(questionCard, qindex, uniqueID) {
    let starIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    starIcon.setAttribute('viewBox', '0 0 24 24');
    starIcon.setAttribute('stroke', '#fcd34d');
    starIcon.existingRecords = this.filename;

    if (MatomoOptOutManager.hasConsent()) {
      starIcon.uniqueID = uniqueID;
      starIcon.setAttribute('class', 'w-6 h-6 block fill-[#fefce8] dark:fill-slate-700');
      const favorites = this.getFavQuestions();

      starIcon.innerHTML = `
		
		<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
		
		`;

      if (favorites.includes(starIcon.uniqueID)) {
        starIcon.setAttribute('class', 'w-6 h-6 block fill-[#fcd34d]');
      }

      starIcon.value = qindex;
      starIcon.jsonFile = this.jsonFile;
      starIcon.hideOnUnselect = this.hideOnUnselect;
      starIcon.question=this;
      // Add a click event listener to the star icon
      starIcon.onclick = this.saveFav;
      //questionCard.appendChild(starIcon);
      var cardFooter = document.createElement("div");
      cardFooter.className = "flex justify-end";
      cardFooter.appendChild(starIcon);
      questionCard.appendChild(cardFooter);
    }
  }


  saveFav() {
    // Retrieve the favorites array from local storage

    var favorites =this.question.getFavQuestions();

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
      if (favorites.length === 0) {
        new Quiz(this.jsonFile);
      }
    }

    // Save the updated favorites array back to local storage
    this.question.saveFavQuestions(favorites);

    // Call the showFavElement function for specific HTML elements
    FavQuiz.showFavElement("question3", "favQuiz3");
    FavQuiz.showFavElement("question2", "favQuiz2");
    FavQuiz.showFavElement("question1", "favQuiz1");
  }
}
