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
            if (cleanFragment.startsWith('/exame/')) {
                this.loadExamRoute(cleanFragment);
            } else if (cleanFragment === '/estado-da-escola') {
                new QuestionStatus();
            } else if (cleanFragment.startsWith('/')) {
                const chapter = cleanFragment.substring(1) || 'home';
                new LoadChapter(chapter);
            } else {
                this.loadComponent(cleanFragment);
            }
        }
    }

    loadExamRoute(route) {
        const parts = route.split('/');
        // format: /exame/cat{N}/{type}
        if (parts.length < 4) return;
        const category = parts[2].replace('cat', '');
        const type = parts[3];
        const quizFile = `perguntas/question${category}.json`;

        switch (type) {
            case 'favoritas':
                new FavQuiz(quizFile);
                break;
            case 'todas':
                new Quiz(quizFile);
                break;
            case 'simulador':
                new SimulateQuiz(quizFile);
                break;
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

        // Backward compat: redirect ?LoadChapter= to hash URL
        if (searchParams.has("LoadChapter")) {
            const chapter = searchParams.get("LoadChapter");
            window.location.replace(window.location.pathname + '#/' + chapter);
            return;
        }

        // If hash is a chapter route, hashChecker will load it; otherwise load home
        const fragment = window.location.hash.substring(1);
        if (fragment.startsWith('/exame/')) {
            new LoadChapter("home");
            this.hashChecker();
        } else if (fragment.startsWith('/')) {
            this.hashChecker();
        } else if (!fragment) {
            new LoadChapter("home");
        } else {
            // Calculator hash — load home first, then handle hash
            new LoadChapter("home");
            this.hashChecker();
        }

        console.log("load complete");
        new StudyNavbar();

        // Initialize mobile navbar on mobile devices
        if (window.innerWidth < 768) {
            new MobileNavbar();
        }

        initFlowbite();


    }

}
window.onload = function () {

    new Init();
  };
