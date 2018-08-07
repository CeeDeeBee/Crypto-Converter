document.addEventListener('DOMContentLoaded', () => {
	var overlay = document.getElementsByClassName('overlay')[0];
	var termsPopup = document.getElementById('termsPopup');
	document.getElementById('termsPopupX').addEventListener('click', () => {
		termsPopup.style.display = 'none';
		overlay.style.display = 'none';
	});
	document.getElementById('openTerms').addEventListener('click', () => {
		termsPopup.style.display = 'block';
		overlay.style.display = 'block';
	});
	document.getElementById('openHomePage').addEventListener('click', () => {
		var homePage = document.getElementById('homePage');
		var homePageArrow = document.getElementById('homePageArrow');
		if (getComputedStyle(homePage, null).display == 'none') {
			homePage.style.display = 'block';
			homePageArrow.setAttribute('src', 'left-arrow.svg');
		} else {
			homePage.style.display = 'none';
			homePageArrow.setAttribute('src', 'down-arrow.svg');
		}
	});
	document.getElementById('openNewsPage').addEventListener('click', () => {
		var newsPage = document.getElementById('newsPage');
		var newsPageArrow = document.getElementById('newsPageArrow');
		if (getComputedStyle(newsPage, null).display == 'none') {
			newsPage.style.display = 'block';
			newsPageArrow.setAttribute('src', 'left-arrow.svg');
		} else {
			newsPage.style.display = 'none';
			newsPageArrow.setAttribute('src', 'down-arrow.svg');
		}
	});
	document.getElementById('openPortfolioPage').addEventListener('click', () => {
		var portfolioPage = document.getElementById('portfolioPage');
		var portfolioPageArrow = document.getElementById('portfolioPageArrow');
		if (getComputedStyle(portfolioPage, null).display == 'none') {
			portfolioPage.style.display = 'block';
			portfolioPageArrow.setAttribute('src', 'left-arrow.svg');
		} else {
			portfolioPage.style.display = 'none';
			portfolioPageArrow.setAttribute('src', 'down-arrow.svg');
		}
	});
	document.getElementById('openConvertPage').addEventListener('click', () => {
		var convertPage = document.getElementById('convertPage');
		var convertPageArrow = document.getElementById('convertPageArrow');
		if (getComputedStyle(convertPage, null).display == 'none') {
			convertPage.style.display = 'block';
			convertPageArrow.setAttribute('src', 'left-arrow.svg');
		} else {
			convertPage.style.display = 'none';
			convertPageArrow.setAttribute('src', 'down-arrow.svg');
		}
	});
	document.getElementById('openOptionsPage').addEventListener('click', () => {
		var optionsPage = document.getElementById('optionsPage');
		var optionsPageArrow = document.getElementById('optionsPageArrow');
		if (getComputedStyle(optionsPage, null).display == 'none') {
			optionsPage.style.display = 'block';
			optionsPageArrow.setAttribute('src', 'left-arrow.svg');
		} else {
			optionsPage.style.display = 'none';
			optionsPageArrow.setAttribute('src', 'down-arrow.svg');
		}
	});
	document.getElementById('openContact').addEventListener('click', () => {
		var contactPage = document.getElementById('contactPage');
		var contactArrow = document.getElementById('contactArrow');
		if (getComputedStyle(contact, null).display == 'none') {
			contact.style.display = 'block';
			contactArrow.setAttribute('src', 'left-arrow.svg');
		} else {
			contact.style.display = 'none';
			contactArrow.setAttribute('src', 'down-arrow.svg');
		}
	});
});