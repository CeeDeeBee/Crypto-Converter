function httpGetAsync(theUrl, callback, fiat) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText), fiat);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
};

function checkStorage() {
    chrome.storage.local.get(null, (result) => {
        createTable(result['json']);
        setHomeCell(result['currencyArray']);
        setAlertCell(result['alertArray']);
        setPortfolioCell(result['portfolioArray']);
        displayAlertTimer(result['alertTimer']);
        setFiatColor(result['Fiat']);
    });
}

function setFiatColor(fiat) {
    var fiatButtons = document.getElementsByClassName('fiatButton');
    for (var i = 0; i < fiatButtons.length; i++) {
        if (fiatButtons[i].id != fiat) {
            fiatButtons[i].style.backgroundColor = 'white';
        } else {
            fiatButtons[i].style.backgroundColor = '#4CAF50';
        }
    }
}

function clearInput() {
    checkedList = {};
    chrome.storage.local.clear();
    return checkedList;
}

function setHomeCell(currencyArray) {
    for (var i = 0; i < currencyArray.length; i++) {
        var homeCell = document.getElementById(currencyArray[i] + 'HomeCell');
        homeCell.innerHTML = 'Remove';
    }
}

function setAlertCell(alertArray) {
    for (var i = 0; i < alertArray.length; i++) {
        var alertCell = document.getElementById(alertArray[i][0] + 'AlertCell');
        alertCell.innerHTML = 'Edit';
    }
}

function setPortfolioCell(portfolioArray) {
    for (var i = 0; i < portfolioArray.length; i++) {
        var portfolioCell = document.getElementById(portfolioArray[i][0] + 'PortfolioCell');
        portfolioCell.innerHTML = 'Edit';
    }
}

function remove(array, element) {
    const index = array.indexOf(element);

    if (index !== -1) {
        array.splice(index, 1);
    }

    return array;
}

function storeHome(action, currency) {
    chrome.storage.local.get(null, (result) => {
        var currencyArray = result['currencyArray'];
        var homeCell = document.getElementById(currency + 'HomeCell');
        if (currencyArray == undefined) {
            currencyArray = [];
        }
        if (action == 'Add') {
            currencyArray.push(currency);
            result['currencyArray'] = currencyArray;
            chrome.storage.local.set(result);
            homeCell.innerHTML = 'Remove';
        } else if (action == 'Remove') {
            currencyArray = remove(currencyArray, currency);
            result['currencyArray'] = currencyArray;
            chrome.storage.local.set(result);
            homeCell.innerHTML = 'Add';
        }
    })
}

