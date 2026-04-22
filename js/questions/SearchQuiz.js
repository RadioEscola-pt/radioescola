class SearchQuiz extends Classes([Questions, Storage]) {
	static messagesArray = {};

	constructor() {
		super();
		this.jsonFile = "search";
		this.pageBlocks = [];
		this.questionsPerPage = 10;
		this.paginationWindow = 2;
		this.filename = "search";
		this.allQuestions = [];
		this.loadAllQuestions();
	}

	loadAllQuestions() {
		const files = [
			{ path: "perguntas/question1.json", category: "1" },
			{ path: "perguntas/question2.json", category: "2" },
			{ path: "perguntas/question3.json", category: "3" },
		];

		let loaded = 0;
		for (const file of files) {
			const xhr = new XMLHttpRequest();
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4 && xhr.status === 200) {
					const data = JSON.parse(xhr.responseText);
					for (const q of data.questions) {
						q.category = file.category;
						this.allQuestions.push(q);
					}
					loaded++;
					if (loaded === files.length) {
						this.onReady();
					}
				}
			};
			xhr.open("GET", file.path);
			xhr.send();
		}
	}

	onReady() {
		const countEl = document.getElementById("searchQuestionCount");
		if (countEl) {
			countEl.textContent = this.allQuestions.length;
		}
		const input = document.getElementById("searchInput");
		const btn = document.getElementById("searchBtn");

		const doSearch = () => {
			const query = input.value.trim();
			if (!query) return;
			const emptyDiv = document.getElementById("searchEmpty");
			if (emptyDiv) emptyDiv.style.display = "none";
			const categories = this.getSelectedCategories();
			const terms = query.split(/\s+/);
			const results = this.searchQuestions(terms, categories);
			this.renderResults(results, terms);
		};

		btn.addEventListener("click", doSearch);
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") doSearch();
		});

		// Wire up color toggle
		document.getElementById("colorCards").addEventListener("change", () => {
			if (this.lastResults) this.addCategoryTints(this.lastResults);
		});

		// Wire up suggestion buttons
		document.querySelectorAll(".search-suggestion").forEach((btn) => {
			btn.addEventListener("click", () => {
				input.value = btn.textContent;
				doSearch();
			});
		});

		input.focus();
	}

	getSelectedCategories() {
		const cats = [];
		if (document.getElementById("cat1").checked) cats.push("1");
		if (document.getElementById("cat2").checked) cats.push("2");
		if (document.getElementById("cat3").checked) cats.push("3");
		return cats;
	}

	searchQuestions(terms, categories) {
		const results = [];
		for (const q of this.allQuestions) {
			if (!categories.includes(q.category)) continue;
			const searchable = (
				q.question + " " +
				(q.answers || []).join(" ") + " " +
				(q.notes || "")
			).toLowerCase();

			const allMatch = terms.every((term) => searchable.includes(term.toLowerCase()));
			if (allMatch) results.push(q);
		}
		return results;
	}

	renderResults(results, terms) {
		const welcomeDiv = document.getElementById("searchResults");
		welcomeDiv.innerHTML = "";

		// Stats
		const statsDiv = document.createElement("div");
		statsDiv.className = "max-w-screen-md m-auto mb-4 flex items-center gap-2 flex-wrap";

		const total = document.createElement("span");
		total.className = "text-lg font-bold dark:text-white";
		total.textContent = results.length + " resultado(s)";
		statsDiv.appendChild(total);

		const catCounts = { "1": 0, "2": 0, "3": 0 };
		for (const q of results) catCounts[q.category]++;

		const catColors = {
			"1": "bg-yellow-400 text-black",
			"2": "bg-blue-400 text-black",
			"3": "bg-green-400 text-black",
		};
		for (const [cat, count] of Object.entries(catCounts)) {
			if (count === 0) continue;
			const badge = document.createElement("span");
			badge.className = "px-2 py-1 text-xs font-bold rounded " + catColors[cat];
			badge.textContent = "Cat " + cat + ": " + count;
			statsDiv.appendChild(badge);
		}
		welcomeDiv.appendChild(statsDiv);

		if (results.length === 0) {
			const noResults = document.createElement("div");
			noResults.className = "max-w-screen-md m-auto mt-6 text-center text-gray-500 dark:text-gray-400";
			noResults.innerHTML = '<p class="mb-2">Nenhuma pergunta encontrada.</p><p class="text-sm">Tente termos diferentes ou selecione mais categorias.</p>';
			welcomeDiv.appendChild(noResults);
			return;
		}

		// Set up Quiz.messagesArray so checkQuestion works
		Quiz.messagesArray = { questions: results };

		// Re-index and render
		this.pageBlocks = [];
		let questionCounter = 0;
		let currentPageBlock = null;

		const indexBlock = document.createElement("div");
		indexBlock.id = "qIndex";
		indexBlock.className = "max-w-screen-md m-auto list-none m-0 p-2 rounded mb-5 overflow-x-auto overflow-y-hidden bg-slate-200 dark:bg-slate-600 sticky flex items-center justify-start top-[10px] gap-[5px]";
		welcomeDiv.appendChild(indexBlock);
		this.indexBlock = indexBlock;

		for (let i = 0; i < results.length; i++) {
			results[i].index = i;

			if (questionCounter % this.questionsPerPage === 0 || questionCounter === 0) {
				currentPageBlock = document.createElement("div");
				currentPageBlock.id = "Page" + questionCounter;
				currentPageBlock.style.display = "none";
				currentPageBlock.className = "page";
				this.pageBlocks.push(currentPageBlock);
			}
			questionCounter++;
			this.addQuestion(welcomeDiv, currentPageBlock, results[i], i);
		}

		if (this.pageBlocks.length > 0) {
			this.pageBlocks[0].style.display = "block";
			this.currentPage = 0;
			this.renderPagination(0);
		}

		this.lastResults = results;
		for (let i = 0; i < results.length; i++) {
			const card = document.getElementById("questionBlock" + i);
			if (card) this.highlightTerms(card, terms);
		}
		this.addCategoryTints(results);
	}

	renderPagination(currentPage = 0) {
		const indexBlock = this.indexBlock || document.getElementById("qIndex");
		if (!indexBlock) return;

		const totalPages = this.pageBlocks.length;
		if (totalPages === 0) {
			indexBlock.innerHTML = "";
			return;
		}

		const pageSize = this.questionsPerPage || 10;
		const safePage = Math.max(0, Math.min(currentPage, totalPages - 1));
		this.currentPage = safePage;

		indexBlock.innerHTML = "";

		const createButton = (label, pageIndex, options = {}) => {
			const { isActive = false, isDisabled = false } = options;
			const button = document.createElement("button");
			button.type = "button";
			button.innerHTML = label;
			button.value = pageIndex * pageSize;
			button.pageBlocks = this.pageBlocks;
			button.quiz = this;

			if (isDisabled) {
				button.disabled = true;
				button.className = "bg-slate-200 text-slate-500 p-2 rounded cursor-not-allowed dark:bg-slate-700 dark:text-slate-300";
			} else {
				button.onclick = this.showPageWithStorage;
				button.className = isActive
					? "bg-slate-400 dark:bg-slate-800 hover:bg-slate-400 dark:hover:bg-slate-900 p-2 rounded cursor-pointer"
					: "bg-slate-300 hover:bg-slate-400 p-2 rounded cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-800";
			}

			indexBlock.appendChild(button);
		};

		const isAtStart = safePage === 0;
		const previousPage = Math.max(safePage - 1, 0);
		createButton("Início", 0, { isDisabled: isAtStart });
		createButton("Anterior", previousPage, { isDisabled: isAtStart });

		const pagesAround = typeof this.paginationWindow === "number" ? Math.max(0, this.paginationWindow) : 3;
		const startPage = Math.max(safePage - pagesAround, 0);
		const endPage = Math.min(safePage + pagesAround, totalPages - 1);

		for (let page = startPage; page <= endPage; page++) {
			createButton(page + 1, page, { isActive: page === safePage });
		}

		const isAtEnd = safePage === totalPages - 1;
		const nextPage = Math.min(safePage + 1, totalPages - 1);
		createButton("Seguinte", nextPage, { isDisabled: isAtEnd });
		createButton("Fim", totalPages - 1, { isDisabled: isAtEnd });
	}

	highlightTerms(container, terms) {
		const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
		const textNodes = [];
		while (walker.nextNode()) textNodes.push(walker.currentNode);

		const escaped = terms
			.filter((t) => t && t.length > 0)
			.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
		if (escaped.length === 0) return;
		const combined = new RegExp("(" + escaped.join("|") + ")", "gi");

		for (const node of textNodes) {
			const parent = node.parentNode;
			if (!parent || parent.tagName === "SCRIPT" || parent.tagName === "STYLE") continue;
			if (parent.classList && parent.classList.contains("search-highlight")) continue;

			const text = node.textContent;
			combined.lastIndex = 0;
			if (!combined.test(text)) continue;
			combined.lastIndex = 0;

			const escapeHtml = (s) => s
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;");

			const html = escapeHtml(text).replace(
				combined,
				'<mark class="search-highlight bg-yellow-200 dark:bg-yellow-700 dark:text-white rounded px-0.5">$1</mark>'
			);
			const span = document.createElement("span");
			span.innerHTML = html;
			parent.replaceChild(span, node);
		}
	}

	addCategoryTints(results) {
		const enabled = document.getElementById("colorCards").checked;
		const catTints = {
			"1": ["bg-yellow-50", "dark:bg-yellow-950/20"],
			"2": ["bg-blue-50", "dark:bg-blue-950/20"],
			"3": ["bg-green-50", "dark:bg-green-950/20"],
		};
		const allTintClasses = Object.values(catTints).flat();
		for (let i = 0; i < results.length; i++) {
			const card = document.getElementById("questionBlock" + i);
			if (!card) continue;
			card.classList.remove(...allTintClasses);
			if (enabled) {
				card.classList.remove("bg-white", "dark:bg-gray-800");
				card.classList.add(...catTints[results[i].category]);
			} else {
				card.classList.add("bg-white", "dark:bg-gray-800");
			}
		}
	}

	getfilename() {
		return "search";
	}
}
