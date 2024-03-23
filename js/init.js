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

    load() {

        
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
        initFlowbite();


    }

}
window.onload = function () {

    new Init();
  };
