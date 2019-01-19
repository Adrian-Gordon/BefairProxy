'use strict'

const should = require('should')

const chai = require('chai')
const assert = chai.assert
const expect = chai.expect

const BetfairProxy = require('./betfairproxy').BetfairProxy
const nconf = require('../config/conf.js').nconf


describe("BetfairProxy", () => {

	it("instantiates a BetfairProxy object", (done) => {

		const bfProxy = new BetfairProxy()
		bfProxy.should.be.instanceof(BetfairProxy)
		should.equal(bfProxy.sessionToken,null)
		done()

	})

	it("throws an error if no Betfair username is provided for login", (done) => {
		const bfProxy = new BetfairProxy()
		assert.throws(() => bfProxy.login(),Error,"Betfair username required")
		done()

	})
	it("throws an error if no Betfair password is provided for login", (done) => {
		const bfProxy = new BetfairProxy()
		assert.throws(() => bfProxy.login(nconf.get("bfusername")),Error,"Betfair password required")
		done()

	})
	it("throws an error if no Betfair api key is provided for login", (done) => {
		const bfProxy = new BetfairProxy()
		assert.throws(() => bfProxy.login(nconf.get("bfusername"),nconf.get("bfpassword")),Error,"Betfair api key required")
		done()

	})
	it("fails to log in to Betfair with incorrect credentials", (done) => {
		const bfProxy = new BetfairProxy()
		bfProxy.login(nconf.get('bfusername'), "ewewewe", nconf.get('bfapikey'))
		.catch(error => {
			expect(error).to.eql('Betfair Login Failure')
			done()
		})

	})

	it("logs in to Betfair, and sets the session Token", (done) => {
		const bfProxy = new BetfairProxy()
		bfProxy.login(nconf.get('bfusername'), nconf.get('bfpassword'), nconf.get('bfapikey'))
		.then(token => {
			expect(token).to.be.a('string')
			expect(bfProxy.sessionToken).to.eql(token)
			done()
		})

	})

	it("gets all racing markets", (done) => {
		const bfProxy = new BetfairProxy()
		bfProxy.login(nconf.get('bfusername'), nconf.get('bfpassword'), nconf.get('bfapikey'))
		.then(token => {
			bfProxy.getMarkets()
			.then(markets => {
				expect(markets.result).to.be.a('array')
				done()
			})
			
		})
	})

	it("gets a market odds", (done) => {
		const bfProxy = new BetfairProxy()
		bfProxy.login(nconf.get('bfusername'), nconf.get('bfpassword'), nconf.get('bfapikey'))
		.then(token => {
			bfProxy.getMarkets()
			.then(markets => {
				const marketId = markets.result[0].marketId
				//console.log(marketId)
				bfProxy.getMarketOdds(marketId)
				.then(marketOdds => {
					//console.log(JSON.stringify(marketOdds))
					marketOdds.result[0].marketId.should.eql(marketId)
					done()
				})
				
			})
			
		})
	})

	it("Adds data to a market history", (done)=>{
		const bfProxy = new BetfairProxy()
		bfProxy.login(nconf.get('bfusername'), nconf.get('bfpassword'), nconf.get('bfapikey'))
		.then(token => {
			bfProxy.getMarkets()
			.then(markets => {
				const marketId = markets.result[0].marketId
				//console.log(marketId)
				bfProxy.getMarketOdds(marketId)
				.then(marketOdds => {
					//console.log(JSON.stringify(marketOdds))
					bfProxy.addDataToMarketHistory(marketOdds.result[0].runners)
					//console.log(bfProxy.marketHistory)
					expect(Object.keys(bfProxy.marketHistory).length).to.be.gt(0)
					//bfProxy.marketHistory
					done()
				})
				
			})
			
		})

	})
	it("builds a market history", (done) => {
		const bfProxy = new BetfairProxy()
		bfProxy.login(nconf.get('bfusername'), nconf.get('bfpassword'), nconf.get('bfapikey'))
		.then(token => {
			bfProxy.getMarkets()
			.then(markets => {
				const marketId = markets.result[0].marketId
				//console.log(marketId)
				bfProxy.getMarketHistory(marketId, 2, 0.5) //2 iterations half a second apart
				.then(marketHistory => {
					//console.log(JSON.stringify(marketOdds))
					//marketOdds.result[0].marketId.should.eql(marketId)
					console.log(marketHistory)
					done()
				})
				
			})
			
		})
	})



})