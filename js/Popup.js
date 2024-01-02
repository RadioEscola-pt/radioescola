class Popup {
    constructor(chapter=null, callback = null) {
        const ajaxRequest = new XMLHttpRequest();

        this.createPopup();
        if (chapter != null) {

            ajaxRequest.loadChapter = this;
            ajaxRequest.onreadystatechange = function () {
                if (this.readyState == 4) {
                    // The request is completed, now check its status
                    if (this.status == 200) {

                        this.loadChapter.popupContent.innerHTML = this.responseText;

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

            ajaxRequest.open('GET',   chapter + '/index.html');
            ajaxRequest.send();
        }



    }
    loadToPopup(data) {
        this.popupContent.append(data);
    }
    createPopup() {
        this.overlay = document.createElement("div");
        this.overlay.className = "w-full h-full fixed top-0 left-0 z-50 bg-black bg-opacity-50"; 
        this.popup = document.createElement("div");
        this.popup.className = "w-full h-fit sm:w-1/2 fixed top-0 sm:top-1/4 sm:left-1/4 z-50 bg-gray-50 rounded-lg shadow-lg p-8 shadow-lg dark:bg-slate-800";
        this.closeBtn = document.createElement("span");
        this.closeBtn.className = "flex justify-end cursor-pointer absolute top-2 right-2";
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
    clearPopup()
    {
        this.popupContent.innerHTML="";
        this.popupContent.remove();
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