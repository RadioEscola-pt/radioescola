class FavQuiz extends Classes([Questions, Storage]) {
  static messagesArray = {};

  static currentPage = 0;
  static test = false;
  constructor(json) {
    super();
    this.jsonFile = json;
    this.pageBlocks = [];
    this.createQuiz();
    this.parts = this.jsonFile.split(".");
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("TEST")) {
      Quiz.test = true;
    }
  }

  createQuiz() {
    var numberOfUnanswered = 0;
    var questionCounter = 0;
    var ajaxRequest = new XMLHttpRequest();
    ajaxRequest.quiz = this;
    ajaxRequest.onreadystatechange = function () {
      if (ajaxRequest.readyState == 4) {
        //the request is completed, now check its status
        if (ajaxRequest.status == 200) {
          //turn JSON into array

          Quiz.messagesArray = JSON.parse(ajaxRequest.responseText);
          this.quiz.questions = Quiz.messagesArray.questions;
          var welcomeDiv = document.getElementById("welcome");

          welcomeDiv.innerHTML = "";
          var indexBlock = document.createElement("div");
          indexBlock.id = "qIndex";

          welcomeDiv.appendChild(indexBlock);
          var index = 0;

          const favoritesString =
            localStorage.getItem(this.quiz.parts[0] + "Fav") || "[]";
          const favorites = JSON.parse(favoritesString);
          for (var qindex in Quiz.messagesArray.questions) {
            if (
              favorites.includes(this.quiz.questions[qindex].uniqueID) == false
            )
              continue;
            var pageBlock;
            Quiz.messagesArray.questions[qindex].index = index;
            index++;
            if (questionCounter == 0) {
              pageBlock = document.createElement("div");
              pageBlock.id = "Page" + questionCounter;
              pageBlock.style.display = "block";
              pageBlock.className = "page";
              let btn = document.createElement("button");
              btn.innerHTML = questionCounter / 10 + 1;
              btn.value = questionCounter;
              btn.onclick = this.quiz.showPage;
              btn.pageBlocks = this.quiz.pageBlocks;
              indexBlock.appendChild(btn);
              this.quiz.pageBlocks.push(pageBlock);
            } else if (questionCounter % 10 == 0) {
              pageBlock = document.createElement("div");
              pageBlock.id = "Page" + questionCounter;
              pageBlock.style.display = "none";
              pageBlock.className = "page";
              let btn = document.createElement("button");
              btn.innerHTML = questionCounter / 10 + 1;
              btn.value = questionCounter;
              btn.onclick = this.quiz.showPage;
              btn.pageBlocks = this.quiz.pageBlocks;
              indexBlock.appendChild(btn);
              this.quiz.pageBlocks.push(pageBlock);
            }
            questionCounter++;
            this.quiz.addQuestion(
              welcomeDiv,
              pageBlock,
              Quiz.messagesArray.questions[qindex],
              qindex,
            );
          }
          console.log("Unanswered" + numberOfUnanswered);
        } else {
          console.log("Status error: " + ajaxRequest.status);
        }
      } else {
        console.log("Ignored readyState: " + ajaxRequest.readyState);
      }
    };
    ajaxRequest.open("GET", this.jsonFile);
    ajaxRequest.send();
  }
  static showFavElement(cat, id) {
    const favorites = JSON.parse(localStorage.getItem(cat + "Fav")); // Parse and handle null/empty array
    const element = document.getElementById(id);

    if (favorites === null || favorites.length === 0) {
      element.style.display = "none"; // Hide the element if favorites is null or empty
    } else {
      element.style.display = "block"; // Show the element if it's in favorites
    }
  }

  static hideFavElement(cat, id) {
    const element = document.getElementById(id);
    element.style.display = "none"; // Hide the element if it's not in favorites
  }
  saveFav() {
    var favorites = JSON.parse(
      localStorage.getItem(this.existingRecords + "Fav"),
    );
    // Get the unique ID of the question associated with the clicked star
    const index = favorites.indexOf(this.uniqueID);
    if (index === -1) {
      // If not in favorites, add it
      favorites.push(this.uniqueID);

      this.src = "images/starfav.png"; // Set the path to your favorite star icon image
    } else {
      // If already in favorites, remove it
      const elements = document.getElementById("questionBlock" + this.value);
      elements.style.display = "none";

      favorites.splice(index, 1);
      this.src = "images/starnotfav.png"; // Set the path to your regular star icon image
      if (favorites.length == 0) {
        new Quiz(this.jsonFile);
      }
    }

    // Save the updated favorites array back to local storage
    localStorage.setItem(
      this.existingRecords + "Fav",
      JSON.stringify(favorites),
    );
    FavQuiz.showFavElement("question3", "favQuiz3");
    FavQuiz.showFavElement("question2", "favQuiz2");
    FavQuiz.showFavElement("question1", "favQuiz1");
  }
}
