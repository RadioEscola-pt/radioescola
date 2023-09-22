class MatomoOptOutManager {
	static settings = {
		"showIntro": 1,
		"divId": "matomo-opt-out",
		"useSecureCookies": 1,
		"cookiePath": null,
		"cookieDomain": null,
		"useCookiesIfNoTracker": 1,

		"OptOutComplete": "As suas visitas a este website não serão registadas pela ferramenta de Análise Web.",
		"OptOutCompleteBis": "Note que se limpar os seus cookies, eliminar o cookie de opt-out ou se mudar de computador ou navegador web, terá de realizar novamente o procedimento de opt-out.",
		"YouMayOptOut2": "Pode optar por impedir este website de agregar e analisar as ações que realiza aqui.",
		"YouMayOptOut3": "Fazê-lo protegerá a sua privacidade, mas também impedirá o proprietário de aprender com as suas ações e criar uma experiência melhor para si e outros utilizadores.",
		"OptOutErrorNoCookies": "A funcionalidade de rastreamento requer que os cookies estejam ativados.",
		"OptOutErrorNotHttps": "A funcionalidade de rastreamento pode não funcionar porque este site não foi carregado via HTTPS. Por favor, recarregue a página para verificar se o seu estado de opt-out foi alterado.",
		"YouAreNotOptedOut": "Autoriza rastreamento e guardar dados no seu browser.",
		"UncheckToOptOut": "Desmarque para não autorizar.",
		"YouAreOptedOut": "Não autoriza rastreamento e guardar dados no seu browser.",
		"CheckToOptIn": "Marque esta caixa para autorizar.",
		"OptOutErrorNoTracker": "A funcionalidade de  rastreamento não conseguiu encontrar o código Matomo Tracker nesta página."
	};
	constructor(settings) {

		this.checkForTrackerTried = 0;

		this.checkForTrackerInterval = 250;
		this.optOutDiv = null;
		this.initialize();
	}

	initialize() {
		this.optOutDiv = document.getElementById(MatomoOptOutManager.settings.divId);
		if (!this.optOutDiv) {
			MatomoOptOutManager.showContent(false, null, true);
			return;
		}
		this.checkForMatomoTracker();
	}

	checkForMatomoTracker() {
		if (typeof _paq !== 'undefined') {
			this.showOptOutTracker();
			return;
		}

		if (MatomoOptOutManager.settings.useCookiesIfNoTracker) {
			this.showOptOutDirect();
			return;
		}

		console.log('Matomo OptOutJS: failed to find Matomo tracker after ' + (this.checkForTrackerTries * this.checkForTrackerInterval / 1000) + ' seconds');
	}

	showOptOutTracker() {
		_paq.push([() => {
			if (MatomoOptOutManager.settings.cookieDomain) {
				_paq.push(['setCookieDomain', MatomoOptOutManager.settings.cookieDomain]);
			}
			if (MatomoOptOutManager.settings.cookiePath) {
				_paq.push(['setCookiePath', MatomoOptOutManager.settings.cookiePath]);
			}
			if (this.isUserOptedOut()) {
				MatomoOptOutManager.showContent(false, null, true);
			} else {
				MatomoOptOutManager.showContent(true, null, true);
			}
		}]);
	}

	showOptOutDirect() {
		this.initMatomoConsentManager();
		MatomoOptOutManager.showContent(MatomoOptOutManager.hasConsent());
	}
	static update() {

		MatomoOptOutManager.showContent(MatomoOptOutManager.hasConsent());
	}

	initMatomoConsentManager() {
		MatomoOptOutManager.initMatomoConsentManager(
			MatomoOptOutManager.settings.useSecureCookies,
			MatomoOptOutManager.settings.cookiePath,
			MatomoOptOutManager.settings.cookieDomain,
			MatomoOptOutManager.settings.cookieSameSite
		);
	}



	static consentGiven() {
		MatomoOptOutManager.setCookie(MatomoOptOutManager.CONSENT_REMOVED_COOKIE_NAME, '', -129600000);
		MatomoOptOutManager.setCookie(MatomoOptOutManager.CONSENT_COOKIE_NAME, new Date().getTime().toString(), 946080000000);

		FavQuiz.showFavElement("question3","favQuiz3");
		FavQuiz.showFavElement("question2","favQuiz2");
		FavQuiz.showFavElement("question1","favQuiz1");
		MatomoOptOutManager.showContent(true);

	}




	static showContent(consent, errorMessage = null, useTracker = false) {
		const errorBlock = '<p style="color: red; font-weight: bold;">';
		const div = document.getElementById(MatomoOptOutManager.settings.divId);

		if (!navigator || !navigator.cookieEnabled) {
			div.innerHTML = errorBlock + MatomoOptOutManager.settings.OptOutErrorNoCookies + '</p>';
			return;
		}
		/*
		if (location.protocol !== 'https:') {
			div.innerHTML = errorBlock + MatomoOptOutManager.settings.OptOutErrorNotHttps + '</p>';
			return;
		}*/
		if (errorMessage !== null) {
			div.innerHTML = errorBlock + errorMessage + '</p>';
			return;
		}

		let content = '';
		if (consent) {
					

					
		FavQuiz.showFavElement("question3","favQuiz3");
		FavQuiz.showFavElement("question2","favQuiz2");
		FavQuiz.showFavElement("question1","favQuiz1");
			if (MatomoOptOutManager.settings.showIntro) {
				content += '<p>' + MatomoOptOutManager.settings.YouMayOptOut2 + ' ' + MatomoOptOutManager.settings.YouMayOptOut3 + '</p>';
			}
			if (useTracker) {
				content += '<input onclick="_paq.push([\'optUserOut\']); MatomoOptOutManager.consentRevoked();" id="trackVisits" type="checkbox" checked="checked" />';
			} else {
				content += '<input onclick="MatomoOptOutManager.consentRevoked();" id="trackVisits" type="checkbox" checked="checked" />';
			}
			content += '<label for="trackVisits"><strong><span>' + MatomoOptOutManager.settings.YouAreNotOptedOut + ' ' + MatomoOptOutManager.settings.UncheckToOptOut + '</span></strong></label>';
		} else {
			FavQuiz.hideFavElement("question3","favQuiz3");
		FavQuiz.hideFavElement("question2","favQuiz2");
		FavQuiz.hideFavElement("question1","favQuiz1");
			if (MatomoOptOutManager.settings.showIntro) {
				content += '<p>' + MatomoOptOutManager.settings.OptOutComplete + ' ' + MatomoOptOutManager.settings.OptOutCompleteBis + '</p>';
			}
			if (useTracker) {
				content += '<input onclick="_paq.push([\'forgetUserOptOut\']); MatomoOptOutManager.consentGiven();" id="trackVisits" type="checkbox" />';
			} else {
				content += '<input onclick="MatomoOptOutManager.consentGiven();" id="trackVisits" type="checkbox" />';
			}
			content += '<label for="trackVisits"><strong><span>' + MatomoOptOutManager.settings.YouAreOptedOut + ' ' + MatomoOptOutManager.settings.CheckToOptIn + '</span></strong></label>';
		}
		div.innerHTML = content;
		const hideButton = document.createElement("button");
		hideButton.textContent = "esconder";
		hideButton.onclick = () => {
			const div = document.getElementById(MatomoOptOutManager.settings.divId);
			div.style.display = "none";
		};
		div.appendChild(hideButton);
	}

	static initMatomoConsentManager(useSecureCookies, cookiePath, cookieDomain, cookieSameSite) {
		MatomoOptOutManager.useSecureCookies = useSecureCookies;
		MatomoOptOutManager.cookiePath = cookiePath;
		MatomoOptOutManager.cookieDomain = cookieDomain;
		MatomoOptOutManager.cookieSameSite = cookieSameSite;
		MatomoOptOutManager.CONSENT_COOKIE_NAME = 'mtm_consent';
		MatomoOptOutManager.CONSENT_REMOVED_COOKIE_NAME = 'mtm_consent_removed';
		if (useSecureCookies && location.protocol !== 'https:') {
			console.log('Error with setting useSecureCookies: You cannot use this option on http.');
		} else {
			MatomoOptOutManager.cookieIsSecure = useSecureCookies;
		}
	}

	static hasConsent() {
		const consentCookie = MatomoOptOutManager.getCookie(MatomoOptOutManager.CONSENT_COOKIE_NAME);
		const removedCookie = MatomoOptOutManager.getCookie(MatomoOptOutManager.CONSENT_REMOVED_COOKIE_NAME);

		if (!consentCookie && !removedCookie) {


			return true;
		}
		if (removedCookie && consentCookie) {
			MatomoOptOutManager.setCookie(MatomoOptOutManager.CONSENT_COOKIE_NAME, '', -129600000);

			return false;
		}
		return (consentCookie || consentCookie !== null);
	}



	static getCookie(cookieName) {
		const cookiePattern = new RegExp('(^|;)[ ]*' + cookieName + '=([^;]*)');
		const cookieMatch = cookiePattern.exec(document.cookie);
		return cookieMatch ? window.decodeURIComponent(cookieMatch[2]) : null;
	}

	static setCookie(cookieName, value, msToExpire) {
		const expiryDate = new Date();
		expiryDate.setTime((new Date().getTime()) + msToExpire);
		document.cookie = cookieName + '=' + window.encodeURIComponent(value) +
			(msToExpire ? ';expires=' + expiryDate.toGMTString() : '') +
			';path=' + (MatomoOptOutManager.cookiePath || '/') +
			(MatomoOptOutManager.cookieDomain ? ';domain=' + MatomoOptOutManager.cookieDomain : '') +
			(MatomoOptOutManager.cookieIsSecure ? ';secure' : '') +
			';SameSite=' + MatomoOptOutManager.cookieSameSite;
		if ((!msToExpire || msToExpire >= 0) && MatomoOptOutManager.getCookie(cookieName) !== String(value)) {
			console.log('There was an error setting cookie `' + cookieName + '`. Please check domain and path.');
		}
	}
	static consentRevoked() {
		MatomoOptOutManager.setCookie(MatomoOptOutManager.CONSENT_COOKIE_NAME, '', -129600000);
		MatomoOptOutManager.setCookie(MatomoOptOutManager.CONSENT_REMOVED_COOKIE_NAME, new Date().getTime().toString(), 946080000000);
		localStorage.clear();
		MatomoOptOutManager.showContent(false);
		FavQuiz.hideFavElement("question3","favQuiz3");
		FavQuiz.hideFavElement("question2","favQuiz2");
		FavQuiz.hideFavElement("question1","favQuiz1");
	}
}


