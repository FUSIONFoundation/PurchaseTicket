var Web3 = require('web3');
var web3 = new Web3();

// var password = "123456"
// web3.setProvider(new web3.providers.HttpProvider("http://localhost:5488"));


// web3._extend({
// 	property: 'fsn',
// 	methods: [
// 		new web3._extend.Method({
// 			name: 'getBalance',
// 			call: 'fsn_getBalance',
// 			params: 3,
// 			inputFormatter: [
// 				null,
// 				web3._extend.formatters.inputAddressFormatter,
// 				web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'getAllBalances',
// 			call: 'fsn_getAllBalances',
// 			params: 2,
// 			inputFormatter: [				
// 				web3._extend.formatters.inputAddressFormatter,
// 				web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'getTimeLockBalance',
// 			call: 'fsn_getTimeLockBalance',
// 			params: 3,
// 			inputFormatter: [
// 				null,
// 				web3._extend.formatters.inputAddressFormatter,
// 				web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'getAllTimeLockBalances',
// 			call: 'fsn_getAllTimeLockBalances',
// 			params: 2,
// 			inputFormatter: [				
// 				web3._extend.formatters.inputAddressFormatter,
// 				web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'getNotation',
// 			call: 'fsn_getNotation',
// 			params: 2,
// 			inputFormatter: [
// 				web3._extend.formatters.inputAddressFormatter,
// 				web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'getAddressByNotation',
// 			call: 'fsn_getAddressByNotation',
// 			params: 2,
// 			inputFormatter: [
// 				null,
// 				web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'allNotation',
// 			call: 'fsn_allNotation',
// 			params: 1,
// 			inputFormatter: [
// 				web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'genNotation',
// 			call: 'fsn_genNotation',
// 			params: 2,
// 			inputFormatter: [
// 				web3._extend.formatters.inputTransactionFormatter,
// 				null
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'genAsset',
// 			call: 'fsn_genAsset',
// 			params: 2,
// 			inputFormatter: [
// 				function(options){					
// 					if(options.name === undefined || !options.name){
// 						throw new Error('invalid name');
// 					}
// 					if(options.symbol === undefined || !options.symbol){
// 						throw new Error('invalid symbol');
// 					}
// 					if(options.decimals === undefined || options.decimals <= 0 || options.decimals > 255){
// 						throw new Error('invalid decimals');
// 					}
// 					if(options.total !== undefined){
// 						options.total = web3.fromDecimal(options.total)
// 					}
// 					return web3._extend.formatters.inputTransactionFormatter(options)
// 				},
// 				null
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'allAssets',
// 			call: 'fsn_allAssets',
// 			params: 1,
// 			inputFormatter: [
// 				web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'sendAsset',
// 			call: 'fsn_sendAsset',
// 			params: 2,
// 			inputFormatter: [
// 				web3._extend.formatters.inputTransactionFormatter,
// 				null
// 			]
// 		}),		
// 		new web3._extend.Method({
// 			name: 'assetToTimeLock',
// 			call: 'fsn_assetToTimeLock',
// 			params: 2,
// 			inputFormatter: [
// 				function(options){
// 					return web3._extend.formatters.inputTransactionFormatter(options)
// 				},
// 				null
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'timeLockToTimeLock',
// 			call: 'fsn_timeLockToTimeLock',
// 			params: 2,
// 			inputFormatter: [
// 				function(options){
// 					return web3._extend.formatters.inputTransactionFormatter(options)
// 				},
// 				null
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'timeLockToAsset',
// 			call: 'fsn_timeLockToAsset',
// 			params: 2,
// 			inputFormatter: [
// 				function(options){
// 					return web3._extend.formatters.inputTransactionFormatter(options)
// 				},
// 				null
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'allTickets',
// 			call: 'fsn_allTickets',
// 			params: 1,
// 			inputFormatter: [
// 				web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new web3._extend.Method({
// 			name: 'buyTicket',
// 			call: 'fsn_buyTicket',
// 			params: 2,
// 			inputFormatter: [
// 				web3._extend.formatters.inputTransactionFormatter,
// 				null
// 			]
// 		}),
// 	],
// 	properties:[
// 		new web3._extend.Property({
// 			name: 'coinbase',
// 			getter: 'eth_coinbase'
// 		}),
// 	]
// });

export default web3

// web3.eth.filter('latest').watch(function(err,log) {
//     web3.fsn.buyTicket({from:web3.fsn.coinbase},password)
// });
 
//fsn.assetToTimeLock({from:fsn.coinbase,to:fsn.coinbase,asset:"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",start:"0x0",end:"0x1",value:"0x1111111"},"123456")