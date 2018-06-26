function httpGetAsync(theUrl, callback, parse) {
	console.log(theUrl);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        	if (parse == 'JSON') {
        		callback(JSON.parse(xmlHttp.responseText));
        	} else if (parse == 'XML') {
        		parser = new DOMParser();
        		callback(parser.parseFromString(xmlHttp.responseText, 'text/xml'));
        	}     
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function storeJson(json) {
	chrome.storage.local.get(null, (result) => {
		result['json'] = json;
		chrome.storage.local.set(result);
		console.log(result);
	})
}

function storeFiatRates(xml) {
	var cubes = xml.getElementsByTagName('Cube');
	var fiatRates = [];
	console.log(cubes[1]);
	var usdRate = cubes[2].getAttribute('rate');
	var eurArray = [];
	var eurRate = 1 / usdRate;
	eurArray[0] = 'EUR';
	eurArray[1] = eurRate;
	fiatRates.push(eurArray);
	for (var i = 0; i < cubes.length; i++) {
		if (cubes[i].hasAttribute('rate')) {
			var array = [];
			array[0] = cubes[i].getAttribute('currency');
			array[1] = cubes[i].getAttribute('rate') / usdRate;
			fiatRates.push(array);
		}
	}
	chrome.storage.local.get(null, (result) => {
		result['fiatRates'] = fiatRates;
		chrome.storage.local.set(result);
		console.log(result);
	})
	/*
	var millisTill1 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0, 0) - now;
	if (millisTill1 < 0) {
		millisTill1 += 86400000;
	}
	setTimeout(() => {
		httpGetAsync('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', storeFiatRates, 'XML');
		//httpGetAsync(newsUrl, storeNews, 'JSON');
	}, millisTill1);
	*/
}

/*
function storeNews(jsonNews) {
	console.log(jsonNews);
	var jsonNewsArray = [];
	if (jsonNews.length < 20) {
		for (var i = 0; i < jsonNews.length; i++) {
			var array = [];
			array[0] = jsonNews.articles[i].urlToImage;
			array[1] = jsonNews.articles[i].url;
			array[2] = jsonNews.articles[i].title;
			array[3] = jsonNews.articles[i].author;
			array[4] = jsonNews.articles[i].source.name;
			array[5] = jsonNews.articles[i].publishedAt;
			jsonNewsArray.push(array);
		}
	} else {
		console.log(jsonNews.length);
		for (var i = 0; i < 20; i++) {
			console.log(i);
			var array = [];
			array[0] = jsonNews.articles[i].urlToImage;
			array[1] = jsonNews.articles[i].url;
			array[2] = jsonNews.articles[i].title;
			array[3] = jsonNews.articles[i].author;
			array[4] = jsonNews.articles[i].source.name;
			array[5] = jsonNews.articles[i].publishedAt;
			jsonNewsArray.push(array);
		}
	}
	console.log(jsonNewsArray);
	chrome.storage.local.get(null, (result) => {
		result['jsonNewsArray'] = jsonNewsArray;
		result['date'] = getDate();
		chrome.storage.local.set(result);
		console.log(result);
	})
	
	var millisTill12 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0) - now;
	if (millisTill12 < 0) {
		millisTill12 += 86400000;
	}
	setTimeout(() => {
		httpGetAsync(newsUrl, storeNews, 'JSON');
	}, millisTill12);
	
}
*/

function getDate() {
  var today = new Date();
  var dd = today.getDate() - 1;
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;

  return today;
}

function getNewsUrl() {
	date = getDate();
	console.log(date);
	var newsUrl = 'https://newsapi.org/v2/everything?' +
	          'q=cryptocurrency&' +
	          'language=en&' +
	          'sources=crypto-coins-news,ars-technica,business-insider,engadget,financial-times,fortune,hacker-news,next-big-future,recode,reddit-r-all,techcrunch,techradar,the-economist,the-new-york-times,the-next-web,the-verge,the-wall-street-journal,the-washington-post,wired,bloomberg&' +
	          'sortBy=popularity&' +
	          'from=' + date + '&' +
	          'pageSize=100&' +
	          'page=1&' + 
	          'apiKey=7f08d87feaa44d26ab1a2aa67943808f';

	return newsUrl;
}

function getCoins() {
	theUrl = 'https://min-api.cryptocompare.com/data/all/coinlist';
	httpGetAsync(theUrl, storeCoinList, 'JSON');
}

function storeCoinList(coinList) {
	chrome.storage.local.get(null, (result) => {
		result['coinList'] = coinList;
		chrome.storage.local.set(result);
		console.log(result);
	});
}

function stream(message, popup, cachedPrices, cachedChanges) {
	var currentPrice = {};
	var dataUnpack = function(message, popup, cachedPrices, cachedChanges) {
		var data = CCC.CURRENT.unpack(message);
		var from = data['FROMSYMBOL'];
		var to = data['TOSYMBOL'];
		var fsym = CCC.STATIC.CURRENCY.getSymbol(from);
		var tsym = CCC.STATIC.CURRENCY.getSymbol(to);
		var pair = from + to;

		if (!currentPrice.hasOwnProperty(pair)) {
			currentPrice[pair] = {};
		}

		for (var key in data) {
			currentPrice[pair][key] = data[key];
		}

		if (currentPrice[pair]['LASTTRADEID']) {
			currentPrice[pair]['LASTTRADEID'] = parseInt(currentPrice[pair]['LASTTRADEID']).toFixed(0);
		}
		currentPrice[pair]['CHANGE24HOUR'] = CCC.convertValueToDisplay(tsym, (currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']));
		currentPrice[pair]['CHANGE24HOURPCT'] = ((currentPrice[pair]['PRICE'] - currentPrice[pair]['OPEN24HOUR']) / currentPrice[pair]['OPEN24HOUR'] * 100).toFixed(2) + "%";
		if (currentPrice[pair]['TYPE'] == 5) {
			cachedPrices, cachedChanges = displayData(currentPrice[pair], from, tsym, fsym, popup, cachedPrices, cachedChanges);
		}
		return cachedPrices, cachedChanges;
	};

	var displayData = function(messageToDisplay, from, tsym, fsym, popup, cachedPrices, cachedChanges) {
		/*
		var priceDiv = popup.getElementById('circlePrice' + from);
		var changeDiv = popup.getElementById('circleChange' + from);
		var priceDiv = document.getElementById('price' + from);
		var changeDiv = document.getElementById('change' + from);
		*/
		var priceDirection = messageToDisplay.FLAGS;
		var fields = CCC.CURRENT.DISPLAY.FIELDS;

		for (var key in fields) {
			if (messageToDisplay[key]) {
				if (fields[key].Show) {
					switch (fields[key].Filter) {
						case 'String':
							if (key == 'CHANGE24HOURPCT' && messageToDisplay[key] != 'NaN%') {
								cachedChanges[from] = messageToDisplay[key];
								if (popup) {
									popup.getElementById('circleChange' + from).innerHTML = messageToDisplay[key];
								}
							}
							//console.log(key);
							//console.log(messageToDisplay[key]);
							break;
						case 'Number':
							//console.log(key);
							var symbol = fields[key].Symbol == 'TOSYMBOL' ? tsym : fsym;
							if (key == 'PRICE') {
								var price = CCC.convertValueToDisplay(symbol, messageToDisplay[key]);
								var splitPrice = price.split(' ');
								splitPrice[1] = parseFloat(splitPrice[1].replace(',','')).toFixed(2);
								price = splitPrice[0] + ' ' + splitPrice[1];
								cachedPrices[from] = price;
								if (popup) {
									console.log(from);
									popup.getElementById('circlePrice' + from).innerHTML = price;
								}
								/*
								if (openPopup) {
									if (from == openPopup) {
										var views = chrome.extension.getViews({
											type: "tab"
										});
										//console.log(views);
										var options = views[0].document;
										options.getElementById('alertsPopupPrice').innerHTML = 'Current Price: ' + price;
									}
								}
								*/
							}
							//console.log(key);
							//console.log(CCC.convertValueToDisplay(symbol, messageToDisplay[key]));
							break;
					}
				}
			}
		}
		return cachedPrices, cachedChanges;
	};
	cachedPrices, cachedChanges = dataUnpack(message, popup, cachedPrices, cachedChanges);

	return cachedPrices, cachedChanges;
}

function getNews() {
	theUrl = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&excludeCategories=Sponsored&sortOrder=popular';
	httpGetAsync(theUrl, storeNews, 'JSON');
}
function storeNews(news) {
	chrome.storage.local.get(null, (result) => {
		result['news'] = news;
		chrome.storage.local.set(result);
		console.log(result);
	});
}

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == 'install') {
		storeObj = {};
		storeObj['Fiat'] = 'USD';
		storeObj['currencyArray'] = ['BTC', 'ETH', 'XRP', 'BCH', 'EOS', 'LTC', 'ADA', 'XLM', 'IOT'];
		storeObj['portfolioArray'] = [];
		storeObj['alertArray'] = [];
		var alertTimer = [];
		alertTimer[0] = 30;
		alertTimer[1] = 'minutes';
		storeObj['alertTimer'] = alertTimer;
		chrome.storage.local.set(storeObj);
		httpGetAsync('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', storeFiatRates, 'XML');
		httpGetAsync('https://api.coinmarketcap.com/v1/ticker/?convert=USD&limit=0', storeJson, 'JSON');
		var newsUrl = getNewsUrl()
		httpGetAsync(newsUrl, storeNews, 'JSON');
		initSocket();
	} else if (details.reason == 'update') {
		/*
		var storeObj = {};
		storeObj['Fiat'] = 'USD';
		storeObj['currencyArray'] = ['BTC', 'ETH', 'XRP', 'BCH', 'EOS', 'LTC', 'ADA', 'XLM', 'IOT'];
		storeObj['portfolioArray'] = [];
		storeObj['alertArray'] = [];
		var alertTimer = [];
		alertTimer[0] = 30;
		alertTimer[1] = 'minutes';
		storeObj['alertTimer'] = alertTimer;
		chrome.storage.local.set(storeObj);
		httpGetAsync('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', storeFiatRates, 'XML');
		httpGetAsync('https://api.coinmarketcap.com/v1/ticker/?convert=USD&limit=0', storeJson, 'JSON');
		var newsUrl = getNewsUrl()
		httpGetAsync(newsUrl, storeNews, 'JSON');
		*/
		initSocket();
	}
})

