import React, { Component } from "react";
import _web3 from "web3";
import EventEmitter from "events";

// var password = "123456"
// _web3.setProvider(new _web3.providers.HttpProvider("http://localhost:5488"));


export default class web3Api extends Component {
  /**
   * Initiate the event emitter
   */
  constructor(props) {
    super(props);
    this.eventEmitter = new EventEmitter();
    this._web3 = null
    this.provider = null
    this.connectedOnce = false
    this.lastNodeAddress = ""
  }

  static get web3() {
    if (!this._web3) {
      this._web3 = new _web3();
    }
    return this._web3;
  }

  setNodeAddress(newNodeAddress) {
    let httpOnly

    console.log("Attempting connect");

    if ( this.connectedOnce && newNodeAddress !== this.lastNodeAddress ) {
      this.connectedOnce = false;
    }

    this.lastNodeAddress = newNodeAddress

    if ( this.nextMonitorCall ) {
      clearTimeout( this.nextMonitorCall )
      this.nextMonitorCall = null
    }

    if (newNodeAddress.indexOf("ws") === 0) {
      try {
        this.provider = new _web3.providers.WebsocketProvider(newNodeAddress);
      } catch ( e ) {
        setTimeout( ()=> {
          this.emit( 'connectstatus', ["error"] , e )
        }, 1)
        return
      }
      httpOnly = false
      this.provider.on("connect", function() {
        console.log("blockchain connected");
        this.connectedOnce = true
        this.emit( 'connectstatus', ["connected"] , null )
        this.setupMonitor()
      });
    } else {
      this.provider = new _web3.providers.HttpProvider(newNodeAddress);
      httpOnly = true
    }

    if (!this._web3) {
      this._web3 = new _web3(this.provider);
    } else {
      this._web3.setProvider(this.provider);
    }

    if  ( httpOnly ) {
      // http c
      this._web3.eth.getBlockNumber().then( (block)=> {
        this.emit( 'connectstatus', ["connected", block] , null )
        this.setupMonitor()
        }).
        catch( (e) => {
          this.emit( 'connectstatus', ["error"] , e )
        })
      return;
    }
    
    this.provider.on("error", e => {
      console.error("Blockchain WS Error", e);
      this.emit( 'connectstatus', ["error"] , e )
    });

    this.provider.on("end", e => {
      this._web3 = null;
      console.log(
        "Blockchain disconnected will try to reconnect in 15 seconds"
      );
      setTimeout(() => { 
        this.emit( 'connectstatus', ["disconnected"] , null )
        if ( this.connectedOnce === true ) {
          this.setNodeAddress(newNodeAddress) 
        }
      }, 1);
    });
  }

  setupMonitor() {
    let nextMonitorCall 
    this._web3.eth.getBlockNumber().then( (block)=> {
       
       
      }).
      catch( (e) => {
        if ( nextMonitorCall === this.setupMonitor ) {
          this.emit( 'connectstatus', ["error"] , e )
        }
        
      })
      this.nextMonitorCall = setTimeout( ()=> {
        this.setupMonitor()
      }, 5 * 1000 )
      nextMonitorCall = this.nextMonitorCall
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

// _web3._extend({
// 	property: 'fsn',
// 	methods: [
// 		new _web3._extend.Method({
// 			name: 'getBalance',
// 			call: 'fsn_getBalance',
// 			params: 3,
// 			inputFormatter: [
// 				null,
// 				_web3._extend.formatters.inputAddressFormatter,
// 				_web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'getAllBalances',
// 			call: 'fsn_getAllBalances',
// 			params: 2,
// 			inputFormatter: [
// 				_web3._extend.formatters.inputAddressFormatter,
// 				_web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'getTimeLockBalance',
// 			call: 'fsn_getTimeLockBalance',
// 			params: 3,
// 			inputFormatter: [
// 				null,
// 				_web3._extend.formatters.inputAddressFormatter,
// 				_web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'getAllTimeLockBalances',
// 			call: 'fsn_getAllTimeLockBalances',
// 			params: 2,
// 			inputFormatter: [
// 				_web3._extend.formatters.inputAddressFormatter,
// 				_web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'getNotation',
// 			call: 'fsn_getNotation',
// 			params: 2,
// 			inputFormatter: [
// 				_web3._extend.formatters.inputAddressFormatter,
// 				_web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'getAddressByNotation',
// 			call: 'fsn_getAddressByNotation',
// 			params: 2,
// 			inputFormatter: [
// 				null,
// 				_web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'allNotation',
// 			call: 'fsn_allNotation',
// 			params: 1,
// 			inputFormatter: [
// 				_web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'genNotation',
// 			call: 'fsn_genNotation',
// 			params: 2,
// 			inputFormatter: [
// 				_web3._extend.formatters.inputTransactionFormatter,
// 				null
// 			]
// 		}),
// 		new _web3._extend.Method({
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
// 						options.total = _web3.fromDecimal(options.total)
// 					}
// 					return _web3._extend.formatters.inputTransactionFormatter(options)
// 				},
// 				null
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'allAssets',
// 			call: 'fsn_allAssets',
// 			params: 1,
// 			inputFormatter: [
// 				_web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'sendAsset',
// 			call: 'fsn_sendAsset',
// 			params: 2,
// 			inputFormatter: [
// 				_web3._extend.formatters.inputTransactionFormatter,
// 				null
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'assetToTimeLock',
// 			call: 'fsn_assetToTimeLock',
// 			params: 2,
// 			inputFormatter: [
// 				function(options){
// 					return _web3._extend.formatters.inputTransactionFormatter(options)
// 				},
// 				null
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'timeLockToTimeLock',
// 			call: 'fsn_timeLockToTimeLock',
// 			params: 2,
// 			inputFormatter: [
// 				function(options){
// 					return _web3._extend.formatters.inputTransactionFormatter(options)
// 				},
// 				null
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'timeLockToAsset',
// 			call: 'fsn_timeLockToAsset',
// 			params: 2,
// 			inputFormatter: [
// 				function(options){
// 					return _web3._extend.formatters.inputTransactionFormatter(options)
// 				},
// 				null
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'allTickets',
// 			call: 'fsn_allTickets',
// 			params: 1,
// 			inputFormatter: [
// 				_web3._extend.formatters.inputDefaultBlockNumberFormatter
// 			]
// 		}),
// 		new _web3._extend.Method({
// 			name: 'buyTicket',
// 			call: 'fsn_buyTicket',
// 			params: 2,
// 			inputFormatter: [
// 				_web3._extend.formatters.inputTransactionFormatter,
// 				null
// 			]
// 		}),
// 	],
// 	properties:[
// 		new _web3._extend.Property({
// 			name: 'coinbase',
// 			getter: 'eth_coinbase'
// 		}),
// 	]
// });

// _web3.eth.filter('latest').watch(function(err,log) {
//     _web3.fsn.buyTicket({from:_web3.fsn.coinbase},password)
// });

//fsn.assetToTimeLock({from:fsn.coinbase,to:fsn.coinbase,asset:"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",start:"0x0",end:"0x1",value:"0x1111111"},"123456")
