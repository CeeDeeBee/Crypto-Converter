function collapseTable(id, enabled) {
 	var portfolioTableRows = document.getElementsByClassName('portfolioTableRow');
 	//var oneHrTotal = 0;
 	var tfHrTotal = 0;
 	//var sevenDayTotal = 0;
 	var totalValue = 0;
 	var portfolioTableFooter = document.getElementById('portfolioTableFooter');
 	for (var i = 0; i < portfolioTableRows.length; i++) {
 		if (portfolioTableRows[i]['id'] == id) {
 			if (enabled) {
 				portfolioTableRows[i].style.visibility = 'visible';
 			} else {
 				portfolioTableRows[i].style.visibility = 'collapse';
 			}
 		}
 		console.log(portfolioTableRows[i]);
 		if (portfolioTableRows[i].style.visibility != 'collapse') {
 			var children = portfolioTableRows[i].childNodes;
 			value = children[2].innerHTML;
 			//oneHrValue = children[3].innerHTML;
 			tfHrValue = children[3].innerHTML;
 			//sevenDayValue = children[5].innerHTML;
 			//oneHrTotal += +oneHrValue;
	        tfHrTotal += +tfHrValue;
	        //sevenDayTotal += +sevenDayValue;
	        totalValue += +value.replace(',','');
 		}
 	}
 	var footerChildren = portfolioTableFooter.childNodes;
 	console.log(footerChildren);
 	footerChildren[5].innerHTML = totalValue.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
 	/*
 	footerChildren[6].innerHTML = oneHrTotal.toFixed(2);
 	if (oneHrTotal < 0) {
 		footerChildren[6].style.color = 'red';
 	} else {
 		footerChildren[6].style.color = 'green';
 	}
 	*/
 	footerChildren[6].innerHTML = tfHrTotal.toFixed(2);
 	if (tfHrTotal < 0) {
 		footerChildren[6].style.color = 'red';
 	} else {
 		footerChildren[6].style.color = 'green';
 	}
 	/*
 	footerChildren[8].innerHTML = sevenDayTotal.toFixed(2);
 	if (sevenDayTotal < 0) {
 		footerChildren[8].style.color = 'red';
 	} else {
 		footerChildren[8].style.color = 'green';
 	}
 	*/
 	console.log(totalValue);
}

var fiatSymbols = {USD: '$', AUD: '$', BRL: '$', CAD: '$', CHF: 'CHF ', CLP: '$', 
                  CNY: '&#165;', CZK: '&#x4b;&#x10d;', DKK: '&#x6b;&#x72;', EUR: '&#128;', GBP: '&#8356;', HKD: '$', 
                  HUF: '&#x46;&#x74;', IDR: '&#x52;&#x70;', ILS: '&#x20aa;', INR: '&#x20B9;', JPY: '&#165;', KRW: '&#x20a9;',
                  MXN: '$', MYR: '&#x52;&#x4d;', NOK: '&#x6b;&#x72;', NZD: '$', PHP: '&#8369;', PKR: '&#8360;', 
                  PLN: '&#x7a;&#x142;', RUB: '&#x20bd;', SEK: '&#x6b;&#x72;', SGD: '$', THB: '&#xe3f;', TRY: '&#8378;',
                  TWD: '$', ZAR: '&#x52;'};