function initSocket () {
	var openPopup = null;
	var socket = io.connect('https://streamer.cryptocompare.com/');
	chrome.storage.local.get(null, (result) => {
		if (result['currentSubs'] == undefined) {
			var currentSubs = {};
		} else {
			var currentSubs = result['currentSubs'];
		}
		var subscription = [];
		/*
		if (result['cachedPrices'] != undefined) {
			cachedPrices = result['cachedPrices'];
		}
		*/
		if (result['currencyArray'].length >= 1) {
			for (var i = 0; i < result['currencyArray'].length; i++) {
				subscription.push('5~CCCAGG~' + result['currencyArray'][i] + '~' + result['Fiat']);
				currentSubs[result['currencyArray'][i]] = result['Fiat'];
			}
		}
		if (result['alertArray'].length >= 1) {
			for (var i = 0; i < result['alertArray'].length; i++) {
				subscription.push('5~CCCAGG~' + result['alertArray'][i][0] + '~' + result['Fiat']);
				currentSubs[result['alertArray'][i][0]] = result['Fiat'];
			}
		}
		if (result['portfolioArray'].length >= 1) {
			for (var i = 0; i < result['portfolioArray'].length; i++) {
				subscription.push('5~CCCAGG~' + result['portfolioArray'][i][0] + '~' + result['Fiat']);
				currentSubs[result['portfolioArray'][i][0]] = result['Fiat'];
			}
		}
		console.log(currentSubs);
		console.log(subscription);
		socket.emit('SubAdd', { subs: subscription });
		result['currentSubs'] = currentSubs;
		chrome.storage.local.set(result);
	});
	var cachedPrices = {};
	var cachedChanges = {};
	socket.on("m", function(message) {
		console.log(message);
		var views = chrome.extension.getViews({
			type: "popup"
		});
		if (views.length > 0) {
			console.log(views);
			cachedPrices, cachedChanges = stream(message, views[0].document, cachedPrices, cachedChanges);
		} else {
			cachedPrices, cachedChanges = stream(message, null, cachedPrices, cachedChanges);
		}
	});
	socket.on('connect_timeout', (timeout) => {
		console.log('timeout');
		console.log(timeout);
	});
	socket.on('disconnect', (reason) => {
		console.log('disconnect');
		console.log(reason);
		chrome.storage.local.get(null, (result) => {
			if (result['currentSubs'] == undefined) {
				var currentSubs = {};
			} else {
				var currentSubs = result['currentSubs'];
			}
			var subscription = [];
			/*
			if (result['cachedPrices'] != undefined) {
				cachedPrices = result['cachedPrices'];
			}
			*/
			if (result['currencyArray'].length >= 1) {
				for (var i = 0; i < result['currencyArray'].length; i++) {
					subscription.push('5~CCCAGG~' + result['currencyArray'][i] + '~' + result['Fiat']);
					currentSubs[result['currencyArray'][i]] = result['Fiat'];
				}
			}
			if (result['alertArray'].length >= 1) {
				for (var i = 0; i < result['alertArray'].length; i++) {
					subscription.push('5~CCCAGG~' + result['alertArray'][i][0] + '~' + result['Fiat']);
					currentSubs[result['alertArray'][i][0]] = result['Fiat'];
				}
			}
			if (result['portfolioArray'].length >= 1) {
				for (var i = 0; i < result['portfolioArray'].length; i++) {
					subscription.push('5~CCCAGG~' + result['portfolioArray'][i][0] + '~' + result['Fiat']);
					currentSubs[result['portfolioArray'][i][0]] = result['Fiat'];
				}
			}
			console.log(subscription);
			socket.emit('SubAdd', { subs: subscription });
			result['currentSubs'] = currentSubs;
			chrome.storage.local.set(result);
		});
	});

	chrome.runtime.onMessage.addListener(function(request) {
		chrome.storage.local.get(null, (result) => {
			console.log(request);
			if (request && (request.id == 'alertsPopupOpened')) {
				console.log(request);
				console.log(request.symbol);
				var symbol = '5~CCCAGG~' + request.symbol + '~' + result['Fiat'];
				socket.emit('SubAdd', { subs: [symbol] });
				openPopup = request.symbol;
				if (cachedPrices[request.symbol] != undefined) {
					var views = chrome.extension.getViews({
						type: "tab"
					});
					//console.log(views);
					var options = views[0].document;
					options.getElementById('alertsPopupPrice').innerHTML = 'Current Price: ' + cachedPrices[request.symbol];
				}
			} else if (request && (request.id == 'alertsPopupClosed')) {
				console.log(result['currencyArray']);
				var remove = true;
				for (var i = 0; i < result['currencyArray'].length; i++) {
					if (result['currencyArray'][i] == request.symbol) {
						remove = false;
						break;
					}
				}
				if (remove) {
					console.log(request);
					console.log(request.symbol);
					var symbol = '5~CCCAGG~' + request.symbol + '~' + result['Fiat'];
					socket.emit('SubRemove', { subs: [symbol] });
					console.log(symbol);
				}
			} else if (request && (request.id == 'getCache')) {
				chrome.runtime.sendMessage({id: "getCacheResponse", data: [cachedPrices, cachedChanges]});
			} else if (request && (request.id == 'addSub')) {
				if (result['currentSubs'] == undefined) {
					var currentSubs = {};
				} else {
					var currentSubs = result['currentSubs'];
				}
				var symbol = '5~CCCAGG~' + request.symbol + '~' + result['Fiat'];
				socket.emit('SubAdd', { subs: [symbol] });
				currentSubs[result[request.symbol]] = result['Fiat'];
				result['currentSubs'] = currentSubs;
				chrome.storage.local.set(result);
			} else if (request && (request.id == 'removeSub')) {
				var remove = true;
				for (var i = 0; i < result['currencyArray'].length; i++) {
					if (request.symbol == result['currencyArray'][i]) {
						remove = false;
						break;
					}
				}
				if (remove) {
					for (var i = 0; i < result['alertArray'].length; i++) {
						if (request.symbol == result['alertArray'][i][0]) {
							remove = false;
							break;
						}
					}
				}
				if (remove) {
					for (var i = 0; i < result['portfolioArray'].length; i++) {
						if (request.symbol == result['portfolioArray'][i][0]) {
							remove = false;
							break;
						}
					}
				}
				if (remove) {
					var currentSubs = result['currentSubs'];
					var symbol = '5~CCCAGG~' + request.symbol + '~' + currentSubs[request.symbol];
					socket.emit('SubRemove', { subs: [symbol] });
					delete cachedPrices[symbol];
					delete cachedChanges[symbol];
					delete currentSubs[symbol];
					result['currentSubs'] = currentSubs;
					chrome.storage.local.set(result);
				}
			} else if (request && (request.id == 'switchFiat')) {
				var currentSubs = result['currentSubs'];
				if (currentSubs != undefined) {
					var removeSubs = [];
					var addSubs = [];
					for (var key in currentSubs) {
						removeSubs.push('5~CCCAGG~' + key + '~' + currentSubs[key]);
						addSubs.push('5~CCCAGG~' + key + '~' + request.fiat);
					}
					socket.emit('SubRemove', { subs: removeSubs });
					socket.emit('SubAdd', { subs: addSubs });
				}
			}
		});
	});
}
//var subscription = ['5~CCCAGG~BTC~USD', '5~CCCAGG~ETH~USD'];

