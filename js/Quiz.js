class Quiz extends Classes([Questions, Storage]) {
  static messagesArray = {};

  static currentPage = 0;
  static test = false;
  constructor(json) {
    super();
    this.jsonFile = json;
    this.pageBlocks = [];
    this.parts = this.jsonFile.split(".");
    this.createQuiz();
    const searchParams = new URLSearchParams(window.location.search);
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
          for (var qindex in Quiz.messagesArray.questions) {
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
              indexBlock.appendChild(btn);
              btn.pageBlocks = this.quiz.pageBlocks;
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
}
