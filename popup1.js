function displayHome(currencyArray, fiat, json) {
  console.log(json);
  var homePage = document.getElementById('homePage');
  homePage.innerHTML = '';
  if (currencyArray.length > 9) {
    homePage.setAttribute('class', 'scroll')
    /*homePage.style.width = '383px';*/
    /*homePage.style.overflowY = 'overlay';*/
  }
  for (var i = 0; i < currencyArray.length; i++) {
    var currency = currencyArray[i];
    var circleBackground = homePage.appendChild(document.createElement('div'));
    circleBackground.setAttribute('class', 'circleBackground');
    var circle = circleBackground.appendChild(document.createElement('div'));
    circle.setAttribute('class', 'circle');
    var frontCircle = circle.appendChild(document.createElement('div'));
    frontCircle.setAttribute('class', 'frontCircle');
    var circleText = frontCircle.appendChild(document.createElement('div'));
    circleText.setAttribute('class', 'circleText');
    var circleName = circleText.appendChild(document.createElement('div'));
    circleName.setAttribute('class', 'circleName');
    var circleNums = circleText.appendChild(document.createElement('div'));
    var circlePrice = circleNums.appendChild(document.createElement('div'));
    var circleChange = circleNums.appendChild(document.createElement('div'));
    for (var j = 0; j < json.length; j++) {
      if (json[j]['id'] == currency) {
        circleText.setAttribute('id', 'circleText' + json[j]['symbol']);
        circleName.setAttribute('id', 'circleName' + json[j]['symbol']);
        circlePrice.setAttribute('id', 'circlePrice' + json[j]['symbol']);
        circleChange.setAttribute('id', 'circleChange' + json[j]['symbol']);
        var currencyName = json[j]['name'];
        var symbol = '(' + json[j]['symbol'] + ')';
        var jsonPrice = 'price_' + fiat.toLowerCase();
        var price = fiatSymbols[fiat] + parseFloat(json[j][jsonPrice]).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        var twentyFourHrDelta = json[j]['percent_change_24h'];
        if (currencyName.length < 15) {
          circleName.innerHTML = currencyName + '<br>' + symbol;
        } else {
          circleName.innerHTML = json[j]['symbol'];
        }
        //circleNums.innerHTML = price + '<br>' + twentyFourHrDelta + '%';
        circlePrice.innerHTML = price;
        circleChange.innerHTML = twentyFourHrDelta + '%';
        if (twentyFourHrDelta > 0) {
          circle.style.backgroundColor = '#43a047';
          //circleBackground.style.backgroundColor = '#76d275';
        } else {
          circle.style.backgroundColor = '#e53935';
          //circleBackground.style.backgroundColor = '#ff6f60';
        }
        circleName.setAttribute('id', 'circle' + json[j]['id']);
        circleName.addEventListener('click', (e) => {
          var currencyUrl = 'https://coinmarketcap.com/currencies/' + e.target.id.replace('circle', '');
          chrome.tabs.create({url: currencyUrl});
        })
        break;
      }
    }
  }
};

function clearInput() {
  checkedList = {};
  chrome.storage.local.clear();
  return checkedList;
};

function checkStorage() {
  var currencyArray = [];
  chrome.storage.local.get(null, (result) => {
    console.log(result);
    displayHome(result['currencyArray'], result['Fiat'], result['json']);
    displayPortfolio(result['portfolioArray'], result['Fiat'], result['json']);
    displayNews(result['jsonNewsArray']);
    displayDefaultRates(result['json'], result['fiatRates'], result['Fiat'], result['currencyArray']);
    createConvertSelects(result['json']);
  });
}

function displayNews(jsonNewsArray) {
  var newsPage = document.getElementById('newsPage');
  var pageHeight = 0;
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
}

