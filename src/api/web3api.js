import React, { Component } from "react";
import Web3 from "web3";
import EventEmitter from "events";

// var password = "123456"
// web3.setProvider(new web3.providers.HttpProvider("http://localhost:5488"));

let provider;
let _web3;

export default class web3Api extends Component {
  /**
   * Initiate the event emitter
   */
  constructor(props) {
    super(props);
    this.eventEmitter = new EventEmitter();
  }

  static get web3() {
    if (!_web3) {
      _web3 = new Web3();
    }
    return _web3;
  }

  setNodeAddress(newNodeAddress) {
    console.log("Attempting to reconnect...");
    if (newNodeAddress.indexOf("ws") === 0) {
      provider = new Web3.providers.WebsocketProvider(newNodeAddress);
    } else {
      provider = new Web3.providers.HttpProvider(newNodeAddress);
    }
    provider.on("connect", function() {
      console.log("blockchain Reconnected");
    });

    if (!_web3) {
      _web3 = new Web3(provider);
    } else {
      _web3.setProvider(provider);
    }
    provider.on("error", e => {
      console.error("Blockchain WS Error", e);
    });

    provider.on("end", e => {
      _web3 = null;
      console.log(
        "Blockchain disconnected will try to reconnect in 15 seconds"
      );
      setTimeout(() => {}, 15 * 1000);
    });
  }

  /**
   * Adds the @listener function to the end of the listeners array
   * for the event named @eventName
   * Will ensure that only one time the listener added for the event
   *
   * @param {string} eventName
   * @param {function} listener
   */
  on(eventName, listener) {
    this.eventEmitter.on(eventName, listener);
  }

  /**
   * Will temove the specified @listener from @eventname list
   *
   * @param {string} eventName
   * @param {function} listener
   */
  removeEventListener(eventName, listener) {
    this.eventEmitter.removeListener(eventName, listener);
  }
  /**
   * Will emit the event on the evetn name with the @payload
   * and if its an error set the @error value
   *
   * @param {string} event
   * @param {object} payload
   * @param {boolean} error
   */
  emit(event, payload, error = false) {
    this.eventEmitter.emit(event, payload, error);
  }
  /**
   * Returns the event emitter
   * Used for testing purpose and avoid using this during development
   */
  getEventEmitter() {
    return this.eventEmitter;
  }
}

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

// web3.eth.filter('latest').watch(function(err,log) {
//     web3.fsn.buyTicket({from:web3.fsn.coinbase},password)
// });

//fsn.assetToTimeLock({from:fsn.coinbase,to:fsn.coinbase,asset:"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",start:"0x0",end:"0x1",value:"0x1111111"},"123456")
