/* Get a list of betfair ids*/
/* usage:
	node getmarketids --conf=<configfilename>
*/

'use strict'

const BetfairProxy = require('./betfairproxy').BetfairProxy
const nconf = require('../config/conf.js').nconf


const bfProxy = new BetfairProxy()
bfProxy.login(nconf.get('bfusername'), nconf.get('bfpassword'), nconf.get('bfapikey'))
.then(token => {
	bfProxy.getMarkets()
	.then(markets => {
		console.log(markets)
	})
})