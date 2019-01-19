'use strict'

const request = require('request-promise-native')


class BetfairProxy{

	constructor(){
		this.sessionToken = null
		this.baseUrl="https://identitysso.betfair.com/api/login"
		this.apiUrl="https://api.betfair.com/exchange/betting/json-rpc/v1"
		this.marketHistory ={}

	}

	login(username, password, key){
		if(typeof username == 'undefined'){
			throw new Error("Betfair username required")
		}
		if(typeof password == 'undefined'){
			throw new Error("Betfair password required")
		}
		if(typeof key == 'undefined'){
			throw new Error("Betfair api key required")
		}

		this.key = key

		const options={
			url:this.baseUrl + "?username=" + username + "&password=" + password,
			method:"POST",
			headers :{
			'X-Application': key,
			'Accept': 'application/json'
			},
			json:true
		}
		
		return new Promise((resolve, reject) => {
			request(options)
			.then(response => {
				//console.log(response)
				//const respObject = JSON.parse(response)
				if(response.status == 'SUCCESS'){
					this.sessionToken = response.token
					resolve(response.token)
				}
				else if(response.status == 'FAIL'){
					reject("Betfair Login Failure")
				}
			})
			
		})

	}

	getMarkets(){
		const options = {
			url:this.apiUrl,
			method:"POST",
			headers :{
			'X-Application': this.key,
			'Accept': 'application/json',
			'Content-type':'application/json',
			'X-Authentication': this.sessionToken
			},
			body:{
				"jsonrpc":"2.0",
		 		"method":"SportsAPING/v1.0/listMarketCatalogue",
		 	 	"params": {"filter":{"eventTypeIds": ["7"],
	 	 					"marketCountries":["GB","IE"],
	 	 					"marketTypeCodes":["WIN","PLACE"],
	 	 					"marketStartTime":{"from":new Date().toJSON()}},
	 	 					"sort":"FIRST_TO_START",
	 	 					"maxResults":"100",
	 	 					"marketProjection":["MARKET_START_TIME","EVENT","EVENT_TYPE","RUNNER_DESCRIPTION"]}, 
		 
		 	 	"id": 1
		 	 },
			json:true
		}
		

		return new Promise((resolve, reject) => {
			request(options)
			.then(response => {
				//console.log(response)
				resolve(response)
			})
		})

	}
	getMarketOdds(marketid){
		const options = {
			url:this.apiUrl,
			method:"POST",
			headers :{
			'X-Application': this.key,
			'Accept': 'application/json',
			'Content-type':'application/json',
			'X-Authentication': this.sessionToken
			},
			body:{
        		"jsonrpc":"2.0",
        		"method":"SportsAPING/v1.0/listMarketBook",
         		"params": {
            		"marketIds":[marketid],
            		"priceProjection":{"priceData":["EX_BEST_OFFERS","EX_TRADED"],
            							"exBestOffersOverrides":{"bestPricesDepth": 10}}
         		}, 
       
         		"id": 1},
			json:true
		}
		

		return new Promise((resolve, reject) => {
			request(options)
			.then(response => {
				//console.log(response)
				
				resolve(response)
			})
		})

	}


	getMarketHistory(marketid, iterations, delay){
		//console.log(marketid + " " + iterations + " " + delay)
	  //console.log("in recursiveFn2 " + count + " " + returnVal)
	  return new Promise((resolve, reject) => {
	    //console.log("executing the promise for recursiveFn2 " + count + " " + returnVal)
	    if(iterations == 0){
	      //console.log("count is 0 in recursiveFn2, resolving to: " + returnVal)
	      resolve(this.marketHistory)
	    }
	    else{
	      //get the current odds
	      this.getMarketOdds(marketid)
	      .then(marketData => {
	      	this.addDataToMarketHistory(marketData.result[0].runners)
	      	//wait
	      	setTimeout(() => {
	      		this.getMarketHistory(marketid, iterations -1, delay)
		      	.then(marketHistory => {
		      		resolve(marketHistory)
		      	})
	      	},delay * 1000)
	      	
	      })
	    }
	  })
	}



	addDataToMarketHistory(runnersData){
		//console.log(runnersData)
		runnersData.forEach( runner => {
			//if(runner.status == 'ACTIVE'){
				const id = "" + runner.selectionId
			//console.log(id)
			//is it there
				if(!this.marketHistory[id]){
					this.marketHistory[id] = {
						"status":runner.status,
						"layprice1":[],
						"laydepth1":[],
						"layprice2":[],
						"laydepth2":[],
						"layprice3":[],
						"laydepth3":[],
						"layprice4":[],
						"laydepth4":[],
						"layprice5":[],
						"laydepth5":[],
						"layprice6":[],
						"laydepth6":[],
						"layprice7":[],
						"laydepth7":[],
						"layprice8":[],
						"laydepth8":[],
						"layprice9":[],
						"laydepth9":[],
						"layprice10":[],
						"laydepth10":[],
						"backprice1":[],
						"backdepth1":[],
						"backprice2":[],
						"backdepth2":[],
						"backprice3":[],
						"backdepth3":[],
						"backprice4":[],
						"backdepth4":[],
						"backprice5":[],
						"backdepth5":[],
						"backprice6":[],
						"backdepth6":[],
						"backprice7":[],
						"backdepth7":[],
						"backprice8":[],
						"backdepth8":[],
						"backprice9":[],
						"backdepth9":[],
						"backprice10":[],
						"backdepth10":[]

					}
				}
			
			//}

		})
		runnersData.forEach(runner => {
			const id = "" + runner.selectionId
			const layPrices = runner.ex.availableToLay
			for(let i=0;i<10; i++){
				let price=0.0
				let depth=0.0
				if(i < layPrices.length){
					price = layPrices[i].price
				 	depth = layPrices[i].size
				}
				
				this.marketHistory[id]["layprice" + (i+1)].push(price)
				this.marketHistory[id]["laydepth" + (i+1)].push(depth)
			}
			const backPrices = runner.ex.availableToBack
			for(let i=0;i<10; i++){
				let price=0.0
				let depth=0.0
				if(i < backPrices.length){
					price = backPrices[i].price
				 	depth = backPrices[i].size
				}
				
				this.marketHistory[id]["backprice" + (i+1)].push(price)
				this.marketHistory[id]["backdepth" + (i+1)].push(depth)
			}

		})
		

	}
}


module.exports = Object.assign({}, {BetfairProxy})