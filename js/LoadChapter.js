class LoadChapter {
    constructor(chapter, callback = null) {
        const ajaxRequest = new XMLHttpRequest();
        ajaxRequest.loadChapter = this;
        
        ajaxRequest.onreadystatechange = function () {
            if (this.readyState == 4) {
                // The request is completed, now check its status
                if (this.status == 200) {
                    var welcomeDiv = document.getElementById("welcome");
                    welcomeDiv.innerHTML = this.responseText;

                    // Check if a callback function is provided and not null
                    if (callback && typeof callback === "function") {
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
}