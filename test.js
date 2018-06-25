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

function createConvertSelects(coinList) {
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

	var select1 = document.getElementById('select1');
	var select2 = document.getElementById('select2');
	if (select1.length < 30) {
		for (var i = 0; i < coinArray.length; i++) {
      		var option1 = document.createElement('option');
      		option1.text = coinArray[i]['FullName'];
      		var setOption1 = select1.appendChild(option1);
      		//setOption1.setAttribute('value', json[i]['id']);
      		setOption1.setAttribute('id', coinArray[i]['Symbol']);
      		setOption1.setAttribute('class', 'crypto');
      		var option2 = document.createElement('option');
      		option2.text = coinArray[i]['FullName'];
      		var setOption2 = select2.appendChild(option2);
      		//setOption2.setAttribute('value', json[i]['id']);
      		setOption2.setAttribute('id', coinArray[i]['Symbol']);
      		setOption2.setAttribute('class', 'crypto');
      		if (option1.text.length > 20) {
        		setOption1.style.fontSize = (20 / option1.text.length) * 100 + '%';
        		setOption2.style.fontSize = (20 / option1.text.length) * 100 + '%';
      		}
    	}
	}
	//document.getElementById('BTC').selected = true;
}

document.addEventListener('DOMContentLoaded', () => {
	httpGetAsync('https://min-api.cryptocompare.com/data/all/coinlist', createConvertSelects, 'JSON');
});