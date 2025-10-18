class MobileNavbar {
    constructor() {
        this.isOpen = false;
        this.navigationStack = [];
        this.currentLevel = 'main';
        this.menuData = null;
        this.animationDuration = 300;

        this.createMobileMenuStructure();
        this.loadData();
        this.initEventListeners();
    }

    createMobileMenuStructure() {
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'mobile-menu-backdrop';
        backdrop.className = 'mobile-menu-backdrop';
        document.body.appendChild(backdrop);

        // Create mobile menu container
        const mobileMenu = document.createElement('div');
        mobileMenu.id = 'mobile-menu';
        mobileMenu.className = 'mobile-menu';

        // Create header with back button and title
        const header = document.createElement('div');
        header.className = 'mobile-menu-header';
        header.innerHTML = `
            <button id="mobile-menu-back" class="mobile-menu-back hidden">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span id="mobile-menu-title">Menu</span>
            </button>
            <button id="mobile-menu-close" class="mobile-menu-close">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        `;

        // Create menu content container
        const content = document.createElement('div');
        content.id = 'mobile-menu-content';
        content.className = 'mobile-menu-content';

        mobileMenu.appendChild(header);
        mobileMenu.appendChild(content);
        document.body.appendChild(mobileMenu);

        this.backdrop = backdrop;
        this.mobileMenu = mobileMenu;
        this.content = content;
        this.backButton = document.getElementById('mobile-menu-back');
        this.closeButton = document.getElementById('mobile-menu-close');
        this.titleElement = document.getElementById('mobile-menu-title');
    }

    loadData() {
        fetch('capitulos/tutoriais.json')
            .then(response => response.json())
            .then(data => {
                this.menuData = data;
                this.renderMainMenu();
            })
            .catch(error => console.error('Error loading menu data:', error));
    }

    initEventListeners() {
        // Mobile hamburger button (in header)
        const mobileToggleButton = document.getElementById('mobile-navbar-toggle');
        if (mobileToggleButton) {
            mobileToggleButton.addEventListener('click', () => this.toggleMenu());
        }

        // Old hamburger button (kept for compatibility if needed)
        const toggleButton = document.getElementById('navbar-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggleMenu());
        }

        // Close button
        this.closeButton.addEventListener('click', () => this.closeMenu());

        // Backdrop click
        this.backdrop.addEventListener('click', () => this.closeMenu());

        // Back button
        this.backButton.addEventListener('click', () => this.navigateBack());

        // Swipe to close
        this.initSwipeGesture();

        // Prevent body scroll when menu is open
        this.mobileMenu.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        });
    }

    initSwipeGesture() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        this.mobileMenu.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        this.mobileMenu.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;

            // Only allow swipe to the right (closing gesture)
            if (diff > 0) {
                this.mobileMenu.style.transform = `translateX(${diff}px)`;
            }
        });

        this.mobileMenu.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;

            const diff = currentX - startX;

            // If swiped more than 100px, close the menu
            if (diff > 100) {
                this.closeMenu();
            } else {
                // Snap back
                this.mobileMenu.style.transform = '';
            }
        });
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        this.backdrop.classList.add('active');
        this.mobileMenu.classList.add('active');
    }

    closeMenu() {
        this.isOpen = false;
        document.body.style.overflow = '';
        this.backdrop.classList.remove('active');
        this.mobileMenu.classList.remove('active');

        // Reset to main menu after animation
        setTimeout(() => {
            if (!this.isOpen) {
                this.resetToMainMenu();
            }
        }, this.animationDuration);
    }

    resetToMainMenu() {
        this.navigationStack = [];
        this.currentLevel = 'main';
        this.renderMainMenu();
        this.updateHeader();
    }

    navigateBack() {
        if (this.navigationStack.length === 0) return;

        const previous = this.navigationStack.pop();
        this.currentLevel = previous.level;

        if (previous.level === 'main') {
            this.renderMainMenu();
        } else if (previous.level === 'category') {
            this.renderCategoryMenu(previous.data);
        }

        this.updateHeader();
    }

    updateHeader() {
        if (this.navigationStack.length === 0) {
            this.backButton.classList.add('hidden');
            this.titleElement.textContent = 'Menu';
        } else {
            this.backButton.classList.remove('hidden');
            const current = this.navigationStack[this.navigationStack.length - 1];
            this.titleElement.textContent = current.title || 'Menu';
        }
    }

    renderMainMenu() {
        const menuItems = [
            { title: 'Início', action: () => this.navigateToChapter('home') },
            { title: 'Equipa', action: () => this.navigateToChapter('equipa') },
            { title: 'Estado da Nação', action: () => this.navigateToChapter('EDN') },
            { title: 'Estado da Escola', action: () => new QuestionStatus() && this.closeMenu() },
            { title: 'Calculadoras', action: () => this.navigateToCalculators(), hasSubmenu: true },
            { title: 'Quero ser Radioamador', action: () => this.navigateToChapter('ser_radioamador') },
            { title: 'Exames', action: () => this.navigateToExams(), hasSubmenu: true },
            { title: 'Estudo', action: () => this.navigateToStudy(), hasSubmenu: true }
        ];

        this.renderMenuItems(menuItems);
    }

    navigateToCalculators() {
        this.navigationStack.push({ level: 'main', title: 'Menu' });
        this.currentLevel = 'calculators';

        const calculatorItems = [
            { title: 'Adicionar Componentes', action: () => this.navigateToHash('COPADDER') },
            { title: 'Impedância', action: () => this.navigateToHash('REACTANCE') },
            { title: 'Lei de Ohm', action: () => this.navigateToHash('OHMCALC') },
            { title: 'RLC', action: () => this.navigateToHash('RLC') },
            { title: 'Ressonancia RL', action: () => this.navigateToHash('RLCRESS') },
            { title: 'Factor Q', action: () => this.navigateToHash('QFACTOR') },
            { title: 'VSWRC', action: () => this.navigateToHash('VSWRC') },
            { title: 'GAIN', action: () => this.navigateToHash('GAIN') },
            { title: 'Transformadores', action: () => this.navigateToHash('TRANSFORMER') }
        ];

        this.renderMenuItems(calculatorItems);
        this.updateHeader();
    }

    navigateToExams() {
        this.navigationStack.push({ level: 'main', title: 'Menu' });
        this.currentLevel = 'exams';

        const examItems = [
            { title: 'Categoria 3', action: () => this.navigateToCategoryExams(3), hasSubmenu: true },
            { title: 'Categoria 2', action: () => this.navigateToCategoryExams(2), hasSubmenu: true },
            { title: 'Categoria 1', action: () => this.navigateToCategoryExams(1), hasSubmenu: true },
            { title: 'Ir a exame', action: () => this.navigateToChapter('marcar_exame_anacom') }
        ];

        this.renderMenuItems(examItems);
        this.updateHeader();
    }

    navigateToCategoryExams(category) {
        this.navigationStack.push({ level: 'exams', title: 'Exames' });
        this.currentLevel = `exams-cat${category}`;

        const examItems = [
            { title: 'Favoritas', action: () => this.startQuiz('FavQuiz', category) },
            { title: 'Todas as perguntas', action: () => this.startQuiz('Quiz', category) },
            { title: 'Simulador de exame', action: () => this.startQuiz('SimulateQuiz', category) }
        ];

        this.renderMenuItems(examItems);
        this.titleElement.textContent = `Categoria ${category}`;
        this.backButton.classList.remove('hidden');
    }

    navigateToStudy() {
        if (!this.menuData) return;

        this.navigationStack.push({ level: 'main', title: 'Menu' });
        this.currentLevel = 'study';

        const studyItems = this.menuData.categories.map(category => ({
            title: category.title,
            action: () => this.navigateToCategory(category),
            hasSubmenu: true
        }));

        this.renderMenuItems(studyItems);
        this.updateHeader();
    }

    navigateToCategory(category) {
        this.navigationStack.push({ level: 'study', title: 'Estudo', data: category });
        this.currentLevel = `category-${category.id}`;

        const categoryItems = category.items.map(item => ({
            title: item.title,
            action: () => {
                if (item.action == null) {
                    window.open(item.newTab, '_blank');
                } else {
                    this.navigateToChapter(item.action);
                }
            }
        }));

        this.renderMenuItems(categoryItems);
        this.titleElement.textContent = category.title;
        this.backButton.classList.remove('hidden');
    }

    renderCategoryMenu(category) {
        this.navigateToCategory(category);
    }

    renderMenuItems(items) {
        this.content.innerHTML = '';
        const ul = document.createElement('ul');
        ul.className = 'mobile-menu-list';

        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'mobile-menu-item';
            li.style.animationDelay = `${index * 0.05}s`;

            const button = document.createElement('button');
            button.className = 'mobile-menu-button';
            button.textContent = item.title;

            if (item.hasSubmenu) {
                const arrow = document.createElement('svg');
                arrow.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                arrow.setAttribute('fill', 'none');
                arrow.setAttribute('viewBox', '0 0 24 24');
                arrow.setAttribute('stroke-width', '2');
                arrow.setAttribute('stroke', 'currentColor');
                arrow.className = 'w-5 h-5';
                arrow.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />';
                button.appendChild(arrow);
                button.classList.add('has-submenu');
            }

            button.addEventListener('click', () => item.action());

            li.appendChild(button);
            ul.appendChild(li);
        });

        this.content.appendChild(ul);
    }

    navigateToChapter(chapter) {
        new LoadChapter(chapter);
        this.closeMenu();
    }

    navigateToHash(hash) {
        window.location.hash = hash;
        this.closeMenu();
    }

    startQuiz(quizType, category) {
        const quizFile = `perguntas/question${category}.json`;

        switch(quizType) {
            case 'FavQuiz':
                new FavQuiz(quizFile);
                break;
            case 'Quiz':
                new Quiz(quizFile);
                break;
            case 'SimulateQuiz':
                new SimulateQuiz(quizFile);
                break;
        }

        this.closeMenu();
    }
}