getCoins();
getNews();

var fiatSymbols = {USD: '$', AUD: '$', BRL: '$', CAD: '$', CHF: 'CHF ', CLP: '$', 
                  CNY: '&#165;', CZK: '&#x4b;&#x10d;', DKK: '&#x6b;&#x72;', EUR: '&#128;', GBP: '&#8356;', HKD: '$', 
                  HUF: '&#x46;&#x74;', IDR: '&#x52;&#x70;', ILS: '&#x20aa;', INR: '&#x20B9;', JPY: '&#165;', KRW: '&#x20a9;',
                  MXN: '$', MYR: '&#x52;&#x4d;', NOK: '&#x6b;&#x72;', NZD: '$', PHP: '&#8369;', PKR: '&#8360;', 
                  PLN: '&#x7a;&#x142;', RUB: '&#x20bd;', SEK: '&#x6b;&#x72;', SGD: '$', THB: '&#xe3f;', TRY: '&#8378;',
                  TWD: '$', ZAR: '&#x52;'};

var now = new Date();
/*
var millisTill12 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0) - now;
if (millisTill12 < 0) {
	millisTill12 += 86400000;
}
*/
chrome.storage.local.get(null, (result) => {
	if (result['jsonNewsArray'] == undefined) {
		console.log('No News');
		console.log(millisTill12);
		var newsUrl = getNewsUrl()
		httpGetAsync(newsUrl, storeNews, 'JSON');
		/*
		setTimeout(() => {
			httpGetAsync(newsUrl, storeNews, 'JSON');
		}, millisTill12);
		*/
	} else if (result['date'] != getDate()) {
		console.log('New News');
		//console.log(millisTill12);
		if (now.getHours() >= 12 && now.getMinutes() > 0) {
			var newsUrl = getNewsUrl()
			httpGetAsync(newsUrl, storeNews, 'JSON');
		} /*else {
			setTimeout(() => {
				httpGetAsync(newsUrl, storeNews, 'JSON');
			}, millisTill12);
		}
		*/
	} /*else {
		console.log('Wait for News');
		console.log(millisTill12);
		setTimeout(() => {
			httpGetAsync(newsUrl, storeNews, 'JSON');
		}, millisTill12);
	}*/
})

