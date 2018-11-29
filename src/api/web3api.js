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
    this._web3 = null;
    this.provider = null;
    this.connectedOnce = false;
    this.lastNodeAddress = "";
    this.attempForMonitor = 0;
    this.lastBlock = {};

    this.setupMonitor = this.setupMonitor.bind( this )
  }

  static get web3() {
    if (!this._web3) {
      this._web3 = new _web3();
    }
    return this._web3;
  }

  setNodeAddress(newNodeAddress) {
    let httpOnly;

    console.log("Attempting connect");

    if (this.connectedOnce && newNodeAddress !== this.lastNodeAddress) {
      this.connectedOnce = false;
    }

    this.lastNodeAddress = newNodeAddress;

    if (this.nextMonitorCall) {
      clearTimeout(this.nextMonitorCall);
      this.nextMonitorCall = null;
    }

    if (newNodeAddress.indexOf("ws") === 0) {
      try {
        this.provider = new _web3.providers.WebsocketProvider(newNodeAddress);
      } catch (e) {
        setTimeout(() => {
          this.emit("connectstatus", ["error"], e);
        }, 1);
        return;
      }
      httpOnly = false;
      this.provider.on("connect", function() {
        console.log("blockchain connected");
        this.connectedOnce = true;
        this.emit("connectstatus", ["connected"], null);
        this.setupMonitor();
      });
    } else {
      this.provider = new _web3.providers.HttpProvider(newNodeAddress);
      httpOnly = true;
    }

    if (!this._web3) {
      let w3 = web3FusionExtensons( new _web3(this.provider) );
      this._web3 = w3;
    } else {
      this._web3.setProvider(this.provider);
    }

    if (httpOnly) {
      // http c
      this._web3.eth
        .getBlockNumber()
        .then(block => {
          this.emit("connectstatus", ["connected", block], null);
          this.setupMonitor();
        })
        .catch(e => {
          console.log( "error web3api connect ", e )
          this.emit("connectstatus", ["error"], e);
        });
      return;
    }

    this.provider.on("error", e => {
      console.error("Blockchain WS Error", e);
      this.emit("connectstatus", ["error"], e);
    });

    this.provider.on("end", e => {
      this._web3 = null;
      console.log(
        "Blockchain disconnected will try to reconnect in 15 seconds"
      );
      setTimeout(() => {
        this.emit("connectstatus", ["disconnected"], null);
        if (this.connectedOnce === true) {
          this.setNodeAddress(newNodeAddress);
        }
      }, 1);
    });
  }

  set walletAddress (address) {
    this._walletAddress = address;
  }

  get walletAddress () {
    return this._walletAddress
  }

  setupMonitor() {
    let walletAddress = this._walletAddress
    this.attempForMonitor += 1;
    let nextMonitorCall = this.attempForMonitor;
    console.log("checking connection ");
    this._web3.eth
      .getBlock("latest")
      .then(block => {
        this.emit("connectstatus", ["stillgood"], false);
        if (this.lastBlock.number != block.number) {
          this.lastBlock = block;
          console.log(block);
          this.emit("latestBlock", block);

          if ( !walletAddress || walletAddress != this._walletAddress ) {
            return true;
          }
          return this._web3.fsn.getAllBalances(walletAddress).then( ( res )=>{
            console.log("all balances", res );
            return res
          }).then( (allBalances) => {
              return this._web3.fsn.allTicketsByAddress(walletAddress).then( (res) => {
                  console.log("all tickets" , res )
                  return { allBalances , allTickets: res }
              })
          }).then( (loadsOfInfo) => {
              return this._web3.fsn.ticketPrice().then( (res)=> {
                return Object.assign( loadsOfInfo , { ticketPrice : res })
              })
          }).then( (loadsOfInfo ) => {
              return this._web3.eth.getGasPrice().then( (gasPrice) => {
                return Object.assign( loadsOfInfo , { gasPrice })
              })
          }).then( (loadsOfInfo) => {
            return this._web3.fsn.totalNumberOfTickets().then( (totalTickets) => {
              return Object.assign( loadsOfInfo , { totalTickets, latestBlock : block  })
            })
          }).then( (loadsOfInfo ) => {
              this.emit( "balanceInfo", loadsOfInfo, false )
          })
        }
      }).then( ( res ) => {
        setTimeout(() => {
          this.setupMonitor();
        }, 5 * 1000);
      })
      .catch(e => {
        console.log("monitor error ", e);
        if (this.attempForMonitor === nextMonitorCall) {
          this.emit("connectstatus", ["error"], e);
          setTimeout(() => {
            this.setupMonitor();
          }, 7 * 1000);
        }
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

export function web3FusionExtensons(web3) {
  if ( !web3._extend ) {
    // simulate the server platform so
    // definitions below can be imported from
    // server unchancged
    web3._extend = web3.extend
  }
  // FsnJS wacom
  web3._extend({
    property: "fsn",
    methods: [
      new web3._extend.Method({
        name: "getBalance",
        call: "fsn_getBalance",
        params: 3,
        inputFormatter: [
          null,
          web3._extend.formatters.inputAddressFormatter,
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "getAllBalances",
        call: "fsn_getAllBalances",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputAddressFormatter,
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "getTimeLockBalance",
        call: "fsn_getTimeLockBalance",
        params: 3,
        inputFormatter: [
          null,
          web3._extend.formatters.inputAddressFormatter,
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "getAllTimeLockBalances",
        call: "fsn_getAllTimeLockBalances",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputAddressFormatter,
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "getNotation",
        call: "fsn_getNotation",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputAddressFormatter,
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "getAddressByNotation",
        call: "fsn_getAddressByNotation",
        params: 2,
        inputFormatter: [
          null,
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "allNotation",
        call: "fsn_allNotation",
        params: 1,
        inputFormatter: [
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "genNotation",
        call: "fsn_genNotation",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputTransactionFormatter,
          null
        ]
      }),
      new web3._extend.Method({
        name: "genAsset",
        call: "fsn_genAsset",
        params: 2,
        inputFormatter: [
          function(options) {
            if (options.name === undefined || !options.name) {
              throw new Error("invalid name");
            }
            if (options.symbol === undefined || !options.symbol) {
              throw new Error("invalid symbol");
            }
            if (
              options.decimals === undefined ||
              options.decimals <= 0 ||
              options.decimals > 255
            ) {
              throw new Error("invalid decimals");
            }
            if (options.total !== undefined) {
              options.total = web3.fromDecimal(options.total);
            }
            return web3._extend.formatters.inputTransactionFormatter(options);
          },
          null
        ]
      }),
      new web3._extend.Method({
        name: "allAssets",
        call: "fsn_allAssets",
        params: 1,
        inputFormatter: [
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "getAsset",
        call: "fsn_getAsset",
        params: 2,
        inputFormatter: [
          null,
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "sendAsset",
        call: "fsn_sendAsset",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputTransactionFormatter,
          null
        ]
      }),
      new web3._extend.Method({
        name: "assetToTimeLock",
        call: "fsn_assetToTimeLock",
        params: 2,
        inputFormatter: [
          function(options) {
            return web3._extend.formatters.inputTransactionFormatter(options);
          },
          null
        ]
      }),
      new web3._extend.Method({
        name: "timeLockToTimeLock",
        call: "fsn_timeLockToTimeLock",
        params: 2,
        inputFormatter: [
          function(options) {
            return web3._extend.formatters.inputTransactionFormatter(options);
          },
          null
        ]
      }),
      new web3._extend.Method({
        name: "timeLockToAsset",
        call: "fsn_timeLockToAsset",
        params: 2,
        inputFormatter: [
          function(options) {
            return web3._extend.formatters.inputTransactionFormatter(options);
          },
          null
        ]
      }),
      new web3._extend.Method({
        name: "allTickets",
        call: "fsn_allTickets",
        params: 1,
        inputFormatter: [
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "allTicketsByAddress",
        call: "fsn_allTicketsByAddress",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputAddressFormatter,
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "totalNumberOfTickets",
        call: "fsn_totalNumberOfTickets",
        params: 1,
        inputFormatter: [
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "totalNumberOfTicketsByAddress",
        call: "fsn_totalNumberOfTicketsByAddress",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputAddressFormatter,
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "ticketPrice",
        call: "fsn_ticketPrice",
        params: 0,
        inputFormatter: []
      }),
      new web3._extend.Method({
        name: "buyTicket",
        call: "fsn_buyTicket",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputTransactionFormatter,
          null
        ]
      }),
      new web3._extend.Method({
        name: "incAsset",
        call: "fsn_incAsset",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputTransactionFormatter,
          null
        ]
      }),
      new web3._extend.Method({
        name: "decAsset",
        call: "fsn_decAsset",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputTransactionFormatter,
          null
        ]
      }),
      new web3._extend.Method({
        name: "allSwaps",
        call: "fsn_allSwaps",
        params: 1,
        inputFormatter: [
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "allSwapsByAddress",
        call: "fsn_allSwapsByAddress",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputAddressFormatter,
          web3._extend.formatters.inputDefaultBlockNumberFormatter
        ]
      }),
      new web3._extend.Method({
        name: "makeSwap",
        call: "fsn_makeSwap",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputTransactionFormatter,
          null
        ]
      }),
      new web3._extend.Method({
        name: "recallSwap",
        call: "fsn_recallSwap",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputTransactionFormatter,
          null
        ]
      }),
      new web3._extend.Method({
        name: "takeSwap",
        call: "fsn_takeSwap",
        params: 2,
        inputFormatter: [
          web3._extend.formatters.inputTransactionFormatter,
          null
        ]
      })
    ]
  });

  // fsntx
  web3._extend({
    property: "fsntx",
    methods: [
      new web3._extend.Method({
        name: "sendRawTransaction",
        call: "fsntx_sendRawTransaction",
        params: 1
      }),
      new web3._extend.Method({
        name: "buildGenNotationTx",
        call: "fsntx_buildGenNotationTx",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "genNotation",
        call: "fsntx_genNotation",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "buildGenAssetTx",
        call: "fsntx_buildGenAssetTx",
        params: 1,
        inputFormatter: [
          function(options) {
            if (options.name === undefined || !options.name) {
              throw new Error("invalid name");
            }
            if (options.symbol === undefined || !options.symbol) {
              throw new Error("invalid symbol");
            }
            if (
              options.decimals === undefined ||
              options.decimals <= 0 ||
              options.decimals > 255
            ) {
              throw new Error("invalid decimals");
            }
            if (options.total !== undefined) {
              options.total = web3.fromDecimal(options.total);
            }
            return web3._extend.formatters.inputTransactionFormatter(options);
          }
        ]
      }),
      new web3._extend.Method({
        name: "genAsset",
        call: "fsntx_genAsset",
        params: 1,
        inputFormatter: [
          function(options) {
            if (options.name === undefined || !options.name) {
              throw new Error("invalid name");
            }
            if (options.symbol === undefined || !options.symbol) {
              throw new Error("invalid symbol");
            }
            if (
              options.decimals === undefined ||
              options.decimals <= 0 ||
              options.decimals > 255
            ) {
              throw new Error("invalid decimals");
            }
            if (options.total !== undefined) {
              options.total = web3.fromDecimal(options.total);
            }
            return web3._extend.formatters.inputTransactionFormatter(options);
          }
        ]
      }),
      new web3._extend.Method({
        name: "buildSendAssetTx",
        call: "fsntx_buildSendAssetTx",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "sendAsset",
        call: "fsntx_sendAsset",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "buildAssetToTimeLockTx",
        call: "fsntx_buildAssetToTimeLockTx",
        params: 1,
        inputFormatter: [
          function(options) {
            return web3._extend.formatters.inputTransactionFormatter(options);
          }
        ]
      }),
      new web3._extend.Method({
        name: "assetToTimeLock",
        call: "fsntx_assetToTimeLock",
        params: 1,
        inputFormatter: [
          function(options) {
            return web3._extend.formatters.inputTransactionFormatter(options);
          }
        ]
      }),
      new web3._extend.Method({
        name: "buildTimeLockToTimeLockTx",
        call: "fsntx_buildTimeLockToTimeLockTx",
        params: 1,
        inputFormatter: [
          function(options) {
            return web3._extend.formatters.inputTransactionFormatter(options);
          }
        ]
      }),
      new web3._extend.Method({
        name: "timeLockToTimeLock",
        call: "fsntx_timeLockToTimeLock",
        params: 1,
        inputFormatter: [
          function(options) {
            return web3._extend.formatters.inputTransactionFormatter(options);
          }
        ]
      }),
      new web3._extend.Method({
        name: "buildTimeLockToAssetTx",
        call: "fsntx_buildTimeLockToAssetTx",
        params: 1,
        inputFormatter: [
          function(options) {
            return web3._extend.formatters.inputTransactionFormatter(options);
          }
        ]
      }),
      new web3._extend.Method({
        name: "timeLockToAsset",
        call: "fsntx_timeLockToAsset",
        params: 1,
        inputFormatter: [
          function(options) {
            return web3._extend.formatters.inputTransactionFormatter(options);
          }
        ]
      }),
      new web3._extend.Method({
        name: "buildBuyTicketTx",
        call: "fsntx_buildBuyTicketTx",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "buyTicket",
        call: "fsntx_buyTicket",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "buildIncAssetTx",
        call: "fsntx_buildIncAssetTx",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "incAsset",
        call: "fsntx_incAsset",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "buildDecAssetTx",
        call: "fsntx_buildDecAssetTx",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "decAsset",
        call: "fsntx_decAsset",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "buildMakeSwapTx",
        call: "fsntx_buildMakeSwapTx",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "makeSwap",
        call: "fsntx_makeSwap",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "buildRecallSwapTx",
        call: "fsntx_buildRecallSwapTx",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "recallSwap",
        call: "fsntx_recallSwap",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "buildTakeSwapTx",
        call: "fsntx_buildTakeSwapTx",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      }),
      new web3._extend.Method({
        name: "takeSwap",
        call: "fsntx_takeSwap",
        params: 1,
        inputFormatter: [web3._extend.formatters.inputTransactionFormatter]
      })
    ]
  });
  return web3;
}

// _web3.eth.filter('latest').watch(function(err,log) {
//     _web3.fsn.buyTicket({from:_web3.fsn.coinbase},password)
// });

//fsn.assetToTimeLock({from:fsn.coinbase,to:fsn.coinbase,asset:"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",start:"0x0",end:"0x1",value:"0x1111111"},"123456")
