/* Get a list of betfair ids*/
/* usage:
	node getmarketids --conf=<configfilename>
*/

'use strict'

const BetfairProxy = require('./betfairproxy').BetfairProxy
const nconf = require('../config/conf.js').nconf
const moment = require('moment')

const output = nconf.get('output')
let timeperiod = nconf.get('timeperiod') 

if(!timeperiod) timeperiod = 60


const bfProxy = new BetfairProxy()
bfProxy.login(nconf.get('bfusername'), nconf.get('bfpassword'), nconf.get('bfapikey'))
.then(token => {
	bfProxy.getMarkets(nconf.get('code'),nconf.get('markettype'))
	.then(markets => {
		if(output == 'timeseries'){
			outputTimeseries(markets)
		}
		else console.log(markets)
	})
})


const outputTimeseries = (markets) =>{

	const returnObject={
		"dir":"/home/ubuntu/BetfairProxy",
  		"iterations": timeperiod,
  		"delay": timeperiod,
  		"tasks":[]
	}

	markets.forEach(market => {
		const id = market.marketId
		const startTime = market.marketStartTime

		const seriesStartTime = moment(startTime).subtract(timeperiod, 'minutes')

		//console.log(id + " " + startTime + " " + seriesStartTime.toISOString())
		const task ={
			"marketid": id,
			"time":parseInt(seriesStartTime.format("HHmm"))
		}
		returnObject.tasks.push(task)

	})
	console.log(JSON.stringify(returnObject, null, 4))
}