(function(d3) {
	'use strict';

	chrome.storage.local.get(null, (result) => {
		var dataset = [];
		var portfolioArray = result['portfolioArray'];
		var coinList = result['coinList'];
		if (portfolioArray == undefined) {
			portfolioArray = [];
		}
		var fiat = result['Fiat'];
		var ran = false;
		//var json = result['json'];
		//var price = 'price_' + fiat.toLowerCase();
		chrome.runtime.sendMessage({id: "getCache"});
	  	chrome.runtime.onMessage.addListener(function(request) {
	  		if (!ran) {
	  			if (request && (request.id == 'getCacheResponse')) {
		    		var cachedPrices = request.data[0];
		      		var cachedChanges = request.data[1];
		      		createDataset(cachedPrices, portfolioArray, coinList, fiat);
		    	}
		    	ran = true;
	  		}
	    });

	    function createDataset(cachedPrices, portfolioArray, coinList, fiat) {
	    	console.log(portfolioArray);
	    	for (var key in portfolioArray) {
	    		var symbol = key;
	    		//var price = cachedPrices[symbol].replace(fiatSymbols[fiat] + ' ','').replace(',','');
	    		var price = cachedPrices[symbol].substring(cachedPrices[symbol].indexOf(" ") + 1).replace(',','');
	    		console.log(price);
	    		var value = (parseFloat(price) * parseFloat(portfolioArray[key])).toFixed(2);
	    		var obj = {
					label: coinList['Data'][symbol]['FullName'],
					count: value,
					enabled: true,
					'id': symbol
				};
				if (obj.label.length > 15) {
					obj.label = symbol;
				}
				dataset.push(obj);
				console.log(obj);
	    	}
	    	/*
			for (var i = 0; i < portfolioArray.length; i++) {
				var symbol = portfolioArray[i][0];
				var price = cachedPrices[symbol].replace('$ ','').replace(',','');
			    var value = (parseFloat(price) * parseFloat(portfolioArray[i][1])).toFixed(2);
				var obj = {
					label: coinList['Data'][symbol]['FullName'],
					count: value,
					enabled: true,
					'id': symbol
				};
				if (obj.label.length > 15) {
					obj.label = symbol;
				}
				dataset.push(obj);
			}
			*/
			displayChart(dataset);
		}

		function displayChart(dataset) {
			console.log(dataset);
			var width = 400;
			var height = 200;
			var radius = Math.min(width, height) / 2;
			var donutWidth = 40;
			var legendRectSize = 18;
			var legendSpacing = 4;
			var legendHeight = 0;

			var color = d3.scaleOrdinal(d3.schemeCategory20b);

			var svg = d3.select('#chart')
				.append('svg')
				.attr('width', 200)
				.attr('height', height)
				.attr('transform', 'translate(' + (0) + ',' + (0) + ')')
				.append('g')
				.attr('transform', 'translate(' + (100) + ',' + (height / 2) + ')');

			var legendSvg = d3.select('#legend')
				.append('svg')
				.attr('class', 'legendSvg')
				.attr('width', 130)
				.attr('height', legendHeight)
				//.attr('transform', 'translate(' + (-95) + ',' + (0) + ')')
				.append('g')
				.attr('transform', 'translate(' + (-140) + ',' + (height / 2) + ')'); //height / 2

			var arc = d3.arc()
				.innerRadius(radius - donutWidth)
				.outerRadius(radius);

			var pie = d3.pie()
				.value(function(d) { return d.count; })
				.sort(null);

			var tooltip = d3.select('#chart')            
		  		.append('div')                             
		  		.attr('class', 'tooltip');                 

			tooltip.append('div')                        
		  		.attr('class', 'label');                   

			tooltip.append('div')                        
		  		.attr('class', 'count');                   

			tooltip.append('div')                        
		  		.attr('class', 'percent'); 

		  	var totalVal = d3.select('#chart')
		  		.append('div')
		  		.attr('class', 'totalVal');

		  	totalVal.append('div')
		  		.attr('class', 'valTitle')
		  		.html('Total Value:')

		  	totalVal.append('div')
		  		.attr('class', 'val')

		  	var total = d3.sum(dataset.map(function(d) {
				return (d.enabled) ? d.count : 0;
			}));
			console.log(dataset.length);
			totalVal.select('.val').html(fiatSymbols[fiat] + total.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));

			var path = svg.selectAll('path')
				.data(pie(dataset))
				.enter()
				.append('path')
				.attr('d', arc)
				.attr('fill', function(d, i) {
					return color(d.data.label);
				})
				.each(function(d) { this._current = d; });

			path.on('mouseover', function(d) {
				var total = d3.sum(dataset.map(function(d) {
					return (d.enabled) ? d.count : 0;
				}));
				var percent = Math.round(1000 * d.data.count / total) / 10;
				tooltip.select('.label').html(d.data.label);
				tooltip.select('.count').html(d.data.count);
				tooltip.select('.percent').html(percent + '%');
				tooltip.style('display', 'block');
			});

			path.on('mouseout', function(d) {
				tooltip.style('display', 'none');
			});

			var legendContainer = legendSvg.append('g')
				.attr('width', 100)
				.attr('height', 200)
				.attr('class', 'legendContainer');

			var legend = legendContainer.selectAll('.legend')
				.data(color.domain())
				.enter()
				.append('g')
				.attr('class', 'legend')
				.attr('transform', function(d, i) {
					if (color.domain().length < 10) {
						var height = legendRectSize + legendSpacing;
						legendHeight += height;
						var offset = height * color.domain().length / 2;
						var horz = 8 * legendRectSize;
						//var horz = -2 * legendRectSize;
						var vert = i * height - offset;
						return 'translate(' + horz + ',' + vert + ')';
					} else {
						var height = legendRectSize + legendSpacing;
						legendHeight += height;
						var horz = 8 * legendRectSize;
						var vert = i * height - 100;
						return 'translate(' + horz + ',' + vert + ')';
					}
				});

			legendSvg = d3.select('.legendSvg')
				.attr('height', function() {
					if (legendHeight > 200) {
						return legendHeight;
					} else {
						return 200;
					}
				})
				
			legend.append('rect')
				.attr('width', legendRectSize)
				.attr('height', legendRectSize)
				.style('fill', color)
				.style('stroke', color)
				.on('click', function(label) {
					var rect = d3.select(this);
					var enabled = true;
					var totalEnabled = d3.sum(dataset.map(function(d) {
						return (d.enabled) ? 1 : 0;
					}));
					if (rect.attr('class') === 'disabled') {
						rect.attr('class', '');
					} else {
						if (totalEnabled < 2) return;
						rect.attr('class', 'disabled');
						enabled = false;
					}

					pie.value(function(d) {
						if (d.label === label) d.enabled = enabled;
						return (d.enabled) ? d.count : 0;
					});

					path = path.data(pie(dataset));

					path.transition()
						.duration(750)
						.attrTween('d', function(d) {
							var interpolate = d3.interpolate(this._current, d);
							this._current = interpolate(0);
							return function(t) {
								return arc(interpolate(t));
							};
						});
					var total = d3.sum(dataset.map(function(d) {
						return (d.enabled) ? d.count : 0;
					}));
					totalVal.select('.val').html(total.toFixed(2));
					var id = d3.select(this.parentNode).select('text').attr('id');
					collapseTable(id, enabled);
				})

			//console.log(dataset.map(function(d) { console.log(d.id) }));
			
			legend.append('text')
				.data(pie(dataset))
				.attr('x', legendRectSize + legendSpacing)
				.attr('y', legendRectSize - legendSpacing)
				.attr('id', function(d) { return d.data.id; })
				.text(function(d) { return d.data.label; });
		}
	})

})(window.d3);