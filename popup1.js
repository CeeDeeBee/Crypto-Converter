function displayHome(currencyArray, fiat, coinList, cachedPrices, cachedChanges) {
  var homePage = document.getElementById('homePage');
  homePage.innerHTML = '';
  if (currencyArray.length > 9) {
    homePage.setAttribute('class', 'scroll')
  }
  for (var i = 0; i < currencyArray.length; i++) {
    var currency = currencyArray[i];
    console.log(currency);
    var symbol = coinList['Data'][currency]['Symbol'];
    var coinName = coinList['Data'][currency]['CoinName'];
    var circleBackground = homePage.appendChild(document.createElement('div'));
    circleBackground.setAttribute('class', 'circleBackground');
    var circle = circleBackground.appendChild(document.createElement('div'));
    circle.setAttribute('class', 'circle');
    var frontCircle = circle.appendChild(document.createElement('div'));
    frontCircle.setAttribute('class', 'frontCircle');
    var circleText = frontCircle.appendChild(document.createElement('div'));
    circleText.setAttribute('class', 'circleText');
    circleText.setAttribute('id', 'circleText' + symbol);
    var circleName = circleText.appendChild(document.createElement('div'));
    circleName.setAttribute('class', 'circleName');
    circleName.setAttribute('id', 'circleName' + symbol);
    var circleNums = circleText.appendChild(document.createElement('div'));
    var circlePrice = circleNums.appendChild(document.createElement('div'));
    circlePrice.setAttribute('id', 'circlePrice' + symbol);
    var circleChange = circleNums.appendChild(document.createElement('div'));
    circleChange.setAttribute('id', 'circleChange' + symbol);
    console.log(coinList['Data'][currency]);
    if (coinName.length < 15) {
      circleName.innerHTML = coinName + '<br>' + '(' + symbol + ')';
    } else {
      circleName.innerHTML = symbol;
    }
    if (cachedPrices[currency] == undefined) {
      circlePrice.innerHTML = 'is unavaliable';
      circleChange.innerHTML = 'in ' + fiat;
      circle.style.backgroundColor = '#90a4ae';
    } else {
      circlePrice.innerHTML = cachedPrices[currency];
      circleChange.innerHTML = cachedChanges[currency];
      if (cachedChanges[currency].replace('%','') > 0) {
        circle.style.backgroundColor = '#43a047';
      } else if (cachedChanges[currency].replace('%','') == 0) {
       circle.style.backgroundColor = '#90a4ae';
      } else {
        circle.style.backgroundColor = '#e53935';
      }
    }
    circleName.addEventListener('click', (e) => {
      var currencyUrl = coinList['BaseLinkUrl'] + coinList['Data'][e.target.id.replace('circleName','')]['Url'];
      chrome.tabs.create({url: currencyUrl});
    })
  }
};

function clearInput() {
  checkedList = {};
  chrome.storage.local.clear();
  return checkedList;
};

function checkStorage() {
  var currencyArray = [];
  var init = false;
  chrome.storage.local.get(null, (result) => {
  	chrome.runtime.sendMessage({id: "getCache"});
	chrome.runtime.onMessage.addListener(function(request) {
	  if (!init) {
	  	if (request && (request.id == 'getCacheResponse')) {
		  cachedPrices = request.data[0];
		  cachedChanges = request.data[1];
		  console.log(cachedPrices);
		  console.log(cachedChanges);
		  console.log(result);
	      displayHome(result['currencyArray'], result['Fiat'], result['coinList'], cachedPrices, cachedChanges);
	      displayPortfolio(result['portfolioArray'], result['Fiat'], result['coinList'], cachedPrices, cachedChanges);
	      displayNews(result['news']);
	      displayDefaultRates(result['fiatRates'], result['Fiat'], result['currencyArray'], cachedPrices);
	      init = true;
		}
	  }
	});
  });
}

