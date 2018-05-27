document.addEventListener('DOMContentLoaded', () => {
	var currentPrice = {};
	var socket = io.connect('https://streamer.cryptocompare.com/');
	var subscription = ['5~CCCAGG~BTC~USD', '5~CCCAGG~ETH~USD'];
	socket.emit('SubAdd', { subs: subscription });
	socket.on("m", function(message) {
		console.log(message);
		dataUnpack(message);
	});
	var dataUnpack = function(message) {
		var data = CCC.CURRENT.unpack(message);
		console.log(data);
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
			displayData(currentPrice[pair], from, tsym, fsym);
		}
	};

	var displayData = function(messageToDisplay, from, tsym, fsym) {
		var priceDiv = document.getElementById('price' + from);
		var changeDiv = document.getElementById('change' + from);
		var priceDirection = messageToDisplay.FLAGS;
		var fields = CCC.CURRENT.DISPLAY.FIELDS;

		for (var key in fields) {
			if (messageToDisplay[key]) {
				if (fields[key].Show) {
					switch (fields[key].Filter) {
						case 'String':
							if (key == 'CHANGE24HOURPCT') {
								changeDiv.innerHTML = messageToDisplay[key];
							}
							//console.log(key);
							//console.log(messageToDisplay[key]);
							break;
						case 'Number':
							//console.log(key);
							var symbol = fields[key].Symbol == 'TOSYMBOL' ? tsym : fsym;
							if (key == 'PRICE') {
								priceDiv.innerHTML = CCC.convertValueToDisplay(symbol, messageToDisplay[key]);
							}
							//console.log(key);
							//console.log(CCC.convertValueToDisplay(symbol, messageToDisplay[key]));
							break;
					}
				}
			}
		}
	};
});