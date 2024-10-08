class MatomoOptOutManager {
	 settings = {
		"showIntro": 1,

		"useSecureCookies": 1,
		"cookiePath": null,
		"cookieDomain": null,
		"useCookiesIfNoTracker": 1,

		"OptOutComplete": "As suas visitas a este website não serão registadas pela ferramenta de Análise Web.",
		"OptOutCompleteNextLine": "Note que se limpar os seus cookies, eliminar o cookie de opt-out ou se mudar de computador ou navegador web, terá de realizar novamente o procedimento de opt-out.",
		"YouMayOptOutPart1": "Pode optar por impedir este website de agregar e analisar as ações que realiza aqui.",
		"YouMayOptOutPart2": "Fazê-lo protegerá a sua privacidade, mas também impedirá o proprietário de aprender com as suas ações e criar uma experiência melhor para si e outros utilizadores.",
		"OptOutErrorNoCookies": "A funcionalidade de rastreamento requer que os cookies estejam ativados.",
		"OptOutErrorNotHttps": "A funcionalidade de rastreamento pode não funcionar porque este site não foi carregado via HTTPS. Por favor, recarregue a página para verificar se o seu estado de opt-out foi alterado.",
		"YouAreNotOptedOut": "Autoriza rastreamento e guardar dados no seu browser.",
		"UncheckToOptOut": "Desmarque para não autorizar.",
		"YouAreOptedOut": "Não autoriza rastreamento e guardar dados no seu browser.",
		"CheckToOptIn": "Marque esta caixa para autorizar.",
		"OptOutErrorNoTracker": "A funcionalidade de  rastreamento não conseguiu encontrar o código Matomo Tracker nesta página."
	};
	constructor() {
		
		const showPrivaceDiv = document.getElementById("ShowPrivacyBar");
		showPrivaceDiv.matomoOptOutManager=this;
		showPrivaceDiv.addEventListener('click', () => this.update());


		this.checkForTrackerTried = 0;

		this.checkForTrackerInterval = 250;
		this.optOutDiv = null;
		
		if(MatomoOptOutManager.hasConsent()==false) {
			this.initialize();
		}
		FavQuiz.showFavElement("question3","favQuiz3");
		FavQuiz.showFavElement("question2","favQuiz2");
		FavQuiz.showFavElement("question1","favQuiz1");
	}

	initialize() {

		this.checkForMatomoTracker();
	}

	checkForMatomoTracker() {
		if (typeof _paq !== 'undefined') {
			this.showOptOutTracker();
			return;
		}

		if (this.settings.useCookiesIfNoTracker) {
			this.showOptOutDirect();
			return;
		}

		console.log('Matomo OptOutJS: failed to find Matomo tracker after ' + (this.checkForTrackerTries * this.checkForTrackerInterval / 1000) + ' seconds');
	}

	showOptOutTracker() {
		_paq.push([() => {
			if (this.settings.cookieDomain) {
				_paq.push(['setCookieDomain', this.settings.cookieDomain]);
			}
			if (this.settings.cookiePath) {
				_paq.push(['setCookiePath', this.settings.cookiePath]);
			}
			if (this.isUserOptedOut()) {
				this.showContent(false, null, true);
			} else {
				this.showContent(true, null, true);
			}
		}]);
	}

	showOptOutDirect() {
		this.initMatomoConsentManager();
		this.showContent(MatomoOptOutManager.hasConsent());
	}
	 update() {

		this.showContent(MatomoOptOutManager.hasConsent());
	}

	initMatomoConsentManager() {
		MatomoOptOutManager.initMatomoConsentManager(
			this.settings.useSecureCookies,
			this.settings.cookiePath,
			this.settings.cookieDomain,
			this.settings.cookieSameSite
		);
	}



	consentGiven() {
		MatomoOptOutManager.setCookie(MatomoOptOutManager.CONSENT_REMOVED_COOKIE_NAME, '', -129600000);
		MatomoOptOutManager.setCookie(MatomoOptOutManager.CONSENT_COOKIE_NAME, new Date().getTime().toString(), 946080000000);
		this.popup.closePopup();

		FavQuiz.showFavElement("question3","favQuiz3");
		FavQuiz.showFavElement("question2","favQuiz2");
		FavQuiz.showFavElement("question1","favQuiz1");
		this.matomoOptOutManager.showContent(true);

	}




	showContent(consent,  useTracker = false) {
		let popup=new Popup();
		
		
		
		const errorBlock = '<p style="color: red; font-weight: bold;">';
		//const div = document.getElementById(this.settings.divId);
		//div.innerHTML="";
		if (!navigator || !navigator.cookieEnabled) {
			//div.innerHTML = errorBlock + this.settings.OptOutErrorNoCookies + '</p>';
			popup.loadToPopup(errorBlock + this.settings.OptOutErrorNoCookies + '</p>');
			return;
		}
		/*
		if (location.protocol !== 'https:') {
			div.innerHTML = errorBlock + this.settings.OptOutErrorNotHttps + '</p>';
			popup.loadToPopup(errorBlock + this.settings.OptOutErrorNotHttps + '</p>');
			return;
		}*/
		const label = document.createElement('label');
		label.setAttribute('for', 'trackVisits');
		const strong = document.createElement('strong');
		const span = document.createElement('span');
		const trackVisitsCheckbox = document.createElement('input');
		const introParagraph = document.createElement('p');
		trackVisitsCheckbox.setAttribute('type', 'checkbox');
		trackVisitsCheckbox.setAttribute('id', 'trackVisits');
		trackVisitsCheckbox.matomoOptOutManager=this;
		var labelText="";
		trackVisitsCheckbox.popup=popup;
		if (consent)
		{
			FavQuiz.showFavElement("question3","favQuiz3");
			FavQuiz.showFavElement("question2","favQuiz2");
			FavQuiz.showFavElement("question1","favQuiz1");
			trackVisitsCheckbox.setAttribute('checked', 'checked');
			
			if (this.settings.showIntro) {
			  
			  const introText = document.createTextNode(this.settings.YouMayOptOutPart1 + ' ' + this.settings.YouMayOptOutPart2);
			  introParagraph.appendChild(introText);
	
			  popup.loadToPopup(introParagraph);
			  
			}
			
			
			if (useTracker) {
				
				trackVisitsCheckbox.onclick=function(){
				  _paq.push(['optUserOut']); 
				  this.consentRevoked();
				  
				  };
			} else {
			  trackVisitsCheckbox.onclick=this.consentRevoked;
			}
			labelText = document.createTextNode(this.settings.YouAreNotOptedOut + ' ' + this.settings.UncheckToOptOut);
			
		}
		else
		{
			FavQuiz.hideFavElement("question3","favQuiz3");
			FavQuiz.hideFavElement("question2","favQuiz2");
			FavQuiz.hideFavElement("question1","favQuiz1");
			if (this.settings.showIntro) {

				const introText = document.createTextNode(this.settings.OptOutComplete + ' ' + this.settings.OptOutCompleteNextLine);
				introParagraph.appendChild(introText);
			 	//div.appendChild(introParagraph);
				popup.loadToPopup(introParagraph);
			}
			if (useTracker) {

				trackVisitsCheckbox.onclick=function(){
				  _paq.push(['forgetUserOptOut']); 
				  this.consentGiven();
				  
				  };
			} else {
			  trackVisitsCheckbox.onclick=this.consentGiven;
			}
			labelText = document.createTextNode(this.settings.YouAreOptedOut + ' ' + this.settings.CheckToOptIn);
			 
			
		}
		span.appendChild(labelText);
		strong.appendChild(span);
		label.appendChild(strong);
		popup.loadToPopup(trackVisitsCheckbox);
		popup.loadToPopup(label);

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
	consentRevoked() {
		MatomoOptOutManager.setCookie(MatomoOptOutManager.CONSENT_COOKIE_NAME, '', -129600000);
		MatomoOptOutManager.setCookie(MatomoOptOutManager.CONSENT_REMOVED_COOKIE_NAME, new Date().getTime().toString(), 946080000000);
		localStorage.clear();
		this.matomoOptOutManager.showContent(false);
		this.popup.closePopup();

		
		FavQuiz.hideFavElement("question3","favQuiz3");
		FavQuiz.hideFavElement("question2","favQuiz2");
		FavQuiz.hideFavElement("question1","favQuiz1");
	}
}


