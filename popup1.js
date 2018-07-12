function displayHome(currencyArray, fiat, json, coinList, cachedPrices, cachedChanges) {
  /*
  var cachedPrices = {};
  chrome.runtime.sendMessage({id: "getCache"});
  chrome.runtime.onMessage.addListener(function(request) {
    if (request && (request.id == 'getCacheResponse')) {
      cachedPrices = request.data[0];
      cachedChanges = request.data[1];
      console.log(cachedPrices);
      console.log(cachedChanges);
    }
  });
   */
  var homePage = document.getElementById('homePage');
  homePage.innerHTML = '';
  if (currencyArray.length > 9) {
    homePage.setAttribute('class', 'scroll')
    /*homePage.style.width = '383px';*/
    /*homePage.style.overflowY = 'overlay';*/
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
        //circleBackground.style.backgroundColor = '#76d275';
      } else if (cachedChanges[currency].replace('%','') == 0) {
       circle.style.backgroundColor = '#90a4ae';
      } else {
        circle.style.backgroundColor = '#e53935';
        //circleBackground.style.backgroundColor = '#ff6f60';
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
	      displayHome(result['currencyArray'], result['Fiat'], result['json'], result['coinList'], cachedPrices, cachedChanges);
	      displayPortfolio(result['portfolioArray'], result['Fiat'], result['json'], result['coinList'], cachedPrices, cachedChanges);
	      displayNews(result['jsonNewsArray'], result['news']);
	      displayDefaultRates(result['json'], result['fiatRates'], result['Fiat'], result['currencyArray'], cachedPrices);
	      init = true;
		}
	  }
	});
    //displayPortfolio(result['portfolioArray'], result['Fiat'], result['json'], result['coinList']);
    //displayNews(result['jsonNewsArray'], result['news']);
    //displayDefaultRates(result['json'], result['fiatRates'], result['Fiat'], result['currencyArray']);
    //createConvertSelects(result['json'], result['coinList']);
  });
}

function displayNews(jsonNewsArray, news) {
  var newsPage = document.getElementById('newsPage');
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
    newsDate.innerHTML = 'Published On: ' + date.toDateString() + ' at ' + date.getHours() + ':' + date.getMinutes();
    newsPage.style.display = 'block';
    pic.setAttribute('height', (newsDiv.offsetHeight - 14) + 'px');
    newsPage.style.display = 'none';
  }
  /*
  for (var i = 0; i < jsonNewsArray.length; i++) {
    var newsDiv = newsPage.appendChild(document.createElement('div'));
    newsDiv.setAttribute('class', 'newsDiv');
    var pic = newsDiv.appendChild(document.createElement('img'));
    if (jsonNewsArray[i][0] != null) {
      pic.setAttribute('src', jsonNewsArray[i][0]);
    } else {
      pic.setAttribute('src', 'broken-image.gif');
    }
    pic.setAttribute('class', 'newsImg');
    var newsText = newsDiv.appendChild(document.createElement('div'));
    var link = newsText.appendChild(document.createElement('a'));
    link.setAttribute('href', jsonNewsArray[i][1]);
    link.setAttribute('class', 'newsLink');
    link.innerHTML = jsonNewsArray[i][2];
    var newsAuthor = newsText.appendChild(document.createElement('div'));
    newsAuthor.innerHTML = 'Author: ' + jsonNewsArray[i][3];
    var newsPub = newsText.appendChild(document.createElement('div'));
    newsPub.innerHTML = 'Publication: ' + jsonNewsArray[i][4];
    newsText.setAttribute('class', 'newsText');
    var newsDate = newsText.appendChild(document.createElement('div'));
    var date = jsonNewsArray[i][5].split('T');
    var datef = date[0].split('-');
    var datet = date[1].split(':');
    newsDate.innerHTML = 'Published At: ' + datet[0] + ':' + datet[1] + ' ' + datef[1] + '-' + datef[2] + '-' + datef[0];
    newsPage.style.display = 'block';
    pic.setAttribute('height', (newsDiv.offsetHeight - 14) + 'px');
    newsPage.style.display = 'none';
  }
  */
}

