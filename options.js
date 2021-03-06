/*
  Copyright 2018, Colin D. Barnes. All rights reserved.
*/
//Checks license when options page is opened sends request for license
function checkStorage() {
    chrome.storage.local.get(null, (result) => {
        console.log('open');
        //console.log(result['licenseStatus']);
        //if (result['licenseStatus'] != 'FREE_TRIAL_EXPIRED' && result['licenseStatus'] != 'NONE') {
        createTable(result['coinList']);
        setHomeCell(result['currencyArray']);
        setAlertCell(result['alertArray']);
        setPortfolioCell(result['portfolioArray']);
        displayAlertTimer(result['alertTimer']);
        setFiatColor(result['Fiat']);
        /*
        } else {
            document.body.innerHTML = '';
            var unpaidDiv = document.body.appendChild(document.createElement('div'));
            unpaidDiv.setAttribute('class', 'wrapper');
            var text1 = unpaidDiv.appendChild(document.createElement('div'));
            text1.innerHTML = ' Thank You For Using Crypto Toolbox. Your Free Trial Has Expired. <br> Please Click '
            var link = text1.appendChild(document.createElement('a'));
            link.innerHTML = 'Here';
            link.href = 'https://chrome.google.com/webstore/detail/crypto-toolbox/eaiipppjcplaacihfjkhhdafojoodjpp';
            var text2 = text1.appendChild(document.createElement('div'));
            text2.innerHTML = 'To Subscribe To The Full Version.'
        }
        */
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
    if (currencyArray != undefined) {
        for (var i = 0; i < currencyArray.length; i++) {
            var homeCell = document.getElementById(currencyArray[i] + 'HomeCell');
            homeCell.innerHTML = 'Remove';
        }
    }
    var tableRows = document.getElementsByClassName('tableRow');
    var num = 0;
    for (var i = 0; i < tableRows.length; i++) {
        if (tableRows[i].childNodes[1].innerHTML == 'Remove') {
            tableRows[i].parentNode.insertBefore(tableRows[i], tableRows[num]);
            tableRows[num].style.visibility = 'visible';
            num += 1;
        }
    }
}

function setAlertCell(alertArray) {
    if (alertArray != undefined) {
        for (var i = 0; i < alertArray.length; i++) {
            var alertCell = document.getElementById(alertArray[i][0] + 'AlertCell');
            alertCell.innerHTML = 'Edit';
        }
    }
}

function setPortfolioCell(portfolioArray) {
    if (portfolioArray != undefined) {
        for (var key in portfolioArray) {
            var portfolioCell = document.getElementById(key + 'PortfolioCell');
            portfolioCell.innerHTML = 'Edit';
        }
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
        console.log('open');
        var currencyArray = result['currencyArray'];
        var homeCell = document.getElementById(currency + 'HomeCell');
        if (currencyArray == undefined) {
            currencyArray = [];
        }
        if (action == 'Add') {
            chrome.runtime.sendMessage({id: "addSub", symbol: currency });
            currencyArray.push(currency);
            result['currencyArray'] = currencyArray;
            //console.log('set');
            store(result);
            homeCell.innerHTML = 'Remove';
        } else if (action == 'Remove') {
            chrome.runtime.sendMessage({id: "removeSub", symbol: currency });
            currencyArray = remove(currencyArray, currency);
            result['currencyArray'] = currencyArray;
            //console.log('set');
            store(result);
            homeCell.innerHTML = 'Add';
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
        chrome.runtime.sendMessage({id: "addSub", symbol: currency });
        store(result);
        /*
        console.log(result);
        */
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
            console.log('open');
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
                                        console.log('set');
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

function storeFiat(fiat) {
    chrome.storage.local.get(null, (result) => {
        result['Fiat'] = fiat;
        chrome.storage.local.set(result);
        console.log(result);
        chrome.runtime.sendMessage({id: "switchFiat", fiat: fiat });
        alert('Base Currency has been changed to ' + fiat);
    })
}

function displayPortfolioPopup(currency, action) {
    var portfolioPopupSubmit = document.getElementById('portfolioPopupSubmit');
    var portfolioPopupSubmitDiv = document.getElementById('portfolioPopupSubmitDiv');
    var portfolioPopupAmount = document.getElementById('portfolioPopupAmount');
    var portfolioPopupCost = document.getElementById('portfolioPopupCost');
    var portfolioPopupRemove = document.getElementById('portfolioPopupRemove');
    chrome.storage.local.get(null, (result) => {
        console.log('open');
        var portfolioArray = result['portfolioArray'];
        if (action == 'Add') {
            portfolioPopupSubmit.setAttribute('class', 'add');
            portfolioPopupSubmitDiv.setAttribute('class', 'add');
            portfolioPopupAmount.value = '';
            portfolioPopupCost.value = '';
            portfolioPopupAmount.placeholder = currency + ' owned';
            portfolioPopupCost.placeholder = result['Fiat'] + ' invested';
            portfolioPopupRemove.style.display = 'none';
        } else if (action == 'Edit') {
            portfolioPopupSubmit.setAttribute('class', 'edit');
            portfolioPopupSubmitDiv.setAttribute('class', 'edit');
            //portfolioPopupRemove.style.display = 'block';
            for (key in portfolioArray) {
                if (key == currency) {
                    portfolioPopupAmount.value = portfolioArray[key][0];
                    portfolioPopupCost.value = portfolioArray[key][1];
                }
            }
            portfolioPopupAmount.placeholder = currency + ' owned';
            portfolioPopupCost.placeholder = result['Fiat'] + ' invested';
        }
    })
}

function storePortfolio(currency, amount, cost) {
    chrome.storage.local.get(null, (result) => {
        console.log('open');
        var portfolioArray = result['portfolioArray'];
        if (amount != 0) {
            portfolioArray[currency] = [amount, cost];
            result['portfolioArray'] = portfolioArray;
            chrome.runtime.sendMessage({id: "addSub", symbol: currency });
        } else {
            delete portfolioArray[currency];
            result['portfolioArray'] = portfolioArray;
            chrome.runtime.sendMessage({id: "removeSub", symbol: currency });
        }
        store(result);
    });
}

function store(result) {
    chrome.storage.local.set(result);
    chrome.storage.local.get(null, (result) => {
        console.log(result);
    });
}

function createTable(coinList) {
    //Create Table
    var coins = coinList['Data'];
    var tableBody = document.getElementById('tableBody');
    var overlay = document.getElementsByClassName('overlay')[0];
    var alertsPopup = document.getElementById('alertsPopup');
    var alertsPopupCurrency =  document.getElementById('alertsPopupCurrency');
    var portfolioPopup = document.getElementById('portfolioPopup');
    var portfolioPopupCurrency = document.getElementById('portfolioPopupCurrency');
    //console.log(coins);
    var num = 0;
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

        return a1 < b1 ? -1 : a1 > b1 ? 1 : 0;
    });
    //console.log(coinArray);
    for (var i = 0; i < coinArray.length; i++) {
        //console.log(coinArray[i]);
        var row = tableBody.insertRow();
        row.setAttribute('class', 'tableRow');
        row.setAttribute('align', 'center');
        row.setAttribute('id', coinArray[i]['Symbol']);
        row.setAttribute('data-url', coinArray[i]['Url']);
        if (num >= 100) {
            row.style.visibility = 'collapse';
        }
        var currencyCell = row.insertCell(0);
        currencyCell.setAttribute('id', coinArray[i]['Symbol'] + 'CurrencyCell');
        currencyCell.innerHTML = coinArray[i]['FullName'];
        currencyCell.setAttribute('class', 'currencyCell');
        currencyCell.addEventListener('click', (e) => {
            var currencyUrl = coinList['BaseLinkUrl'] + e.target.parentElement.dataset.url;
            console.log(currencyUrl);
            chrome.tabs.create({url: currencyUrl});
        })
        var homeCell = row.insertCell(1);
        homeCell.setAttribute('id', coinArray[i]['Symbol'] + 'HomeCell');
        homeCell.innerHTML = 'Add';
        homeCell.addEventListener('click', (e) => {
            var action = e.target.innerHTML;
            var currency = e.target.parentElement.id;
            storeHome(action, currency);
            console.log(action);
        })
        var alertCell = row.insertCell(2);
        alertCell.setAttribute('id', coinArray[i]['Symbol'] + 'AlertCell');
        alertCell.innerHTML = 'Add';
        alertCell.addEventListener('click', (e) => {
            overlay.style.zIndex = '1';
            overlay.style.display = 'block';
            alertsPopup.style.display = 'block';
            var currency = e.target.parentElement.id;
            alertsPopupCurrency.innerHTML = document.getElementById(e.target.parentElement.id + 'CurrencyCell').innerHTML;
            alertsPopupCurrency.setAttribute('id', e.target.parentElement.id);
            var alertsPopupPrice = document.getElementById('alertsPopupPrice');
            document.getElementById('alertsPopupClose').setAttribute('data-symbol', currency);
            var action = e.target.innerHTML;
            displayAlertsPopup(currency, action);
            chrome.runtime.sendMessage({id: "optionsPopupOpened" , symbol: e.target.parentElement.id, page: 'alert' });
        })
        var portfolioCell = row.insertCell(3);
        portfolioCell.setAttribute('id', coinArray[i]['Symbol'] + 'PortfolioCell');
        portfolioCell.innerHTML = 'Add';
        portfolioCell.addEventListener('click', (e) => {
            overlay.style.zIndex = '1';
            overlay.style.display = 'block';
            portfolioPopup.style.display = 'block';
            var currency = e.target.parentElement.id;
            portfolioPopupCurrency.innerHTML = document.getElementById(e.target.parentElement.id + 'CurrencyCell').innerHTML;
            portfolioPopupCurrency.setAttribute('id', currency);
            displayPortfolioPopup(currency, e.target.innerHTML);
            document.getElementById('portfolioPopupClose').setAttribute('data-symbol', currency);
            chrome.runtime.sendMessage({id: "optionsPopupOpened" , symbol: e.target.parentElement.id, page: 'portfolio', kind: e.target.innerHTML });
        })
        num += 1;
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
    //chrome.runtime.sendMessage({ id: "checkLicense" });
    var overlay = document.getElementsByClassName('overlay')[0];
    //Alerts popup event listeners
    var alertsPopup = document.getElementById('alertsPopup');
    var alertsPopupClose = document.getElementById('alertsPopupClose');
    var savedAlerts = document.getElementById('savedAlerts');
    alertsPopupClose.addEventListener('click', (e) => {
        console.log('sent');
        overlay.style.zIndex = '-1';
        overlay.style.display = 'none';
        alertsPopup.style.display = 'none';
        document.getElementById('alertsPopupLoadingIcon').removeAttribute("style");
        document.getElementById('alertsPopupPrice').style.display = 'none';
        document.getElementById('alertFormDiv').style.display = 'none';
        chrome.runtime.sendMessage({id: "optionsPopupClosed" , symbol: e.target.dataset.symbol });
        document.getElementById('alertsPopupPrice').innerHTML = 'Current Price: ';
    })
    var alertForm = document.getElementById('alertForm');
    var alertsPopupSubmit = document.getElementById('alertsPopupSubmit');
    var alertsPopupCurrency =  document.getElementById('alertsPopupCurrency');
    alertForm.addEventListener('submit', () => {
        var currency = alertsPopupCurrency.id;
        var above = document.getElementById('alertsPopupAbove');
        var below = document.getElementById('alertsPopupBelow');
        console.log(above.value);
        console.log(above.value.length);
        if (above.value.length > 0 || below.value.length > 0) {
            storeAlerts(currency, above.value, below.value);
            var alertCell = document.getElementById(currency + 'AlertCell');
            alertCell.innerHTML = 'Edit';
        } else {
            alert('Please enter an above and/or below value in order to set an alert.');
        }
        above.value = '';
        below.value = '';
        event.preventDefault();
    })
    var portfolioPopup = document.getElementById('portfolioPopup');
    var portfolioPopupClose = document.getElementById('portfolioPopupClose');
    var portfolioPopupLoadingIcon = document.getElementById('portfolioPopupLoadingIcon');
    portfolioPopupClose.addEventListener('click', (e) => {
        overlay.style.zIndex = '-1';
        overlay.style.display = 'none';
        portfolioPopup.style.display = 'none';
        portfolioPopupRemove.style.display = 'none';
        portfolioPopupLoadingIcon.removeAttribute("style");
        document.getElementById('portfolioPopupUnavailable').style.display = 'none';
        document.getElementById('portfolioPopupForm').style.display = 'none';
        chrome.runtime.sendMessage({id: "optionsPopupClosed" , symbol: e.target.dataset.symbol });
    })
    var portfolioPopupForm = document.getElementById('portfolioPopupForm');
    var portfolioPopupSubmit = document.getElementById('portfolioPopupSubmit');
    var portfolioPopupCurrency = document.getElementById('portfolioPopupCurrency');
    portfolioPopupForm.addEventListener('submit', () => {
        var currency = portfolioPopupCurrency.id;
        var portfolioPopupAmount = document.getElementById('portfolioPopupAmount');
        var portfolioPopupCost = document.getElementById('portfolioPopupCost');
        storePortfolio(currency, portfolioPopupAmount.value, portfolioPopupCost.value);
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
        portfolioPopupLoadingIcon.removeAttribute("style");
        document.getElementById('portfolioPopupUnavailable').style.display = 'none';
        document.getElementById('portfolioPopupForm').style.display = 'none';
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
        portfolioPopupLoadingIcon.removeAttribute("style");
        document.getElementById('portfolioPopupUnavailable').style.display = 'none';
        document.getElementById('portfolioPopupForm').style.display = 'none';
    })
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
                tableRows[num].style.visibility = 'visible';
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
                tableRows[num].style.visibility = 'visible';
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
                tableRows[num].style.visibility = 'visible';
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
            storeFiat(fiat);
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
    var helpButton = document.getElementById('helpButton');
    helpButton.addEventListener('click', () => {
        chrome.tabs.create({url: 'welcome-page.html'});
    })
});