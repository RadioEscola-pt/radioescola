class Authentication {
    constructor() {
		
		
		const loginShow = document.getElementById("loginShow");
        const loginHide = document.getElementById("loginHide");
        loginShow.onclick=this.openNav;
        loginHide.onclick=this.closeNav;
        this.registrationForm = document.getElementById("registration-form");
        this.loginForm = document.getElementById("login-form");
        this.message = document.getElementById("message");
        this.showRegistrationFormButton = document.getElementById("show-registration-form");
        this.showRegistrationFormButton.authentication=this;
        this.registrationForm.authentication=this;
        this.loginForm.authentication =this;



        this.showRegistrationFormButton.onclick=this.showRegistrationForm;
        this.registrationForm.addEventListener("submit", this.registerUser);
        this.loginForm.addEventListener("submit", this.authenticateUser);
    }
	 openNav() {
	  document.getElementById("login").style.width = "250px";
	}
	
	 closeNav() {
	  document.getElementById("login").style.width = "0";
	}
    showRegistrationForm() {
        this.authentication.registrationForm.style.display = "block";
        this.authentication.showRegistrationFormButton.style.display = "none";
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

        // Make an AJAX request to the server to register the user
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "server/register.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        
                    } else {
                        this.authentication.message.innerHTML = "Registration failed: " + response.message;
                    }
                } else {
                    this.message.innerHTML = "Error: " + xhr.status;
                }
            }
        };
        xhr.send(`email=${email}&password=${password}`);
    }

    authenticateUser(event) {
        event.preventDefault();

        const loginEmail = document.getElementById("login-email").value;
        const loginPassword = document.getElementById("login-password").value;
        
        if (!this.authentication.isEmailValid(loginEmail)) {
            this.authentication.message.innerHTML = "Invalid email format.";
            return;
        }

        // Make an AJAX request to the server to authenticate the user
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "server/login.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        this.authentication.closeNav();
                    } else {
                        this.authentication.message.innerHTML = "Login failed: " + response.message;
                    }
                } else {
                    this.authentication.message.innerHTML = "Error: " + xhr.status;
                }
            }
        };
        xhr.send(`email=${loginEmail}&password=${loginPassword}`);
    }
}


