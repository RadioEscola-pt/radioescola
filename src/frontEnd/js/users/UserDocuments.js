class UserDocuments {
    constructor() {
        this.popup = new Popup("users/UserDocuments", this);
    }

    endRequest() {
        this.form = document.getElementById("uploadForm");
        this.messageContainer = document.getElementById("message");

        // Attach the event listener to the form
        this.form.addEventListener('submit', (e) => this.uploadDocument(e));
    }

    uploadDocument(e) {
        e.preventDefault(); // Prevent the default form submission

        const formData = new FormData(this.form);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/uploadDocument', true); // Adjust the URL to your API endpoint

        // Set up the callback for when the request completes
        xhr.onload = () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {

                } else {
                    
                }       

                this.messageContainer.textContent = response.message;

            } else {
                // Handle error
                this.messageContainer.textContent = 'Error uploading document';
            }
        };

        // Handle network errors
        xhr.onerror = () => {
            this.messageContainer.textContent = 'Network error during upload';
        };

        // Send the form data
        xhr.send(formData);
    }
}