httpGetAsync('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', storeFiatRates, 'XML');

setInterval(() => {
	chrome.storage.local.get(null, (result) => {
		if ((now.getHours() == 12 && now.getMinutes() <= 5) && result['date'] != gatDate()) {
			var newsUrl = getNewsUrl()
			httpGetAsync(newsUrl, storeNews, 'JSON');
			httpGetAsync('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', storeFiatRates, 'XML');
		} else if ((now.getHours() == 11 && now.getMinutes() >= 55) && result['date'] != gatDate()) {
			var newsUrl = getNewsUrl()
			httpGetAsync(newsUrl, storeNews, 'JSON');
			httpGetAsync('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', storeFiatRates, 'XML');
		} 
	})
}, 300000);

/*
var dayInMilliseconds = 1000 * 60 * 60 * 24;
var millisTill1 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0, 0) - now;
if (millisTill1 < 0) {
	millisTill1 += 86400000;
}
console.log(millisTill1);
setTimeout(() => {
	httpGetAsync('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml', storeFiatRates, 'XML');
	//httpGetAsync(newsUrl, storeNews, 'JSON');
}, millisTill1);
*/

/*
chrome.storage.local.get(null, (result) => {
	httpGetAsync('https://api.coinmarketcap.com/v1/ticker/?convert=' + result['Fiat'] + '&limit=0', storeJson, 'JSON');
});
*/

