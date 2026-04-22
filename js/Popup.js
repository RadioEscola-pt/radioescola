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
        this.overlay.className = "w-full h-full fixed top-0 left-0 z-50 bg-black/60 backdrop-blur-sm";
        this.overlay.onclick = () => this.closePopup();

        this.popup = document.createElement("div");
        this.popup.className = "w-full h-fit max-h-[90vh] overflow-y-auto sm:w-1/2 fixed top-0 sm:top-1/4 sm:left-1/4 z-50 bg-gray-50 rounded-lg shadow-xl p-8 pt-12 dark:bg-slate-800";
        this.popup.onclick = (e) => e.stopPropagation();

        this.closeBtn = document.createElement("button");
        this.closeBtn.setAttribute("aria-label", "Fechar");
        this.closeBtn.type = "button";
        this.closeBtn.className = "absolute top-3 right-3 w-9 h-9 inline-flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 transition cursor-pointer";
        this.closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
        this.closeBtn.onclick = () => this.closePopup();

        this.popupContent = document.createElement("div");

        this.popup.appendChild(this.closeBtn);
        this.popup.appendChild(this.popupContent);

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.popup);

        this.overlay.style.display = "block";
        this.popup.style.display = "block";
        this.isOpen = true;

        this._onKeyDown = (e) => {
            if (e.key === "Escape" && this.isOpen) this.closePopup();
        };
        document.addEventListener("keydown", this._onKeyDown);
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

        if (this._onKeyDown) {
            document.removeEventListener("keydown", this._onKeyDown);
            this._onKeyDown = null;
        }

        this.overlay.parentNode.removeChild(this.overlay);
        this.popup.parentNode.removeChild(this.popup);
    }


}