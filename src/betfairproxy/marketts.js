/*Generate a market timeseries
	usage: node marketts --conf=<configfilename> --marketid=<bfmarketid> --iterations=<number of iterations> --delay=<delay in seconds between iterations>
*/

'use strict'

const BetfairProxy = require('./betfairproxy').BetfairProxy
const nconf = require('../config/conf.js').nconf

const  MongoClient = require('mongodb').MongoClient;

const dburl = nconf.get("dburl")

const bfProxy = new BetfairProxy()

bfProxy.login(nconf.get('bfusername'), nconf.get('bfpassword'), nconf.get('bfapikey'))
.then(token => {
	bfProxy.getMarketHistory(nconf.get('marketid'), nconf.get('iterations'), nconf.get('delay')) 
	.then(marketHistory => {
		let record={
			timestamp :new Date().getTime(),
			marketid : nconf.get('marketid'),
			iterations :nconf.get('iterations'),
			delay : nconf.get('delay'),
			markethistory: marketHistory
		}

		
		//console.log(marketHistory)
		MongoClient.connect(dburl, function(err, db) {
		  if (err) throw err
		  var dbo = db.db("rpdata")
		  dbo.collection("timeseries").insertOne(record, function(err, res) {
		    if (err) throw err
		    console.log("1 document inserted")
		    db.close()
		  })
		})
	})
	
})




