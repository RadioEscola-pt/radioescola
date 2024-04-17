class UserEmailResponse {
    constructor(userId, key, action) {
        this.userId = userId;
        this.key = key;
        this.apiUrl = action;
        this.popup = new Popup();
        this.sendRequest();
    }

    sendRequest() {
        const xhr = new XMLHttpRequest();
                // Encode your data into a query string format
                const data = this.encodeFormData({
                    userId: this.userId,
                    key: this.key
                });
        xhr.open('GET', this.apiUrl+ '?' + data, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    this.handleResponse(JSON.parse(xhr.responseText));
                } else {
                    this.handleError(xhr.statusText);
                }
            }
        };



        xhr.send();
    }

    encodeFormData(data) {
        const params = [];
        for (let key in data) {
            params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        return params.join('&');
    }

    handleResponse(data) {
        // Handle the server response
        
            console.log( data.message);
            this.popup.loadToPopup(data.message);
            

    }

    handleError(error) {
        // Handle any errors during the AJAX operation
        console.error('Request failed:', error);
    }
}
