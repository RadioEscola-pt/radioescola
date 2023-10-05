
class LoadChapter {


    constructor(chapter ) {
        const ajaxRequest = new XMLHttpRequest();
        ajaxRequest.loadChapter=this;
        ajaxRequest.onreadystatechange = function () {

            if (this.readyState == 4) {
                //the request is completed, now check its status
                if (this.status == 200) {
                    //turn JSON into array

                    var welcomeDiv = document.getElementById("welcome");
                    welcomeDiv.innerHTML =this.responseText;


                   

                } else {
                    console.log("Status error: " + ajaxRequest.status);
                }
            } else {
                console.log("Ignored readyState: " + ajaxRequest.readyState);
            }
        };
        ajaxRequest.open('GET', 'capitulos/'+chapter+'/index.html');
        ajaxRequest.send();
    }

}
