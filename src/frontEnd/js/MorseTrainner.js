class MorseCodeTrainer {
    constructor(isMorseToLetter) {
        this.welcomeDiv = document.getElementById('welcome');
        this.morseCodeMap = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
            'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
            'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..'
        };
        this.lettersFrequency = ['E', 'A', 'O', 'S', 'R', 'I', 'N', 'D', 'M', 'T', 'U', 'C', 'L', 'P', 'V', 'G', 'H', 'Q', 'B', 'F', 'Z', 'J', 'X', 'K', 'W', 'Y'];
        this.clearWelcomeDiv();
        this.request = document.createElement('div');
        this.welcomeDiv.appendChild(this.request);
        if (isMorseToLetter) {
            this.generateMorseToLetterForm();
        } else {
            this.generateLetterToMorseForm();
        }
        
    }


    generateMorseToLetterForm() {


        const form = this.createForm('Click for Morse Code:', 'Morse Code Here', 'Convert');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const morseInput = this.elements['textInput'].value;
            this.convertMorseToLetter(morseInput);
        });

        const clickArea = this.createClickArea();
        form.insertBefore(clickArea, form.firstChild);
        this.welcomeDiv.appendChild(form);

        this.setupFeedbackArea();
    }

    generateLetterToMorseForm() {

        

        const form = this.createForm('Enter a Letter:', 'Letter', 'Convert');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const letterInput = form.elements['textInput'].value.toUpperCase();
            this.convertLetterToMorse(letterInput);
        });

        

        
        this.welcomeDiv.appendChild(form);
        

        this.setupFeedbackArea();
    }

    createForm(labelText, inputPlaceholder, buttonText) {
        

        const form = document.createElement('form');
        const label = document.createElement('label');
        label.textContent = labelText;
        form.appendChild(label);
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'textInput';
        input.placeholder = inputPlaceholder;
        input.required = true;
        form.appendChild(input);
        const button = document.createElement('button');
        button.type = 'submit';
        button.textContent = buttonText;
        form.appendChild(button);
        return form;
    }
    getRandomLetter() {
        const index = Math.floor(Math.random() * this.lettersFrequency.length);
        this.randomLetter=this.lettersFrequency[index];
        this.randomMorse= this.morseCodeMap[this.randomLetter];
    }


    createClickArea() {
         this.getRandomLetter();
        this.request.innerHTML ="FInd this letter "+ this.randomLetter;

        const clickArea = document.createElement('div');
        clickArea.textContent = 'Click here (right click for "-", left click for ".")';
        clickArea.style.border = '1px solid black';
        clickArea.style.padding = '10px';
        clickArea.style.marginBottom = '10px';
        clickArea.style.cursor = 'pointer';
        clickArea.morseCode=this;
        clickArea.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.appendToInput('-');
            const morseInput = document.getElementById('textInput').value;
            this.checkMorseInput(morseInput);
            
            

            


        });
        clickArea.addEventListener('click', (event) => {
            event.preventDefault();
            this.appendToInput('.');
            const morseInput = document.getElementById('textInput').value;
            this.checkMorseInput(morseInput);

        });

        return clickArea;
    }
    checkMorseInput(morseInput) {
        
        if (this.randomMorse.startsWith(morseInput)) {
            if (this.randomMorse === morseInput) {
                // Exact match
                this.displayFeedback("Correct! Great job.");
                // Display a new random letter for the next try

            } else {
                // Correct so far, but incomplete
                this.displayFeedback("So far so good! Keep going.");
            }
        } else {
            // Incorrect or too long
            this.displayFeedback(`Incorrect. The correct Morse for ${this.randomLetter} is ${this.expectedMorse}. Let's try a new one.`);

        }
    }
    appendToInput(char) {
        const input = document.getElementById('textInput');
        input.value += char;
    }

    setupFeedbackArea() {
        const morseCodeDiv = document.createElement('div');
        morseCodeDiv.id = 'morseCode';
        this.welcomeDiv.appendChild(morseCodeDiv);

        const feedbackDiv = document.createElement('div');
        feedbackDiv.id = 'feedback';
        this.welcomeDiv.appendChild(feedbackDiv);
    }

    clearWelcomeDiv() {
        this.welcomeDiv.innerHTML = '';
    }

    convertMorseToLetter(morseCode) {
        const morseToLetter = Object.entries(this.morseCodeMap).reduce((acc, [letter, code]) => {
            acc[code] = letter;
            return acc;
        }, {});

        const letters = morseCode.split(' ').map(code => morseToLetter[code] || '?').join('');
        this.displayFeedback(letters);
    }

    convertLetterToMorse(letter) {
        const morseCode = this.morseCodeMap[letter];
        this.displayFeedback(morseCode ? morseCode : '?');
    }

    displayFeedback(message) {
        const feedbackDiv = document.getElementById('feedback');
        feedbackDiv.innerHTML = ''; // Clear previous feedback
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        feedbackDiv.appendChild(messageDiv);
    }
}


