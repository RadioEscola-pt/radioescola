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
                    const linksWithLinkedDiv = document.querySelectorAll('a[linkedDiv]');

                    linksWithLinkedDiv.forEach(function(link) {
                        link.addEventListener("click", function (event) {
                            event.preventDefault(); // Prevent the link from navigating
                            const linkedDivId = link.getAttribute("linkedDiv");
                            const specialDiv = document.getElementById(linkedDivId);
                
                            if (specialDiv.style.display === "none" || specialDiv.style.display === "") {
                                specialDiv.style.display = "block";
                            } else {
                                specialDiv.style.display = "none";
                            }
                        });
                    });

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
}