setInterval(() => {
	chrome.storage.local.get(null, (result) => {
		httpGetAsync('https://api.coinmarketcap.com/v1/ticker/?convert=' + result['Fiat'] + '&limit=0', storeJson, 'JSON');
	});
}, 300000);

var num = 5;

getNum();

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
	if (btnIdx == 1) {
		chrome.storage.local.get(null, (result) => {
			var alertArray = result['alertArray'];
			console.log(alertArray);
			console.log(alertArray[notifId]);
			console.log(alertArray[parseInt(notifId)]);
			var removeAlert = true;
			for (var i = 0; i < result['currencyArray']; i++) {
				if (alertArray[parseInt(notifId)][0] == result['currencyArray'][i]) {
					removeAlert = false;
					break;
				}
			}
			if (removeAlert) {
				for (var i = 0; i < result['portfolioArray'].length; i++) {
					if (alertArray[parseInt(notifId)][0] == result['portfolioArray'][i][0]) {
						removeAlert = false;
						break;
					}
				}
			}
			if (removeAlert) {
				if (result['currentSubs'] == undefined) {
					var currentSubs = {};
				} else {
					var currentSubs = result['currentSubs'];
				}
				var symbol = '5~CCCAGG~' + alertArray[parseInt(notifId)][0] + '~' + currentSubs[alertArray[parseInt(notifId)][0]];
				console.log(symbol);
				socket.emit('SubRemove', { subs: [symbol] });
				delete currentSubs[alertArray[parseInt(notifId)][0]];
				result['currentSubs'] = currentSubs;
			}
			alertArray.splice(parseInt(notifId));
			result['alertArray'] = alertArray;
			chrome.storage.local.set(result);
			chrome.notifications.clear(notifId);
			console.log(result);
		})
	} else if (btnIdx == 0) {
		chrome.runtime.openOptionsPage();
	}
})

