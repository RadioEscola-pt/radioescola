class Init {
    constructor() {
        this.initEventListeners();
        this.load();
    }

    initEventListeners() {
        window.addEventListener("hashchange", () => this.hashChecker());

    }

    hashChecker() {
        const fragment = window.location.hash;

        if (fragment) {
            const cleanFragment = fragment.substring(1);
            this.loadComponent(cleanFragment);
        }
    }

    loadComponent(cleanFragment) {
        switch (cleanFragment) {
            case "COPADDER":
                new ComponentAdderCalculator();
                break;
            case "OHMCALC":
                new OhmsLawCalculator();
                break;
            case "REACTANCE":
                new ReactanceCalculator();
                break;
            case "TRANSFORMER":
                new TransformerCalculator();
                break;
            case "RLC":
                new RLCBridgeCalculator();
                break;
            case "QFACTOR":
                new QCalculator();
                break;
            case "VSWRC":
                new VSWRCalculator();
                break;
            case "RLCRESS":
                new ResonanceCalculator();
                break;
            case "GAIN":
                new GainCalculator();
                break;


            default:
                console.log("Unknown case");

                break;
        }
    }
    checkSessionForLogin() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "/ajax/check_session", true); // Adjust the URL as necessary
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    response.user
                    console.log("User is logged in.");
                    // Handle logged-in user (e.g., update UI or redirect)
                    new UserNavBar(response.user);
                } else {
                    console.log("User is not logged in.");
                    // Handle not logged-in user (e.g., redirect to login page)
                }
            } else {
                console.log("Failed to check login status.");
            }
        };
        xhr.onerror = function () {
            console.error("Error occurred while checking login status.");
        };
        xhr.send();
    }


    load() {
        this.checkSessionForLogin();


        new DarkModeToggle();
        new MatomoOptOutManager();
        const searchParams = new URLSearchParams(window.location.search);
        new LocalStorageManager();

        if (searchParams.has("LoadChapter")) {
            new LoadChapter(searchParams.get("LoadChapter"));
        } else {
            new LoadChapter("home");
        }
        this.hashChecker();
        console.log("load complete");
        new StudyNavbar();



    }

}
window.onload = function () {

    new Init();
};