function getPrice(currency, div) {
    //div.innerHTML = 'Current Price: ' + '<img id="alertsPopupLoadingImg" src="loading-icon.gif">';
    chrome.storage.local.get(null, (result) => {
        var fiat = result['Fiat'];
        console.log(fiat);
        var json = result['json'];
        var price = 'price_' + fiat.toLowerCase();
        for (var i = 0; i < json.length; i++) {
            if (json[i]['id'] == currency) {
                div.innerHTML = 'Current Price: ' + fiatSymbols[fiat] + parseFloat(json[i][price]).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
        }
    })
}

function storeAlerts(currency, above, below) {
    chrome.storage.local.get(null, (result) => {
        var alertArray = result['alertArray'];
        if (alertArray == undefined) {
            alertArray = [];
        }
        var alert = [];
        alert[0] = currency;
        alert[1] = above;
        alert[2] = below;
        alertArray.push(alert);
        result['alertArray'] = alertArray;
        console.log(result);
        chrome.storage.local.set(result);
        displayAlertsPopup(currency, 'Edit');
    })
}

function displayAlertsPopup(currency, action) {
    var alertsPopup = document.getElementById('alertsPopup');
    var alertForm = document.getElementById('alertForm');
    var savedAlerts = document.getElementById('savedAlerts');
    var alertsPopupSubmit = document.getElementById('alertsPopupSubmit');
    var addNewAlert = document.getElementById('addNewAlert');
    addNewAlert.addEventListener('click', () => {
        addNewAlert.style.display = 'none';
        alertForm.style.display = 'block';
        alertsPopupSubmit.style.display = 'block';
    })
    savedAlerts.innerHTML = '';
    if (action == 'Add') {
        addNewAlert.style.display = 'none';
        savedAlerts.style.display = 'none';
        alertForm.style.display = 'block';
        alertsPopupSubmit.style.display = 'block';
    }
    else if (action == 'Edit') {
        var alertNum = 1;
        savedAlerts.style.display = 'block';
        addNewAlert.style.display = 'block';
        alertForm.style.display = 'none';
        alertsPopupSubmit.style.display = 'none';
        chrome.storage.local.get(null, (result) => {
            var alertArray = result['alertArray'];
            for (var i = 0; i < alertArray.length; i++) {
                if (alertArray[i][0] == currency) {
                    var div = document.createElement('div');
                    var div1 = document.createElement('div');
                    var div2 = document.createElement('div');
                    var div3 = document.createElement('div');
                    var div4 = document.createElement('div');
                    var savedAlertDiv = savedAlerts.appendChild(div);
                    savedAlertDiv.setAttribute('class', 'savedAlertDiv');
                    savedAlertDiv.setAttribute('id', 'div' + alertNum);
                    var alertNumDiv = savedAlertDiv.appendChild(div1);
                    alertNumDiv.innerHTML = 'Alert ' + alertNum;
                    var savedAlertAbove = savedAlertDiv.appendChild(div2);
                    savedAlertAbove.innerHTML = 'Above: ' + fiatSymbols[result['Fiat']] + alertArray[i][1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    var savedAlertBelow = savedAlertDiv.appendChild(div3);
                    savedAlertBelow.innerHTML = 'Below: ' + fiatSymbols[result['Fiat']] + alertArray[i][2].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    var savedAlertDelete = savedAlertDiv.appendChild(div4);
                    savedAlertDelete.setAttribute('class', 'savedAlertDelete');
                    savedAlertDelete.setAttribute('id', 'delete' + alertNum);
                    savedAlertDelete.innerHTML = 'x';
                    alertNum += 1;
                    savedAlertDelete.addEventListener('click', (e) => {
                        var siblings = e.target.parentElement.childNodes;
                        var above = siblings[1].innerHTML.replace('Above: ' + fiatSymbols[result['Fiat']], '');
                        //var above = above.replace(fiatSymbols[result['Fiat']], '');
                        var below = siblings[2].innerHTML.replace('Below: ' + fiatSymbols[result['Fiat']], '');
                        //var below = below.replace(fiatSymbols[result['Fiat']], '');
                        var id = e.target.id.replace('delete', 'div');
                        savedAlerts.removeChild(document.getElementById(id));
                        for (var j = 0; j < alertArray.length; j++) {
                            console.log(above);
                            console.log(below);
                            console.log(alertArray[j]);
                            if (alertArray[j][0] == currency) {
                                if (alertArray[j][1] == above || above.length > 1) {
                                    if (alertArray[j][2] == below || below.length > 1) {
                                        alertArray = remove(alertArray, alertArray[j]);
                                        result['alertArray'] = alertArray;
                                        chrome.storage.local.set(result);
                                    }
                                }
                            }
                        }
                        var savedAlertDivs = document.getElementsByClassName('savedAlertDiv');
                        if (savedAlertDivs.length == 0) {
                            addNewAlert.style.display = 'none';
                            savedAlerts.style.display = 'none';
                            alertForm.style.display = 'block';
                            alertsPopupSubmit.style.display = 'block';
                            var alertCell = document.getElementById(currency + 'AlertCell');
                            alertCell.innerHTML = 'Add';
                        }
                    })
                }
            }
        })
    }
}

function displayAlertTimer(alertTimer) {
    var num = alertTimer[0];
    var hrmn = alertTimer[1];
    var currentAlertTimer = document.getElementById('currentAlertTimer');
    currentAlertTimer.innerHTML = 'Currently: ' + num + ' ' + hrmn.replace('s', '(s)');
}

function storeFiat(json, fiat) {
    chrome.storage.local.get(null, (result) => {
        result['Fiat'] = fiat;
        result['json'] = json;
        chrome.storage.local.set(result);
        console.log(result);
        alert('Fiat Currency has been changed to ' + fiat);
    })
}

function displayPortfolioPopup(currency, action) {
    var portfolioPopupSubmit = document.getElementById('portfolioPopupSubmit');
    var portfolioPopupSubmitDiv = document.getElementById('portfolioPopupSubmitDiv');
    var portfolioPopupAmount = document.getElementById('portfolioPopupAmount');
    var portfolioPopupRemove = document.getElementById('portfolioPopupRemove');
    chrome.storage.local.get(null, (result) => {
        var portfolioArray = result['portfolioArray'];
        if (action == 'Add') {
            portfolioPopupSubmit.setAttribute('class', 'add');
            portfolioPopupSubmitDiv.setAttribute('class', 'add');
            portfolioPopupAmount.value = '';
            portfolioPopupRemove.style.display = 'none';
        } else if (action == 'Edit') {
            portfolioPopupSubmit.setAttribute('class', 'edit');
            portfolioPopupSubmitDiv.setAttribute('class', 'edit');
            portfolioPopupRemove.style.display = 'block';
            for (var i = 0; i < portfolioArray.length; i++) {
                if (portfolioArray[i][0] == currency) {
                    portfolioPopupAmount.value = portfolioArray[i][1];
                }
            }
        }
    })
}

function storePortfolio(currency, amount) {
    chrome.storage.local.get(null, (result) => {
        var portfolioArray = result['portfolioArray'];
        if (portfolioArray == undefined || portfolioArray.length == 0) {
            portfolioArray = [];
            var array = [];
            array[0] = currency;
            array[1] = amount;
            portfolioArray.push(array);
            result['portfolioArray'] = portfolioArray;
            chrome.storage.local.set(result);
            console.log(result);
        }
        for (var i = 0; i < portfolioArray.length; i++) {
            if (portfolioArray[i][0] == currency) {
                if (amount != 0) {
                    portfolioArray[i][1] = amount;
                    result['portfolioArray'] = portfolioArray;
                    chrome.storage.local.set(result);
                    console.log(result);
                    break;
                } else {
                    portfolioArray.splice(i, 1);
                    result['portfolioArray'] = portfolioArray;
                    chrome.storage.local.set(result);
                    console.log(portfolioArray);
                }
            } else if ((i + 1) == portfolioArray.length) {
                if (amount != 0) {
                    var array = [];
                    array[0] = currency;
                    array[1] = amount;
                    portfolioArray.push(array);
                    result['portfolioArray'] = portfolioArray;
                    chrome.storage.local.set(result);
                    console.log(result);
                }
            }
        }
    })
}

function createTable(json) {
    //Create Table
    var tableBody = document.getElementById('tableBody');
    var overlay = document.getElementsByClassName('overlay')[0];
    var alertsPopup = document.getElementById('alertsPopup');
    var alertsPopupCurrency =  document.getElementById('alertsPopupCurrency');
    var portfolioPopup = document.getElementById('portfolioPopup');
    var portfolioPopupCurrency = document.getElementById('portfolioPopupCurrency');
    for (var i = 0; i < json.length; i++) {
        var row = tableBody.insertRow();
        row.setAttribute('class', 'tableRow');
        row.setAttribute('align', 'center');
        row.setAttribute('id', json[i]['id']);
        if (i >= 100) {
            row.style.visibility = 'collapse';
        }
        var currencyCell = row.insertCell(0);
        currencyCell.setAttribute('id', json[i]['id'] + 'CurrencyCell');
        currencyCell.innerHTML = json[i]['name'] + ' (' + json[i]['symbol'] + ')';
        currencyCell.setAttribute('class', 'currencyCell');
        currencyCell.addEventListener('click', (e) => {
            var currencyUrl = 'https://coinmarketcap.com/currencies/' + e.target.parentElement.id;
            chrome.tabs.create({url: currencyUrl});
        })
        var homeCell = row.insertCell(1);
        homeCell.setAttribute('id', json[i]['id'] + 'HomeCell');
        homeCell.innerHTML = 'Add';
        homeCell.addEventListener('click', (e) => {
            var action = e.target.innerHTML;
            var currency = e.target.parentElement.id;
            storeHome(action, currency);
        })
        var alertCell = row.insertCell(2);
        alertCell.setAttribute('id', json[i]['id'] + 'AlertCell');
        alertCell.innerHTML = 'Add';
        alertCell.addEventListener('click', (e) => {
            overlay.style.zIndex = '1';
            overlay.style.display = 'block';
            alertsPopup.style.display = 'block';
            var currency = e.target.parentElement.id;
            alertsPopupCurrency.innerHTML = document.getElementById(e.target.parentElement.id + 'CurrencyCell').innerHTML;
            alertsPopupCurrency.setAttribute('id', e.target.parentElement.id);
            var alertsPopupPrice = document.getElementById('alertsPopupPrice');
            getPrice(e.target.parentElement.id, alertsPopupPrice);
            var action = e.target.innerHTML;
            displayAlertsPopup(currency, action);

        })
        var portfolioCell = row.insertCell(3);
        portfolioCell.setAttribute('id', json[i]['id'] + 'PortfolioCell');
        portfolioCell.innerHTML = 'Add';
        portfolioCell.addEventListener('click', (e) => {
            overlay.style.zIndex = '1';
            overlay.style.display = 'block';
            portfolioPopup.style.display = 'block';
            var currency = e.target.parentElement.id;
            portfolioPopupCurrency.innerHTML = document.getElementById(e.target.parentElement.id + 'CurrencyCell').innerHTML;
            portfolioPopupCurrency.setAttribute('id', currency);
            displayPortfolioPopup(currency, e.target.innerHTML);
        })
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
    var overlay = document.getElementsByClassName('overlay')[0];
    //Alerts popup event listeners
    var alertsPopup = document.getElementById('alertsPopup');
    var alertsPopupClose = document.getElementById('alertsPopupClose');
    alertsPopupClose.addEventListener('click', () => {
        overlay.style.zIndex = '-1';
        overlay.style.display = 'none';
        alertsPopup.style.display = 'none';
    })
    var alertForm = document.getElementById('alertForm');
    var alertsPopupSubmit = document.getElementById('alertsPopupSubmit');
    var alertsPopupCurrency =  document.getElementById('alertsPopupCurrency');
    alertForm.addEventListener('submit', () => {
        var currency = alertsPopupCurrency.id;
        var above = document.getElementById('alertsPopupAbove');
        var below = document.getElementById('alertsPopupBelow');
        storeAlerts(currency, above.value, below.value);
        var alertCell = document.getElementById(currency + 'AlertCell');
        alertCell.innerHTML = 'Edit';
        above.value = '';
        below.value = '';
        event.preventDefault();
    })
    var portfolioPopup = document.getElementById('portfolioPopup');
    var portfolioPopupClose = document.getElementById('portfolioPopupClose');
    portfolioPopupClose.addEventListener('click', () => {
        overlay.style.zIndex = '-1';
        overlay.style.display = 'none';
        portfolioPopup.style.display = 'none';
    })
    var portfolioPopupForm = document.getElementById('portfolioPopupForm');
    var portfolioPopupSubmit = document.getElementById('portfolioPopupSubmit');
    var portfolioPopupCurrency = document.getElementById('portfolioPopupCurrency');
    portfolioPopupForm.addEventListener('submit', () => {
        var currency = portfolioPopupCurrency.id;
        var portfolioPopupAmount = document.getElementById('portfolioPopupAmount');
        storePortfolio(currency, portfolioPopupAmount.value);
        var portfolioCell = document.getElementById(currency + 'PortfolioCell');
        if (portfolioPopupAmount.value != 0) {
            portfolioCell.innerHTML = 'Edit';
            overlay.style.zIndex = '-1';
            overlay.style.display = 'none';
            portfolioPopup.style.display = 'none';
            alert(portfolioPopupCurrency.innerHTML + ' has been added to your portfolio.');
        } else {
            portfolioCell.innerHTML = 'Add';
            portfolioPopupAmount.value = '';
        }
        event.preventDefault();
    })
    var portfolioPopupRemove = document.getElementById('portfolioPopupRemove');
    portfolioPopupRemove.addEventListener('click', () => {
        var currency = portfolioPopupCurrency.id;
        var amount = 0;
        storePortfolio(currency, amount);
        var portfolioCell = document.getElementById(currency + 'PortfolioCell');
        portfolioCell.innerHTML = 'Add';
        portfolioPopupAmount.value = '';
        overlay.style.zIndex = '-1';
        overlay.style.display = 'none';
        portfolioPopup.style.display = 'none';
        alert(portfolioPopupCurrency.innerHTML + ' has been removed from your portfolio.');
    })
    /*
    var alertTimerPopup = document.getElementById('alertTimerPopup');
    var setAlertFrequencyDiv = document.getElementById('setAlertFrequencyDiv');
    setAlertFrequencyDiv.addEventListener('click', () => {
        overlay.style.zIndex = '1';
        alertTimerPopup.style.display = 'block';
    })
    var alertTimerClose = document.getElementById('alertTimerClose');
    alertTimerClose.addEventListener('click', () => {
        overlay.style.zIndex = '-1';
        alertTimerPopup.style.display = 'none';
    })
    */
    var alertTimerForm = document.getElementById('alertTimerForm');
    alertTimerForm.addEventListener('submit', () => {
        var currentAlertTimer = document.getElementById('currentAlertTimer');
        var alertTimerInput = document.getElementById('alertTimerInput');
        var alertTimerSelect = document.getElementById('alertTimerSelect');
        currentAlertTimer.innerHTML = 'Currently: ' + alertTimerInput.value +  ' ' + alertTimerSelect.options[alertTimerSelect.selectedIndex].value.replace('s', '(s)');
        chrome.storage.local.get(null, (result) => {
            var alertTimer = [];
            alertTimer[0] = alertTimerInput.value;
            alertTimer[1] = alertTimerSelect.options[alertTimerSelect.selectedIndex].value;
            result['alertTimer'] = alertTimer;
            chrome.storage.local.set(result);
            console.log(result);
            alertTimerInput.value = '';
            alertTimerSelect.value = 'minutes';
        })
        event.preventDefault();
    })
    /*
    var alertTimerSubmit = document.getElementById('alertTimerSubmit');
    alertTimerSubmit.addEventListener('click', () => {
        var currentAlertTimer = document.getElementById('currentAlertTimer');
        var alertTimerInput = document.getElementById('alertTimerInput');
        var alertTimerSelect = document.getElementById('alertTimerSelect');
        currentAlertTimer.innerHTML = 'Currently: ' + alertTimerInput.value +  ' ' + alertTimerSelect.options[alertTimerSelect.selectedIndex].value;
        chrome.storage.local.get(null, (result) => {
            var alertTimer = [];
            alertTimer[0] = alertTimerInput.value;
            alertTimer[1] = alertTimerSelect.options[alertTimerSelect.selectedIndex].value;
            result['alertTimer'] = alertTimer;
            chrome.storage.local.set(result);
            console.log(result);
            alertTimerInput.value = '';
            alertTimerSelect.value = 'minutes';
        })
    })
    */
    //Searchbox Stuff
    var currencyCells = document.getElementsByClassName('currencyCell');
    var searchbox = document.getElementById('searchbox');
    searchbox.addEventListener('input', () => {
        for (var i = 0; i < currencyCells.length; i++) {
            if (currencyCells[i].innerHTML.toLowerCase().includes(searchbox.value.toLowerCase()) != true) {
                currencyCells[i].parentElement.style.visibility = 'collapse';
            } else {
                currencyCells[i].parentElement.style.visibility = 'visible';
            }
        }
    });
    var searchboxForm = document.getElementById('searchboxForm');
    searchboxForm.addEventListener('submit', () => {
        event.preventDefault();
    })
    var setFiatCurrencyDiv = document.getElementById('setFiatCurrencyDiv');
    var fiatCurrencyPopup = document.getElementById('fiatCurrencyPopup');
    setFiatCurrencyDiv.addEventListener('click', () => {
        overlay.style.zIndex = '1';
        overlay.style.display = 'block';
        fiatCurrencyPopup.style.display = 'block';
    });
    var searchboxX = document.getElementById('searchboxX');
    searchboxX.addEventListener('click', () => {
        searchbox.value = '';
        searchbox.focus();
        for (var i = 0; i < 100; i++) {
            currencyCells[i].parentElement.style.visibility = 'visible';
        }
    })
    //Table Header Event Listeners
    var tableRows = document.getElementsByClassName('tableRow');
    var homePageHeader = document.getElementById('homePageHeader');
    homePageHeader.addEventListener('click', () => {
        var num = 0;
        for (var i = 0; i < tableRows.length; i++) {
            if (tableRows[i].childNodes[1].innerHTML == 'Remove') {
                tableRows[i].parentNode.insertBefore(tableRows[i], tableRows[num]);
                num += 1;
            }
        }
    })
    var alertsHeader = document.getElementById('alertsHeader');
    alertsHeader.addEventListener('click', () => {
        var num = 0;
        for (var i = 0; i < tableRows.length; i++) {
            if (tableRows[i].childNodes[2].innerHTML == 'Edit') {
                tableRows[i].parentNode.insertBefore(tableRows[i], tableRows[num]);
                num += 1;
            }
        }
    })
    var portfolioHeader = document.getElementById('portfolioHeader');
    portfolioHeader.addEventListener('click', () => {
        var num = 0;
        for (var i = 0; i < tableRows.length; i++) {
            if (tableRows[i].childNodes[3].innerHTML == 'Edit') {
                tableRows[i].parentNode.insertBefore(tableRows[i], tableRows[num]);
                num += 1;
            }
        }
    })
    //Currency Buttons Event Listeners
    var fiatButtons = document.getElementsByClassName('fiatButton');
    for (var i = 0; i < fiatButtons.length; i++) {
        fiatButtons[i].addEventListener('click', (e) => {
        fiat = e.target.id;
        setFiatColor(fiat);
        httpGetAsync('https://api.coinmarketcap.com/v1/ticker/?convert=' + fiat + '&limit=0', storeFiat, fiat);
        //storeFiat(fiat);
        })
    }
    //load more event listener
    var tableLoadMore = document.getElementById('tableLoadMore');
    var rowsNum = 99;
    tableLoadMore.addEventListener('click', () => {
        if ((rowsNum + 100) < tableRows.length) {
            for (var i = rowsNum; i < rowsNum + 100; i++) {
                tableRows[i].style.visibility = 'visible';
            }
            rowsNum += 100;
        } else {
            rowsLeft = tableRows.length - rowsNum;
            for (var i = rowsNum; i < rowsLeft; i++) {
                tableRows[i].style.visibility = 'visible';
            }
            rowsNum += rowsLeft;
            tableLoadMore.style.display = 'none';
        }
    })
});