var alertTimeout;
var currentNum;

setInterval(() => {
	var newNum = 0;
	chrome.storage.local.get(null, (result) => {
		if (result['alertTimer'][1] == 'hours') {
			newNum = parseInt(result['alertTimer'][0]) * 3600000; 
		} else if (result['alertTimer'][1] == 'minutes') {
			newNum = parseInt(result['alertTimer'][0]) * 60000;
		}
		//console.log(newNum);
		//console.log(currentNum);
		if (newNum != currentNum) {
			console.log('new');
			clearTimeout(alertTimeout);
			createTimeout(newNum);
		}
	})
}, 30000)

function createTimeout(num) {
	currentNum = num;
	console.log(num);
	alertTimeout = setTimeout(function(){
		checkStorage();
		getNum();
	}, num)
}

function getNum() { 
	chrome.storage.local.get(null, (result) => {
		console.log(result['alertTimer']);
		if (result['alertTimer'][1] == 'hours') {
			var numMultiplier = 3600000;
		} else if (result['alertTimer'][1] == 'minutes') {
			var numMultiplier = 60000;
		} else {
			numMultiplier = 60000;
		}
		if (result['alertTimer'][0].length < 1 || result['alertTimer'][0] == 'null') {
			num = 5;
		} else {
			num = result['alertTimer'][0];
		}
		createTimeout(parseInt(num) * numMultiplier);
	})
}