function displayPortfolio(portfolioArray, fiat, json, coinList, cachedPrices, cachedChanges) {
  //if (portfolioArray.length < 1) {
  if (Object.keys(portfolioArray).length < 1) {
    document.getElementById('d3Container').style.display = 'none';
    document.getElementById('portfolioDetails').style.display = 'none';
    document.getElementById('emptyPortfolio').style.display = 'block';
  } else {
    var portfolioTable = document.getElementById('portfolioTable');
    if (portfolioTable.rows.length <= 2) {
      var tbody = document.createElement('tbody');
      var tableBody = portfolioTable.appendChild(tbody);
      //var price = 'price_' + fiat.toLowerCase();
      var totalValue = 0;
      //var oneHrTotal = 0;
      var tfHrTotal = 0;
      //var sevenDayTotal = 0;
      if (Object.keys(portfolioArray).length > 9) {
        document.getElementById('legend').setAttribute('class', 'scroll');
      }
      /*
      var ran = false;
      chrome.runtime.sendMessage({id: "getCache"});
      chrome.runtime.onMessage.addListener(function(request) {
        if (!ran) {
          if (request && (request.id == 'getCacheResponse')) {
            var cachedPrices = request.data[0];
            var cachedChanges = request.data[1];
            //createDataset(cachedPrices, portfolioArray, coinList);
            displayTable(portfolioArray, coinList, cachedPrices, cachedChanges);
          }
          ran = true;
        }
      });
	  */
	  displayTable(portfolioArray, coinList, cachedPrices, cachedChanges);

      function displayTable(portfolioArray, coinList, cachedPrices, cachedChanges) {
        //for (var i = 0; i < portfolioArray.length; i++) {
        for (var key in portfolioArray) {
          /*
          if (portfolioArray.length > 9) {
            document.getElementById('legend').setAttribute('class', 'scroll');
          }
          */
          //var symbol = portfolioArray[i][0];
          var symbol = key;
          //var price = cachedPrices[symbol].replace('$ ','').replace(',','');
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
        /*
        for (var j = 0; j < json.length; j++) {
          if (json[j]['id'] == portfolioArray[i][0]) {
            var value = (parseFloat(json[j][price]) * parseFloat(portfolioArray[i][1])).toFixed(2);    
            var row = tableBody.insertRow();
            row.setAttribute('class', 'portfolioTableRow');
            row.setAttribute('id', json[j]['id']);
            var currencyCell = row.insertCell(0);
            currencyCell.setAttribute('class', 'currencyCell');
            if (json[j]['name'].length < 15) {
              currencyCell.innerHTML = json[j]['name'];
            } else {
              currencyCell.innerHTML = json[j]['symbol'];
            }
            currencyCell.addEventListener('click', (e) => {
                var currencyUrl = 'https://coinmarketcap.com/currencies/' + e.target.parentElement.id;
                chrome.tabs.create({url: currencyUrl});
            })
            var amountCell = row.insertCell(1);
            amountCell.innerHTML = portfolioArray[i][1];
            var valueCell = row.insertCell(2);
            valueCell.innerHTML = parseFloat(value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            var oneHrCell = row.insertCell(3);
            oneHrPrice = (value / (1 + (json[j]['percent_change_1h'] / 100)));
            oneHrValue = (value - oneHrPrice).toFixed(2);
            oneHrCell.innerHTML = parseFloat(oneHrValue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (oneHrValue < 0) {
              oneHrCell.style.color = 'red';
            } else {
              oneHrCell.style.color = 'green';
            }
            var tfHrCell = row.insertCell(4);
            tfHrPrice = (value / (1 + (json[j]['percent_change_24h'] / 100)));
            tfHrValue = (value - tfHrPrice).toFixed(2);
            tfHrCell.innerHTML = parseFloat(tfHrValue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (tfHrValue < 0) {
              tfHrCell.style.color = 'red';
            } else {
              tfHrCell.style.color = 'green';
            }
            var sevenDayCell = row.insertCell(5);
            sevenDayPrice = (value / (1 + (json[j]['percent_change_7d'] / 100)));
            sevenDayValue = (value - sevenDayPrice).toFixed(2);
            sevenDayCell.innerHTML = parseFloat(sevenDayValue).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            if (sevenDayValue < 0) {
              sevenDayCell.style.color = 'red';
            } else {
              sevenDayCell.style.color = 'green';
            }
            
            oneHrTotal += +oneHrValue;
            tfHrTotal += +tfHrValue;
            sevenDayTotal += +sevenDayValue;
            totalValue += +value;
          }
        }
      var portfolioTableFooter = document.getElementById('portfolioTableFooter');
      var valueCellTotal = portfolioTableFooter.insertCell(2);
      valueCellTotal.innerHTML = totalValue.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      var oneHrCellTotal = portfolioTableFooter.insertCell(3);
      oneHrCellTotal.innerHTML = oneHrTotal.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      if (oneHrTotal < 0) {
        oneHrCellTotal.style.color = 'red';
      } else {
        oneHrCellTotal.style.color = 'green';
      }
      var tfHrCellTotal = portfolioTableFooter.insertCell(4);
      tfHrCellTotal.innerHTML = tfHrTotal.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      if (tfHrTotal < 0) {
        tfHrCellTotal.style.color = 'red';
      } else {
        tfHrCellTotal.style.color = 'green';
      }
      var sevenDayCellTotal = portfolioTableFooter.insertCell(5);
      sevenDayCellTotal.innerHTML = sevenDayTotal.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      if (sevenDayTotal < 0) {
        sevenDayCellTotal.style.color = 'red';
      } else {
        sevenDayCellTotal.style.color = 'green';
      }
      */
    }
  }
}

function createConvertSelects(json, coinList) {
  var coins = coinList['Data'];
  var coinArray = Object.values(coins);
  coinArray = coinArray.sort((a,b) => {
    if (a['FullName'][0] == ' ') {
      var a1 = a['FullName'].substring(1);
    } else {
      var a1 = a['FullName'];
    }
    if (b['FullName'][0] == ' ') {
      var b1 = b['FullName'].substring(1);
    } else {
      var b1 = b['FullName'];
    }
    //var a1 = a['FullName'];
    //var b1 = b['FullName'];

    return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
  });
  /*
  json = json.sort((a,b) => {
    var a1 = a.name.toLowerCase();
    var b1 = b.name.toLowerCase();

    return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
  })
  */
  var select1 = document.getElementById('select1');
  var select2 = document.getElementById('select2');
  if (select1.length < 30) {
    for (var i = 0; i < coinArray.length; i++) {
      var option1 = document.createElement('option');
      option1.text = coinArray[i]['FullName'];
      var setOption1 = select1.appendChild(option1);
      //setOption1.setAttribute('value', json[i]['id']);
      setOption1.setAttribute('id', coinArray[i]['']);
      setOption1.setAttribute('class', 'crypto');
      if (json[i]['id'] != 'bitcoin') {
        setOption1.setAttribute('selected', 'selected');
      }
      var option2 = document.createElement('option');
      option2.text = json[i]['name'] + ' (' + json[i]['symbol'] + ')';
      var setOption2 = select2.appendChild(option2);
      setOption2.setAttribute('value', json[i]['id']);
      setOption2.setAttribute('id', json[i]['symbol']);
      setOption2.setAttribute('class', 'crypto');
      if (option1.text.length > 20) {
        setOption1.style.fontSize = (20 / option1.text.length) * 100 + '%';
        setOption2.style.fontSize = (20 / option1.text.length) * 100 + '%';
      }
    }
    /*
    for (var i = 0; i < 1500; i++) {
      for (var i = 0; i < 2; i++) {
        if (i == 0) {
          var select = select1;
        } else {
          var select = select2;
        }
        var option = document.createElement('option');
        option.text = coinArray[i]['FullName'];
        var setOption = select.appendChild(option);
        setOption.setAttribute('value', coinArray[i]['symbol']);

      }
    }
    */
    /*
    for (var i = 0; i < json.length; i++) {
      var option1 = document.createElement('option');
      option1.text = json[i]['name'] + ' (' + json[i]['symbol'] + ')';
      var setOption1 = select1.appendChild(option1);
      setOption1.setAttribute('value', json[i]['id']);
      setOption1.setAttribute('id', json[i]['symbol']);
      setOption1.setAttribute('class', 'crypto');
      if (json[i]['id'] != 'bitcoin') {
        setOption1.setAttribute('selected', 'selected');
      }
      var option2 = document.createElement('option');
      option2.text = json[i]['name'] + ' (' + json[i]['symbol'] + ')';
      var setOption2 = select2.appendChild(option2);
      setOption2.setAttribute('value', json[i]['id']);
      setOption2.setAttribute('id', json[i]['symbol']);
      setOption2.setAttribute('class', 'crypto');
      if (option1.text.length > 20) {
        setOption1.style.fontSize = (20 / option1.text.length) * 100 + '%';
        setOption2.style.fontSize = (20 / option1.text.length) * 100 + '%';
      }
    }
    */
  }
  document.getElementById('BTC').selected = true;
}

function displayDefaultRates(json, fiatRates, fiat, currencyArray, cachedPrices) {
  var defaultRateDivs = document.getElementsByClassName('defaultRate');
  var defaultRateTextDivs = document.getElementsByClassName('defaultRateText');
  var defaultRateNumDivs = document.getElementsByClassName('defaultRateNum');
  /*
  var ran = false;
  chrome.runtime.sendMessage({id: "getCache"});
  chrome.runtime.onMessage.addListener(function(request) {
    if (!ran) {
      if (request && (request.id == 'getCacheResponse')) {
        var convertCachedPrices = request.data[0];
        console.log(convertCachedPrices);
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
	    }
	    */
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
            //defaultRateNumDivs[i].innerHTML = fiatSymbols[fiat] + ((cachedPrices[currency].replace('$ ','').replace(',','') * 100) * fiatRates[j][1]).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            defaultRateNumDivs[i].innerHTML = fiatSymbols[fiat] + ((cachedPrices[currency] * 100) * fiatRates[j][1]).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          } else {
            defaultRateTextDivs[i].innerHTML = fiatRates[j][0] + '/' + currency;
            defaultRateNumDivs[i].innerHTML = (fiatRates[j][1] / cachedPrices[currency]).toFixed(10);
          }
        } else {
          defaultRateDivs[i].style.display = 'none';
        }
      }
        /*
        for (var i = 0; i < defaultRateDivs.length; i++) {
          if (i % 2 != 0) {
            defaultRateTextDivs[i].innerHTML = '100 ' + json[Math.floor(i/2)]['symbol'] + '/' + fiatRates[j][0];
            defaultRateNumDivs[i].innerHTML = fiatSymbols[fiat] + ((json[Math.floor(i/2)]['price_usd'] * 100) * fiatRates[j][1]).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          } else {
            defaultRateTextDivs[i].innerHTML = fiatRates[j][0] + '/' + json[Math.floor(i/2)]['symbol'];
            defaultRateNumDivs[i].innerHTML = (fiatRates[j][1] / json[Math.floor(i/2)]['price_usd']).toFixed(10);
          }
        }
        */
    }
  }
      //}
      //ran = true;
    //}
  //});
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
  /*
  console.log(window.getComputedStyle(homeTab).getPropertyValue('width'));
  console.log(window.getComputedStyle(newsTab).getPropertyValue('width'));
  console.log(window.getComputedStyle(portfolioTab).getPropertyValue('width'));
  console.log(window.getComputedStyle(convertTab).getPropertyValue('width'));
  */
  homeTab.addEventListener('click', () => {
    homeTab.setAttribute('class', 'active');
    newsTab.setAttribute('class', 'hidden');
    portfolioTab.setAttribute('class', 'hidden');
    convertTab.setAttribute('class', 'hidden');
    //checkStorage();
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
  //News Page Event Listener
  newsPage.addEventListener('click', function(e) {
    if (e.target.className == 'newsLink') {
      chrome.tabs.create({url: e.target.href});
    }
  });
  //Portfolio Page
  /*
  var portfolioDetailsButton = document.getElementById('portfolioDetailsButton');
  var portfolioPage = document.getElementById('portfolioPage');
  portfolioDetailsButton.addEventListener('click', () => {
    var portfolioDetails = document.getElementById('portfolioDetails');
    if (portfolioDetails.style.display != 'block') {
      portfolioDetails.style.display = 'block';
      portfolioPage.style.height = 220 + portfolioTable.offsetHeight + 'px';
    } else {
      portfolioDetails.style.display = 'none';
      portfolioPage.style.height = 220 + 'px';
    }
  })
  */
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
        /*
        var remove = true;
        for (var i = 0; i < currencyArray.length; i++) {
          if (currencyArray[i] == select1Option) {
            remove = false;
            break;
          }
        }
        if (remove) {
          chrome.runtime.sendMessage({id: "removeSub", symbol: select1Option });
        }
        */
        select1Option = select1.options[select1.selectedIndex].id;
      } else if (select1.options[select1.selectedIndex].className == 'fiat') {
        convertInputs[0].setAttribute('placeholder', select1.options[select1.selectedIndex].id);
        convertInputs[0].setAttribute('id', select1.options[select1.selectedIndex].id);
        chrome.runtime.sendMessage({id: "removeSub", symbol: select1Option });
        /*
        var remove = true;
        for (var i = 0; i < currencyArray.length; i++) {
          if (currencyArray[i] == select1Option) {
            remove = false;
            break;
          }
        }
        if (remove) {
          chrome.runtime.sendMessage({id: "removeSub", symbol: select1Option });
        }
        */
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
        /*
        var remove = true;
        for (var i = 0; i < currencyArray.length; i++) {
          if (currencyArray[i] == select2Option) {
            remove = false;
            break;
          }
        }
        if (remove) {
          chrome.runtime.sendMessage({id: "removeSub", symbol: select2Option });
        }
        */
        select2Option = select2.options[select2.selectedIndex].id;
      } else if (select2.options[select2.selectedIndex].className == 'fiat') {
        convertInputs[1].setAttribute('placeholder', select2.options[select2.selectedIndex].id);
        convertInputs[1].setAttribute('id', select2.options[select2.selectedIndex].id);
        chrome.runtime.sendMessage({id: "removeSub", symbol: select2Option });
        /*
        var remove = true;
        for (var i = 0; i < currencyArray.length; i++) {
          if (currencyArray[i] == select1Option) {
            remove = false;
            break;
          }
        }
        if (remove) {
          chrome.runtime.sendMessage({id: "removeSub", symbol: select1Option });
        }
        */
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
              //var cachedChanges = request.data[1];
              //createDataset(cachedPrices, portfolioArray, coinList);
              //displayTable(portfolioArray, coinList, cachedPrices, cachedChanges);
            
              //json = result['json'];
              //fiat = result['fiatRates'];
              if (select1.options[select1.selectedIndex].className == 'crypto') {
                var bitcoinPrice1 = 0;
                if (select2.options[select2.selectedIndex].className == 'crypto') {
                  var bitcoinPrice2 = 0;
                  bitcoinPrice1 = convertCachedPrices[convertInputs[0].id];
                  bitcoinPrice2 = convertCachedPrices[convertInputs[1].id];
                  /*
                  for (var i = 0; i < json.length; i++) {
                    if (json[i]['id'] == convertInputs[0].id) {
                      bitcoinPrice1 = json[i]['price_btc'];
                    } else if (json[i]['id'] == convertInputs[1].id) {
                      bitcoinPrice2 = json[i]['price_btc'];
                    }
                  }
                  */
                  convertInputs[1].value = convertInputs[0].value * (bitcoinPrice1 / bitcoinPrice2);
                }
                else if (select2.options[select2.selectedIndex].className == 'fiat') {
                  var fiatRate2 = 0;
                  bitcoinPrice1 = convertCachedPrices[convertInputs[0].id];
                  /*
                  for (var i = 0; i < json.length; i++) {
                    if (json[i]['id'] == convertInputs[0].id) {
                      bitcoinPrice1 = json[i]['price_usd'];
                      break;
                    }
                  }
                  */
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
                  /*
                  for (var i = 0; i < json.length; i++) {
                    if (json[i]['id'] == convertInputs[1].id) {
                      bitcoinPrice2 = json[i]['price_usd'];
                      break;
                    }
                  }
                  */
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
              //var cachedChanges = request.data[1];
              //createDataset(cachedPrices, portfolioArray, coinList);
              //displayTable(portfolioArray, coinList, cachedPrices, cachedChanges);
            
              //json = result['json'];
              //fiat = result['fiatRates'];
              if (select2.options[select2.selectedIndex].className == 'crypto') {
                var bitcoinPrice2 = 0;
                if (select1.options[select1.selectedIndex].className == 'crypto') {
                  var bitcoinPrice1 = 0;
                  bitcoinPrice2 = convertCachedPrices[convertInputs[1].id];
                  bitcoinPrice1 = convertCachedPrices[convertInputs[0].id];
                  /*
                  for (var i = 0; i < json.length; i++) {
                    if (json[i]['id'] == convertInputs[0].id) {
                      bitcoinPrice1 = json[i]['price_btc'];
                    } else if (json[i]['id'] == convertInputs[1].id) {
                      bitcoinPrice2 = json[i]['price_btc'];
                    }
                  }
                  */
                  convertInputs[0].value = convertInputs[1].value * (bitcoinPrice2 / bitcoinPrice1);
                }
                else if (select1.options[select1.selectedIndex].className == 'fiat') {
                  var fiatRate1 = 0;
                  bitcoinPrice2 = convertCachedPrices[convertInputs[1].id];
                  /*
                  for (var i = 0; i < json.length; i++) {
                    if (json[i]['id'] == convertInputs[0].id) {
                      bitcoinPrice1 = json[i]['price_usd'];
                      break;
                    }
                  }
                  */
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
                  /*
                  for (var i = 0; i < json.length; i++) {
                    if (json[i]['id'] == convertInputs[1].id) {
                      bitcoinPrice2 = json[i]['price_usd'];
                      break;
                    }
                  }
                  */
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
      /*
      if (convertInputs[1].value.length == 0) {
        convertInputs[0].value = '';
      } else {
        json = result['json'];
        fiat = result['fiatRates'];
        if (select2.options[select2.selectedIndex].className == 'crypto') {
          var bitcoinPrice2 = 0;
          if (select1.options[select1.selectedIndex].className == 'crypto') {
            var bitcoinPrice1 = 0;
            for (var i = 0; i < json.length; i++) {
              if (json[i]['id'] == convertInputs[1].id) {
                bitcoinPrice2 = json[i]['price_btc'];
              } else if (json[i]['id'] == convertInputs[0].id) {
                bitcoinPrice1 = json[i]['price_btc'];
              }
            }
            convertInputs[0].value = convertInputs[1].value * (bitcoinPrice2 / bitcoinPrice1);
          }
          else if (select1.options[select1.selectedIndex].className == 'fiat') {
            var fiatRate1 = 0;
            for (var i = 0; i < json.length; i++) {
              if (json[i]['id'] == convertInputs[1].id) {
                bitcoinPrice2 = json[i]['price_usd'];
                break;
              }
            }
            for (var i = 0; i < fiat.length; i++) {
              if (fiat[i][0] == convertInputs[0].id) {
                fiatRate1 = fiat[i][1];
                break;
              }
            }
            console.log(fiatRate1, bitcoinPrice2);
            convertInputs[0].value = (convertInputs[1].value * (fiatRate1 * bitcoinPrice2)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          }
        } else if (select2.options[select2.selectedIndex].className == 'fiat') {
          var fiatRate2 = 0;
          if (select1.options[select1.selectedIndex].className == 'crypto') {
            var bitcoinPrice1 = 0;
            for (var i = 0; i < fiat.length; i++) {
              if (fiat[i][0] == convertInputs[1].id) {
                fiatRate2 = fiat[i][1];
                break;
              }
            }
            for (var i = 0; i < json.length; i++) {
              if (json[i]['id'] == convertInputs[0].id) {
                bitcoinPrice1 = json[i]['price_usd'];
                break;
              }
            }
            convertInputs[0].value = convertInputs[1].value * (fiatRate2 / bitcoinPrice1);
          } else if (select1.options[select1.selectedIndex].className == 'fiat') {
            var fiatRate2 = 0;
            for (var i = 0; i < fiat.length; i++) {
              if (fiat[i][0] == convertInputs[1].id) {
                fiatRate2 = fiat[i][1];
              } else if (fiat[i][0] == convertInputs[0].id) {
                fiatRate1 = fiat[i][1];
              }
            }
            convertInputs[0].value = (convertInputs[1].value * (fiatRate1 / fiatRate2)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          }
        }
      }
      */
    })
  });
});