function displayNews(news) {
  console.log('display news');
  var newsPage = document.getElementById('newsPage');
  while (newsPage.hasChildNodes()) {
  	newsPage.removeChild(newsPage.lastChild);
  }
  var pageHeight = 0;
  var articles = news['Data'];
  for (var i = 0; i < articles.length; i++) {
    var newsDiv = newsPage.appendChild(document.createElement('div'));
    newsDiv.setAttribute('class', 'newsDiv');
    var pic = newsDiv.appendChild(document.createElement('img'));
    pic.setAttribute('src', articles[i]['imageurl']);
    pic.setAttribute('class', 'newsImg');
    var newsText = newsDiv.appendChild(document.createElement('div'));
    var link = newsText.appendChild(document.createElement('a'));
    link.setAttribute('href', articles[i]['url']);
    link.setAttribute('class', 'newsLink');
    link.innerHTML = articles[i]['title'];
    var newsPub = newsText.appendChild(document.createElement('div'));
    newsPub.innerHTML = 'Publication: ' + articles[i]['source_info']['name'];
    var newsDate = newsText.appendChild(document.createElement('div'));
    var date = new Date(articles[i]['published_on'] * 1000);
    if (date.getMinutes() < 10) {
    	var minutes = '0' + date.getMinutes();
    } else {
    	var minutes = date.getMinutes();
    }
    newsDate.innerHTML = 'Published On: ' + date.toDateString() + ' at ' + date.getHours() + ':' + minutes;
    newsPage.style.display = 'block';
    pic.setAttribute('height', (newsDiv.offsetHeight - 14) + 'px');
    newsPage.style.display = 'none';
  }
}