function checkStorage() {
	chrome.storage.local.get(null, (result) => {
		var fiat = result['Fiat'];
		var alertArray = result['alertArray'];
		checkVals(alertArray, fiat, result['json']);
	})
};

function alert(currency, num, ab, price, index, fiat) {
	var tm = Date.now();
	tm += 60000;
	chrome.notifications.create(index.toString(), {
		type: 'basic',
		iconUrl: 'icon.png',
		title: currency + ' is ' + ab + ' ' + fiatSymbols[fiat] + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
		message: currency + ' is currently worth ' + fiatSymbols[fiat] + parseFloat(price).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
		eventTime: tm,
		buttons: [{
			title: 'Edit',
			iconUrl: 'pencil.png'
		}, {
			title: 'Remove',
			iconUrl: 'close.png'
		}]
	})
}

function checkVals(alertArray, fiat, json) {
	console.log(cachedPrices);
	for (var i = 0; i < alertArray.length; i++) {
		console.log(alertArray[i]);
		var symbol = alertArray[i][0];
		var above = alertArray[i][1];
		var below = alertArray[i][2];
		console.log(cachedPrices[symbol]);
		var price = cachedPrices[symbol].replace('$ ', '');
		if (above != null && parseInt(price) > parseInt(above)) {
			alert(symbol, above, 'above', price, i, fiat);
		}
		if (below != null && parseInt(price) < parseInt(below)) {
			alert(symbol, below, 'below', price, i, fiat);
		}
	}
	/*
	var jsonPrice = 'price_' + fiat.toLowerCase();
	for (var i = 0; i < obj['alertArray'].length; i++) {
		var currency = obj['alertArray'][i][0].toLowerCase();
		console.log(obj['alertArray'][i]);
		var above = obj['alertArray'][i][1];
		var below = obj['alertArray'][i][2];
		for (var j = 0; j < json.length; j++) {
			if (json[j]['id'] == currency) {
				if (above != null && parseInt(json[j][jsonPrice]) > parseInt(above)) {
					alert(json[j]['name'], above, 'above', json[j][jsonPrice], i, fiat);
				}
				if (below != null && parseInt(json[j][jsonPrice]) < parseInt(below)) {
					alert(json[j]['name'], below, 'below', json[j][jsonPrice], i, fiat);
				}
				break;
			}
		}
	}
	*/
}