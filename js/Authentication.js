class Authentication {
    constructor() {
		
		
		const loginShow = document.getElementById("loginShow");
        const loginHide = document.getElementById("loginHide");
        this.lostPasswordForm = document.getElementById("lost-password-form");
        loginShow.onclick=this.openNav;
        loginHide.onclick=this.closeNav;
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
        this.showRegistrationFormButton.innerText ="Register";
        this.lostPasswordButton.authentication=this;



        this.showRegistrationFormButton.onclick=this.showRegistrationForm;
        this.registrationForm.addEventListener("submit", this.registerUser);
        this.loginForm.addEventListener("submit", this.authenticateUser);
        this.logoutButton = document.getElementById("logout-button");
        this.logoutButton.onclick = this.logout;
        this.logoutButton.authentication=this;


        this.checkSession();
    }
    logout() {
        // Make an AJAX request to destroy the session
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "server/logout.php", true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Session destroyed successfully
                document.getElementById("logout-container").style.display = "none";
                const showRegistrationFormButton = this.authentication.showRegistrationFormButton;
                const loginForm = this.authentication.loginForm;
                const registrationForm = this.authentication.registrationForm;
                const lostPasswordForm = this.authentication.lostPasswordForm;            
              
                showRegistrationFormButton.innerText = "Login";
                registrationForm.style.display = "none";
                loginForm.style.display = "block";
                lostPasswordForm.style.display = "none";

                
            }
        };
        xhr.send();
    }
    checkSession() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "server/check_session.php", true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        // Session is valid
                        alert("User ID: " + response.user_id + "\nEmail: " + response.email);
                        document.getElementById("logout-container").style.display = "block";
                        this.showRegistrationFormButton.style.display = "none";
                        this.loginForm.style.display = "none";
                        this.registrationForm.style.display = "none";
                        this.lostPasswordForm.style.display = "none";
                        this.lostPasswordButton.style.display = "none";
                    } else {
                        // Session is not valid
                        document.getElementById("logout-container").style.display = "none";
                        alert("Session is not valid or has expired.");
                    }
                } else {
                    // Handle AJAX error
                    alert("Error: " + xhr.status);
                }
            }
        };
        xhr.send();
    }
	 openNav() {
	  document.getElementById("login").style.width = "250px";
	}
	
	 closeNav() {
	  document.getElementById("login").style.width = "0";
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
                        this.authentication.showRegistrationFormButton.style.display = "none";
                        this.authentication.loginForm.style.display = "none";
                        this.authentication.registrationForm.style.display = "none";
                        this.authentication.lostPasswordForm.style.display = "none";
                        this.authentication.lostPasswordButton.style.display = "none";
                        document.getElementById("logout-container").style.display = "block";
                        alert("User ID: " + response.user_id + "\nEmail: " + response.email);

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