function displayPortfolio(portfolioArray, fiat, json) {
  if (portfolioArray.length < 1) {
    document.getElementById('d3Container').style.display = 'none';
    document.getElementById('portfolioDetails').style.display = 'none';
    document.getElementById('emptyPortfolio').style.display = 'block';
  } else {
    var portfolioTable = document.getElementById('portfolioTable');
    if (portfolioTable.rows.length <= 2) {
      var tbody = document.createElement('tbody');
      var tableBody = portfolioTable.appendChild(tbody);
      var price = 'price_' + fiat.toLowerCase();
      var totalValue = 0;
      var oneHrTotal = 0;
      var tfHrTotal = 0;
      var sevenDayTotal = 0;
      for (var i = 0; i < portfolioArray.length; i++) {
        if (portfolioArray.length > 9) {
          document.getElementById('legend').setAttribute('class', 'scroll');
        }
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
    }
  }
}

function createConvertSelects(json) {
  json = json.sort((a,b) => {
    var a1 = a.name.toLowerCase();
    var b1 = b.name.toLowerCase();

    return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
  })

  var select1 = document.getElementById('select1');
  var select2 = document.getElementById('select2');
  if (select1.length < 30) {
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
  }
  document.getElementById('BTC').selected = true;
}

function displayDefaultRates(json, fiatRates, fiat, currencyArray) {
  var defaultRateDivs = document.getElementsByClassName('defaultRate');
  var defaultRateTextDivs = document.getElementsByClassName('defaultRateText');
  var defaultRateNumDivs = document.getElementsByClassName('defaultRateNum');
  for (var j = 0; j < fiatRates.length; j++) {
    if (fiatRates[j][0] == fiat) {
      for (var i = 0; i < defaultRateDivs.length; i++) {
        if (i % 2 != 0) {
          defaultRateTextDivs[i].innerHTML = '100 ' + json[Math.floor(i/2)]['symbol'] + '/' + fiatRates[j][0];
          defaultRateNumDivs[i].innerHTML = fiatSymbols[fiat] + ((json[Math.floor(i/2)]['price_usd'] * 100) * fiatRates[j][1]).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
          defaultRateTextDivs[i].innerHTML = fiatRates[j][0] + '/' + json[Math.floor(i/2)]['symbol'];
          defaultRateNumDivs[i].innerHTML = (fiatRates[j][1] / json[Math.floor(i/2)]['price_usd']).toFixed(10);
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
                  TWD: '$', ZAR: '&#x52;'};

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
  var select1 = document.getElementById('select1');
  select1.addEventListener('change', () => {
    if (select1.options[select1.selectedIndex].className == 'crypto') {
      convertInputs[0].setAttribute('placeholder', select1.options[select1.selectedIndex].id);
      convertInputs[0].setAttribute('id', select1.options[select1.selectedIndex].value);
    } else if (select1.options[select1.selectedIndex].className == 'fiat') {
      convertInputs[0].setAttribute('placeholder', select1.options[select1.selectedIndex].id);
      convertInputs[0].setAttribute('id', select1.options[select1.selectedIndex].id);
    }
    convertInputs[0].value = '';
    convertInputs[1].value = '';
  })
  var select2 = document.getElementById('select2');
  select2.addEventListener('change', () => {
    if (select2.options[select2.selectedIndex].className == 'crypto') {
      convertInputs[1].setAttribute('placeholder', select2.options[select2.selectedIndex].id);
      convertInputs[1].setAttribute('id', select2.options[select2.selectedIndex].value);
    } else if (select2.options[select2.selectedIndex].className == 'fiat') {
      convertInputs[1].setAttribute('placeholder', select2.options[select2.selectedIndex].id);
      convertInputs[1].setAttribute('id', select2.options[select2.selectedIndex].id);
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
      chrome.storage.local.get(null, (result) => {
        json = result['json'];
        fiat = result['fiatRates'];
        if (select1.options[select1.selectedIndex].className == 'crypto') {
          var bitcoinPrice1 = 0;
          if (select2.options[select2.selectedIndex].className == 'crypto') {
            var bitcoinPrice2 = 0;
            for (var i = 0; i < json.length; i++) {
              if (json[i]['id'] == convertInputs[0].id) {
                bitcoinPrice1 = json[i]['price_btc'];
              } else if (json[i]['id'] == convertInputs[1].id) {
                bitcoinPrice2 = json[i]['price_btc'];
              }
            }
            convertInputs[1].value = convertInputs[0].value * (bitcoinPrice1 / bitcoinPrice2);
          }
          else if (select2.options[select2.selectedIndex].className == 'fiat') {
            var fiatRate2 = 0;
            for (var i = 0; i < json.length; i++) {
              if (json[i]['id'] == convertInputs[0].id) {
                bitcoinPrice1 = json[i]['price_usd'];
                break;
              }
            }
            for (var i = 0; i < fiat.length; i++) {
              if (fiat[i][0] == convertInputs[1].id) {
                fiatRate2 = fiat[i][1];
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
            for (var i = 0; i < fiat.length; i++) {
              if (fiat[i][0] == convertInputs[0].id) {
                fiatRate1 = fiat[i][1];
                break;
              }
            }
            for (var i = 0; i < json.length; i++) {
              if (json[i]['id'] == convertInputs[1].id) {
                bitcoinPrice2 = json[i]['price_usd'];
                break;
              }
            }
            convertInputs[1].value = convertInputs[0].value * (fiatRate1 / bitcoinPrice2);
          } else if (select2.options[select2.selectedIndex].className == 'fiat') {
            var fiatRate2 = 0;
            for (var i = 0; i < fiat.length; i++) {
              if (fiat[i][0] == convertInputs[0].id) {
                fiatRate1 = fiat[i][1];
              } else if (fiat[i][0] == convertInputs[1].id) {
                fiatRate2 = fiat[i][1];
              }
            }
            var val = convertInputs[0].value * (fiatRate2 / fiatRate1)
            convertInputs[1].value = val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          }
        }
      })
    }
  })
  convertInputs[1].addEventListener('input', () => {
    if (convertInputs[1].value.length == 0) {
      convertInputs[0].value = '';
    } else {
      chrome.storage.local.get(null, (result) => {
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
      })
    }
  })
});