class Popup {
    constructor(chapter, callback = null) {
        const ajaxRequest = new XMLHttpRequest();
        ajaxRequest.loadChapter = this;
        this.createPopup();

        
        ajaxRequest.onreadystatechange = function () {
            if (this.readyState == 4) {
                // The request is completed, now check its status
                if (this.status == 200) {

                    this.loadChapter.popupContent.innerHTML  = this.responseText;

                    // Check if a callback function is provided and not null
                    if (callback && typeof callback.endRequest === "function") {
                        callback.endRequest(); // Execute the endRequest method
                        
                    }
                } else {
                    console.log("Status error: " + ajaxRequest.status);
                }
            } else {
                console.log("Ignored readyState: " + ajaxRequest.readyState);
            }
        };
        
        ajaxRequest.open('GET', 'capitulos/' + chapter + '/index.html');
        ajaxRequest.send();


    }
    createPopup() {
        this.overlay = document.createElement("div");
        this.overlay.className = "overlay";
        this.popup = document.createElement("div");
        this.popup.className = "popup";
        this.closeBtn = document.createElement("span");
        this.closeBtn.className = "close-btn";
        this.closeBtn.innerHTML = "&times;";
        this.closeBtn.onclick = () => this.closePopup();
        this.popupContent = document.createElement("div");

        this.popup.appendChild(this.closeBtn);
        this.popup.appendChild(this.popupContent);

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.popup);

        this.overlay.style.display = "block";
        this.popup.style.display = "block";
        this.isOpen = true;
    }

    closePopup() {
        this.overlay.style.display = "none";
        this.popup.style.display = "none";
        this.isOpen = false;
        window.location.hash = "";

        // Remove overlay and popup from the DOM
        this.overlay.parentNode.removeChild(this.overlay);
        this.popup.parentNode.removeChild(this.popup);
    }


}