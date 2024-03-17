class Authentication {
    constructor() {

        this.popup=new Popup("users/login", this);


    }
    endRequest() {

        this.lostPasswordForm = document.getElementById("lost-password-form");

        this.registrationForm = document.getElementById("registration-form");
        this.loginForm = document.getElementById("login-form");
        this.message = document.getElementById("login-message");
        this.showRegistrationFormButton = document.getElementById("show-registration-form");
        this.showRegistrationFormButton.authentication=this;
        this.registrationForm.authentication=this;
        this.loginForm.authentication =this;
        this.lostPasswordButton = document.getElementById("lost-password-button");

                // Bind event handlers
        this.lostPasswordButton.onclick = this.showLostPasswordForm;
        this.showRegistrationFormButton.innerText ="Login";
        this.lostPasswordButton.authentication=this;

        this.showRegistrationFormButton.onclick=this.showRegistrationForm;
        this.registrationForm.addEventListener("submit", this.registerUser);
        this.loginForm.addEventListener("submit", this.authenticateUser.bind(this));


    }


    showLostPasswordForm() {
        // Hide the registration and login forms
        this.authentication.registrationForm.style.display = "none";
        this.authentication.loginForm.style.display = "none";

        // Show the lost password form
        this.authentication.lostPasswordForm.style.display = "block";
        this.authentication.showRegistrationFormButton.innerText = "Login";
    }


    showRegistrationForm() {
        const showRegistrationFormButton = this.authentication.showRegistrationFormButton;
        const loginForm = this.authentication.loginForm;
        const registrationForm = this.authentication.registrationForm;
        const lostPasswordForm = this.authentication.lostPasswordForm;

        if (showRegistrationFormButton.innerText === "Register") {
            // Switch to Login
            showRegistrationFormButton.innerText = "Login";

            registrationForm.style.display = "none";
            loginForm.style.display = "block";
            lostPasswordForm.style.display = "none";

        } else {
            // Switch to Register
            showRegistrationFormButton.innerText = "Register";

            registrationForm.style.display = "block"; 
            loginForm.style.display = "none";
            lostPasswordForm.style.display = "none";
        }


    }

    isEmailValid(email) {
        // Regular expression for validating email format
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailPattern.test(email);
    }

    registerUser(event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        // Check if email is valid
        if (!this.authentication.isEmailValid(email)) {
            this.authentication.message.innerHTML = "Invalid email format.";
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            this.authentication.message.innerHTML = "Passwords do not match.";
            return;
        }

        // Make an AJAX request to the ajax to register the user
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "ajax/register", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {

                    } else {
                        
                    }
                    this.authentication.message.innerHTML = response.message;
                } else {
                    this.message.innerHTML = "Error: " + xhr.status;
                }
            }
        };
        xhr.send(`email=${email}&pass=${password}`);
    }

    authenticateUser(event) {
        event.preventDefault();

        const loginEmail = document.getElementById("login-email").value;
        const loginPassword = document.getElementById("login-password").value;

        if (!this.isEmailValid(loginEmail)) {
            this.authentication.message.innerHTML = "Invalid email format.";
            return;
        }

        // Make an AJAX request to the ajax to authenticate the user
        this.xhr = new XMLHttpRequest();

        this.xhr.open("POST", "ajax/login", true);
        this.xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        this.xhr.onreadystatechange = this.loginReply.bind(this);

                     
        this.xhr.send(`email=${loginEmail}&pass=${loginPassword}`);
    }
    loginReply() {
        if (this.xhr.readyState === 4) {
          if (this.xhr.status === 200) {
            const response = JSON.parse(this.xhr.responseText);
            if (response.success) {
              setTimeout(() => {
                this.popup.closePopup();
                new UserNavBar(response.user);
              }, 1000);

            } else {
              this.message.innerHTML = response.message;
            }
          } else {
            this.message.innerHTML = "Error: " + this.xhr.status;
          }
        }
      }
}