function displayPortfolio(portfolioArray, fiat, coinList, cachedPrices, cachedChanges) {
  if (Object.keys(portfolioArray).length < 1) {
    document.getElementById('d3Container').style.display = 'none';
    document.getElementById('portfolioDetails').style.display = 'none';
    document.getElementById('emptyPortfolio').style.display = 'block';
  } else {
    var portfolioTable = document.getElementById('portfolioTable');
    if (portfolioTable.rows.length <= 2) {
      var tbody = document.createElement('tbody');
      var tableBody = portfolioTable.appendChild(tbody);
      var totalValue = 0;
      var tfHrTotal = 0;
      if (Object.keys(portfolioArray).length > 9) {
        document.getElementById('legend').setAttribute('class', 'scroll');
      }
	  displayTable(portfolioArray, coinList, cachedPrices, cachedChanges);

      function displayTable(portfolioArray, coinList, cachedPrices, cachedChanges) {
        for (var key in portfolioArray) {
          var symbol = key;
          var price = cachedPrices[symbol].substring(cachedPrices[symbol].indexOf(" ") + 1).replace(',','');
          var value = (parseFloat(price) * parseFloat(portfolioArray[key])).toFixed(2);
          var row = tableBody.insertRow();
          row.setAttribute('class', 'portfolioTableRow');
          row.setAttribute('id', symbol);
          row.setAttribute('data-url', coinList['Data'][symbol]['Url']);
          var currencyCell = row.insertCell(0);
          currencyCell.setAttribute('class', 'currencyCell');
          if (coinList['Data'][symbol]['FullName'].length < 25) {
            currencyCell.innerHTML = coinList['Data'][symbol]['FullName'];
          } else {
            currencyCell.innerHTML = symbol;
          }
          currencyCell.addEventListener('click', (e) => {
            var currencyUrl = coinList['BaseLinkUrl'] + e.target.parentElement.dataset.url;
            chrome.tabs.create({url: currencyUrl});
          })
          var amountCell = row.insertCell(1);
          amountCell.innerHTML = portfolioArray[key];
          var valueCell = row.insertCell(2);
          valueCell.innerHTML = parseFloat(value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          var tfHrCell = row.insertCell(3);
          tfHrPrice = (value / (1 + (cachedChanges[symbol].replace('%','') / 100)));
          tfHrValue = (value - tfHrPrice).toFixed(2);
          tfHrCell.innerHTML = parseFloat(tfHrValue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          if (tfHrValue < 0) {
            tfHrCell.style.color = 'red';
          } else {
            tfHrCell.style.color = 'green';
          }
          tfHrTotal += +tfHrValue;
          totalValue += +value;
        }
        var portfolioTableFooter = document.getElementById('portfolioTableFooter');
        var valueCellTotal = portfolioTableFooter.insertCell(2);
        valueCellTotal.innerHTML = totalValue.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        var tfHrCellTotal = portfolioTableFooter.insertCell(3);
        tfHrCellTotal.innerHTML = tfHrTotal.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (tfHrTotal < 0) {
          tfHrCellTotal.style.color = 'red';
        } else {
          tfHrCellTotal.style.color = 'green';
        }
      }
    }
  }
}

function displayDefaultRates(fiatRates, fiat, currencyArray, cachedPrices) {
  var defaultRateDivs = document.getElementsByClassName('defaultRate');
  var defaultRateTextDivs = document.getElementsByClassName('defaultRateText');
  var defaultRateNumDivs = document.getElementsByClassName('defaultRateNum');
  if (fiat != 'USD') {
  	for (var i = 0; i < fiatRates.length; i++) {
      if (fiatRates[i][0] == fiat) {
  	  	var convertRate = (1 / fiatRates[i][1]);
  	  	break;
  	  }
  	}
  	console.log(convertRate);
  	for (var key in cachedPrices) {
  	  cachedPrices[key] = cachedPrices[key].substring(cachedPrices[key].indexOf(" ") + 1) * convertRate;
  	}
  	console.log(cachedPrices);
  } else {
  	for (var key in cachedPrices) {
  	  cachedPrices[key] = cachedPrices[key].substring(cachedPrices[key].indexOf(" ") + 1);
  	}
  }
  for (var j = 0; j < fiatRates.length; j++) {
    if (fiatRates[j][0] == fiat) {
      for (var i = 0; i < 8; i++) {
        var currency = currencyArray[Math.floor(i/2)];
        if (currency != undefined) {
          if (i % 2 != 0) {
            defaultRateTextDivs[i].innerHTML = '100 ' + currency + '/' + fiatRates[j][0];
            defaultRateNumDivs[i].innerHTML = fiatSymbols[fiat] + ((cachedPrices[currency] * 100) * fiatRates[j][1]).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          } else {
            defaultRateTextDivs[i].innerHTML = fiatRates[j][0] + '/' + currency;
            defaultRateNumDivs[i].innerHTML = (fiatRates[j][1] / cachedPrices[currency]).toFixed(10);
          }
        } else {
          defaultRateDivs[i].style.display = 'none';
        }
      }
    }
  }
}

var fiatSymbols = {USD: '$', AUD: '$', BRL: '$', CAD: '$', CHF: 'CHF ', CLP: '$', 
                  CNY: '&#165;', CZK: '&#x4b;&#x10d;', DKK: '&#x6b;&#x72;', EUR: '&#128;', GBP: '&#8356;', HKD: '$', 
                  HUF: '&#x46;&#x74;', IDR: '&#x52;&#x70;', ILS: '&#x20aa;', INR: '&#x20B9;', JPY: '&#165;', KRW: '&#x20a9;',
                  MXN: '$', MYR: '&#x52;&#x4d;', NOK: '&#x6b;&#x72;', NZD: '$', PHP: '&#8369;', PKR: '&#8360;', 
                  PLN: '&#x7a;&#x142;', RUB: '&#x20bd;', SEK: '&#x6b;&#x72;', SGD: '$', THB: '&#xe3f;', TRY: '&#8378;',
                  TWD: '$', ZAR: '&#x52;', BTC: 'Ƀ'};

document.addEventListener('DOMContentLoaded', () => {
  //clearInput();
  checkStorage();
  var homeButton = document.getElementById('homeButton');
  var homePage = document.getElementById('homePage');
  var newsButton = document.getElementById('newsButton');
  var newsPage = document.getElementById('newsPage');
  var portfolioPage = document.getElementById('portfolioPage');
  var convertPage = document.getElementById('convertPage');
  var homeTab = document.getElementById('tab1-tab');
  var newsTab = document.getElementById('tab2-tab');
  var portfolioTab = document.getElementById('tab3-tab');
  var convertTab = document.getElementById('tab4-tab');
  homeTab.addEventListener('click', () => {
    homeTab.setAttribute('class', 'active');
    newsTab.setAttribute('class', 'hidden');
    portfolioTab.setAttribute('class', 'hidden');
    convertTab.setAttribute('class', 'hidden');
    homePage.style.display = 'block';
    newsPage.style.display = 'none';
    portfolioPage.style.display = 'none';
    convertPage.style.display = 'none';
  });
  newsTab.addEventListener('click', () => {
    homeTab.setAttribute('class', 'hidden');
    newsTab.setAttribute('class', 'active');
    portfolioTab.setAttribute('class', 'hidden');
    convertTab.setAttribute('class', 'hidden');
    homePage.style.display = 'none';
    newsPage.style.display = 'block';
    portfolioPage.style.display = 'none';
    convertPage.style.display = 'none';
  });
  var portfolioButton = document.getElementById('portfolioButton');
  portfolioTab.addEventListener('click', () => {
    homeTab.setAttribute('class', 'hidden');
    newsTab.setAttribute('class', 'hidden');
    portfolioTab.setAttribute('class', 'active');
    convertTab.setAttribute('class', 'hidden');
    homePage.style.display = 'none';
    newsPage.style.display = 'none';
    portfolioPage.style.display = 'block';
    convertPage.style.display = 'none';
  })
  document.getElementById('emptyPortfolioAdd').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  })
  var convertInputs = document.getElementsByClassName('convertInput');
  var convertButton = document.getElementById('convertButton');
  convertTab.addEventListener('click', () => {
    homeTab.setAttribute('class', 'hidden');
    newsTab.setAttribute('class', 'hidden');
    portfolioTab.setAttribute('class', 'hidden');
    convertTab.setAttribute('class', 'active');
    homePage.style.display = 'none';
    newsPage.style.display = 'none';
    portfolioPage.style.display = 'none';
    convertPage.style.display = 'block';
    convertInputs[0].value = '';
    convertInputs[1].value = '';
  })
  var optionsTab = document.getElementById('tab5-tab');
  optionsTab.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  })
  chrome.runtime.sendMessage({ id: "getNews" });
  chrome.runtime.onMessage.addListener(function(request) {
	console.log(request);
	chrome.storage.local.get(null, (result) => {
	  if (request && (request.id == 'newsResponse')) {
		displayNews(result['news']);
	  }
	})
  })
  //News Page Event Listener
  newsPage.addEventListener('click', function(e) {
    if (e.target.className == 'newsLink') {
      chrome.tabs.create({url: e.target.href});
    }
  });
  //Convert Page
  chrome.storage.local.get(null, (result) => {
  	console.log(result);
    var fiatRates = result['fiatRates'];
    var fiat = result['Fiat'];
    var currencyArray = result['currencyArray'];
    var select1 = document.getElementById('select1');
    var select1Option = select1.options[select1.selectedIndex].id;
    chrome.runtime.sendMessage({id: "addSub", symbol: select1.options[select1.selectedIndex].id });
    select1.addEventListener('change', () => {
      if (select1.options[select1.selectedIndex].className == 'crypto') {
        convertInputs[0].setAttribute('placeholder', select1.options[select1.selectedIndex].id);
        convertInputs[0].setAttribute('id', select1.options[select1.selectedIndex].id);
        chrome.runtime.sendMessage({id: "addSub", symbol: select1.options[select1.selectedIndex].id });
        chrome.runtime.sendMessage({id: "removeSub", symbol: select1Option });
        select1Option = select1.options[select1.selectedIndex].id;
      } else if (select1.options[select1.selectedIndex].className == 'fiat') {
        convertInputs[0].setAttribute('placeholder', select1.options[select1.selectedIndex].id);
        convertInputs[0].setAttribute('id', select1.options[select1.selectedIndex].id);
        chrome.runtime.sendMessage({id: "removeSub", symbol: select1Option });
        select1Option = select1.options[select1.selectedIndex].id;
      }
      convertInputs[0].value = '';
      convertInputs[1].value = '';
    })
    var select2 = document.getElementById('select2');
    var select2Option = select2.options[select2.selectedIndex].id;
    select2.addEventListener('change', () => {
      if (select2.options[select2.selectedIndex].className == 'crypto') {
        convertInputs[1].setAttribute('placeholder', select2.options[select2.selectedIndex].id);
        convertInputs[1].setAttribute('id', select2.options[select2.selectedIndex].id);
        chrome.runtime.sendMessage({id: "addSub", symbol: select1.options[select1.selectedIndex].id });
        chrome.runtime.sendMessage({id: "removeSub", symbol: select2Option });
        select2Option = select2.options[select2.selectedIndex].id;
      } else if (select2.options[select2.selectedIndex].className == 'fiat') {
        convertInputs[1].setAttribute('placeholder', select2.options[select2.selectedIndex].id);
        convertInputs[1].setAttribute('id', select2.options[select2.selectedIndex].id);
        chrome.runtime.sendMessage({id: "removeSub", symbol: select2Option });
        select1Option = select1.options[select1.selectedIndex].id;
      }
      convertInputs[0].value = '';
      convertInputs[1].value = '';
    })
    var fiatSelects = document.getElementsByClassName('fiat');
    for (var i = 0; i < fiatSelects.length; i++) {
      if (fiatSelects[i].innerHTML.length > 20) {
        fiatSelects[i].style.fontSize = (20 / fiatSelects[i].innerHTML.length) * 100 + '%';
      }
    }
    convertInputs[0].addEventListener('input', () => {
      if (convertInputs[0].value.length == 0) {
        convertInputs[1].value = '';
      } else {
        var ran = false;
        chrome.runtime.sendMessage({id: "getCache"});
        chrome.runtime.onMessage.addListener(function(request) {
          if (!ran) {
            if (request && (request.id == 'getCacheResponse')) {
              console.log(request);
              var convertCachedPrices = request.data[0];
              if (fiat != 'USD') {
              	for (var i = 0; i < fiatRates.length; i++) {
              		if (fiatRates[i][0] == fiat) {
              			var convertRate = (1 / fiatRates[i][1]);
              			break;
              		}
              	}
              	console.log(convertRate);
              	for (var key in convertCachedPrices) {
              		convertCachedPrices[key] = convertCachedPrices[key].substring(convertCachedPrices[key].indexOf(" ") + 1) * convertRate;
              	}
              	console.log(convertCachedPrices);
              } else {
              	for (var key in convertCachedPrices) {
              		convertCachedPrices[key] = convertCachedPrices[key].substring(convertCachedPrices[key].indexOf(" ") + 1);
              	}
              }
              if (select1.options[select1.selectedIndex].className == 'crypto') {
                var bitcoinPrice1 = 0;
                if (select2.options[select2.selectedIndex].className == 'crypto') {
                  var bitcoinPrice2 = 0;
                  bitcoinPrice1 = convertCachedPrices[convertInputs[0].id];
                  bitcoinPrice2 = convertCachedPrices[convertInputs[1].id];
                  convertInputs[1].value = convertInputs[0].value * (bitcoinPrice1 / bitcoinPrice2);
                }
                else if (select2.options[select2.selectedIndex].className == 'fiat') {
                  var fiatRate2 = 0;
                  bitcoinPrice1 = convertCachedPrices[convertInputs[0].id];
                  for (var i = 0; i < fiatRates.length; i++) {
                    if (fiatRates[i][0] == convertInputs[1].id) {
                      fiatRate2 = fiatRates[i][1];
                      break;
                    }
                  }
                  var val = convertInputs[0].value * (bitcoinPrice1 * fiatRate2);
                  convertInputs[1].value = val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
              } else if (select1.options[select1.selectedIndex].className == 'fiat') {
                var fiatRate1 = 0;
                if (select2.options[select2.selectedIndex].className == 'crypto') {
                  var bitcoinPrice2 = 0;
                  for (var i = 0; i < fiatRates.length; i++) {
                    if (fiatRates[i][0] == convertInputs[0].id) {
                      fiatRate1 = fiatRates[i][1];
                      break;
                    }
                  }
                  bitcoinPrice2 = convertCachedPrices[convertInputs[1].id];
                  convertInputs[1].value = convertInputs[0].value * (fiatRate1 / bitcoinPrice2);
                } else if (select2.options[select2.selectedIndex].className == 'fiat') {
                  var fiatRate2 = 0;
                  for (var i = 0; i < fiatRates.length; i++) {
                    if (fiatRates[i][0] == convertInputs[0].id) {
                      fiatRate1 = fiatRates[i][1];
                    } else if (fiatRates[i][0] == convertInputs[1].id) {
                      fiatRate2 = fiatRates[i][1];
                    }
                  }
                  var val = convertInputs[0].value * (fiatRate2 / fiatRate1)
                  convertInputs[1].value = val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
              }
            }
            ran = true;
          }
        });
      }
    })
    convertInputs[1].addEventListener('input', () => {
      if (convertInputs[1].value.length == 0) {
        convertInputs[0].value = '';
      } else {
        var ran = false;
        chrome.runtime.sendMessage({id: "getCache"});
        chrome.runtime.onMessage.addListener(function(request) {
          if (!ran) {
            if (request && (request.id == 'getCacheResponse')) {
              console.log(request);
              var convertCachedPrices = request.data[0];
              if (fiat != 'USD') {
              	for (var i = 0; i < fiatRates.length; i++) {
              		if (fiatRates[i][0] == fiat) {
              			var convertRate = (1 / fiatRates[i][1]);
              			break;
              		}
              	}
              	console.log(convertRate);
              	for (var key in convertCachedPrices) {
              		convertCachedPrices[key] = convertCachedPrices[key].substring(convertCachedPrices[key].indexOf(" ") + 1) * convertRate;
              	}
              	console.log(convertCachedPrices);
              } else {
              	for (var key in convertCachedPrices) {
              		convertCachedPrices[key] = convertCachedPrices[key].substring(convertCachedPrices[key].indexOf(" ") + 1);
              	}
              }
              if (select2.options[select2.selectedIndex].className == 'crypto') {
                var bitcoinPrice2 = 0;
                if (select1.options[select1.selectedIndex].className == 'crypto') {
                  var bitcoinPrice1 = 0;
                  bitcoinPrice2 = convertCachedPrices[convertInputs[1].id];
                  bitcoinPrice1 = convertCachedPrices[convertInputs[0].id];
                  convertInputs[0].value = convertInputs[1].value * (bitcoinPrice2 / bitcoinPrice1);
                }
                else if (select1.options[select1.selectedIndex].className == 'fiat') {
                  var fiatRate1 = 0;
                  bitcoinPrice2 = convertCachedPrices[convertInputs[1].id];
                  for (var i = 0; i < fiatRates.length; i++) {
                    if (fiatRates[i][0] == convertInputs[0].id) {
                      fiatRate1 = fiatRates[i][1];
                      break;
                    }
                  }
                  var val = convertInputs[1].value * (bitcoinPrice2 * fiatRate1);
                  convertInputs[0].value = val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
              } else if (select2.options[select2.selectedIndex].className == 'fiat') {
                var fiatRate2 = 0;
                if (select1.options[select1.selectedIndex].className == 'crypto') {
                  var bitcoinPrice1 = 0;
                  for (var i = 0; i < fiatRates.length; i++) {
                    if (fiatRates[i][0] == convertInputs[1].id) {
                      fiatRate2 = fiatRates[i][1];
                      break;
                    }
                  }
                  bitcoinPrice1 = convertCachedPrices[convertInputs[0].id];
                  console.log(bitcoinPrice1);
                  console.log(fiatRate2);
                  convertInputs[0].value = convertInputs[1].value * (fiatRate2 / bitcoinPrice1);//(fiatRate2 / bitcoinPrice1);
                } else if (select1.options[select1.selectedIndex].className == 'fiat') {
                  var fiatRate1 = 0;
                  for (var i = 0; i < fiatRates.length; i++) {
                    if (fiatRates[i][0] == convertInputs[0].id) {
                      fiatRate2 = fiatRates[i][1];
                    } else if (fiatRates[i][0] == convertInputs[1].id) {
                      fiatRate1 = fiatRates[i][1];
                    }
                  }
                  var val = convertInputs[1].value * (fiatRate2 / fiatRate1)
                  convertInputs[0].value = val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
              }
            }
            ran = true;
          }
        });
      }
    })
  });
});