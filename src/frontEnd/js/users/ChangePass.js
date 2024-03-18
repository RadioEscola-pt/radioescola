class ChangePass {
    constructor() {

        this.popup = new Popup("users/PassChange", this);


    }
    endRequest() {

        this.form = document.getElementById("changePasswordForm");
        this.messageContainer = document.getElementById("message");
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(event) {
        event.preventDefault();
        const newPassword = this.form.querySelector('[name="newPassword"]').value;
        const confirmNewPassword = this.form.querySelector('[name="confirmNewPassword"]').value;

        if (newPassword !== confirmNewPassword) {
            this.messageContainer.textContent = 'New passwords do not match.';
            return;
        }

        const formData = new FormData(this.form);
        const encodedData = new URLSearchParams(formData).toString();

        this.sendRequest(encodedData);
    }

    sendRequest(data) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/ajax/changePassword', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                this.messageContainer.textContent = response.message;
                if (response.success) {
                    this.form.reset();
                }
            } else {
                console.log('Error changing password:', xhr.statusText);
            }
        };

        xhr.onerror = () => {
            console.log('Request failed');
        };

        xhr.send(data);
    }
}

// Usage
