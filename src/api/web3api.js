import _web3 from "web3";
import EventEmitter from "events";
import currentDataState from "./currentDataState";

// _web3.setProvider(new _web3.providers.HttpProvider("http://localhost:5488"));

/**
 *   a helper api component that enables monitoring
 *   and keep of a alive of an end point
 *
 */
export default class web3Api {
  /**
   * Initiate the web3 api handler
   */
  constructor() {
    this.eventEmitter = new EventEmitter();
    this._web3 = null;
    this.provider = null;
    this.connectedOnce = false;
    this.lastNodeAddress = "";
    this.attempForMonitor = 0;
    this.lastBlock = {};
    this.walletAddress = "";
    this.setupMonitor = this.setupMonitor.bind(this);
    this.monitoringBlocks = {};
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

    if (this.subscriptionFSNCallAddress) {
      this.subscriptionFSNCallAddress.unsubscribe(a => {});
      this.subscriptionFSNCallAddress = null;
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
      this.provider.on("connect", () => {
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
      let w3 = web3FusionExtensons(new _web3(this.provider));
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
          console.log("error web3api connect ", e);
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

  getBlock(add, blockNumberToDisplay, lastestBlockListener) {
    let bl = this.monitoringBlocks[blockNumberToDisplay];
    let valid = bl ? (Object.keys(bl).length > 1 ? true : false) : false;

    if (add) {
      this.on("block" + blockNumberToDisplay, lastestBlockListener);
    } else {
      this.removeEventListener(
        "block" + blockNumberToDisplay,
        lastestBlockListener
      );
    }
    if (valid) {
      lastestBlockListener(bl);
      return
    } else {
      this.monitoringBlocks[bl] = { getting: true };
    }

    this._web3.eth
      .getBlock(blockNumberToDisplay)
      .then(block => {
        this.monitoringBlocks[blockNumberToDisplay] = block;
        this.emit("block" + blockNumberToDisplay, block);
      })
      .catch(err => {
        this.monitoringBlocks[blockNumberToDisplay] = {
          error: true,
          errObject: err
        };
        this.emit(
          "block" + blockNumberToDisplay,
          this.monitoringBlocks[blockNumberToDisplay]
        );
      });
  }

  set walletAddress(address) {
    this._walletAddress = address;
  }

  get walletAddress() {
    return this._walletAddress;
  }

  startFilterEngine() {
    //debugger
    let dt = new Date();
    this.filterEngineOn = dt;

    this.subscriptionFSNCallAddress = this._web3.eth.subscribe(
      "logs",
      {
        address: FSNCallAddress,
        fromBlock: "0x0",
        topics: [FSNCallAddress_Topic_BuyTicketFunc]
      },
      (error, result) => {
        // debugger
        if (!error) {
          //debugger
          if (result.topics.length > 0) {
            let topic = parseInt(result.topics[0].substr(2));
            let callType = FSNCallAddress_Topic_To_Function[topic];
            console.log(callType, result);
            this._web3.eth.getTransaction(result.transactionHash, (err, tx) => {
              console.log("tx", err, tx);
              if (!err) {
                if (tx.from === currentDataState.data.signInfo.address) {
                  console.log("got a ticket ");
                }
              }
            });

            //if ( )
          }
        }
      }
    );
  }

  setupMonitor() {
    if (!this.subscriptionFSNCallAddress) {
      this.startFilterEngine();
    }
    let walletAddress = this._walletAddress;
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

          if (!walletAddress || walletAddress != this._walletAddress) {
            return true;
          }
          return this._web3.fsn
            .getAllBalances(walletAddress)
            .then(res => {
              console.log("all balances", res);
              return res;
            })
            .then(allBalances => {
              return this._web3.fsn
                .allTicketsByAddress(walletAddress)
                .then(res => {
                  console.log("all tickets", res);
                  return { allBalances, allTickets: res };
                });
            })
            .then(loadsOfInfo => {
              return this._web3.fsn.ticketPrice().then(res => {
                return Object.assign(loadsOfInfo, { ticketPrice: res });
              });
            })
            .then(loadsOfInfo => {
              return this._web3.eth.getGasPrice().then(gasPrice => {
                return Object.assign(loadsOfInfo, { gasPrice });
              });
            })
            .then(loadsOfInfo => {
              return this._web3.fsn
                .totalNumberOfTickets()
                .then(totalTickets => {
                  return Object.assign(loadsOfInfo, {
                    totalTickets,
                    latestBlock: block
                  });
                });
            })
            .then(loadsOfInfo => {
              this.emit("balanceInfo", loadsOfInfo, false);
            });
        }
      })
      .then(res => {
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

export const TicketLogAddress = "0xfffffffffffffffffffffffffffffffffffffffe";

const TicketLogAddress_Topic_To_Function = {
  0: "ticketSelected",
  1: "ticketReturn",
  2: "ticketExpired"
};

export const TicketLogAddress_Topic_ticketSelected =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const TicketLogAddress_Topic_ticketReturn =
  "0x0000000000000000000000000000000000000000000000000000000000000001";
export const TicketLogAddress_Topic_ticketExpired =
  "0x0000000000000000000000000000000000000000000000000000000000000002";

export const FSNCallAddress = "0xffffffffffffffffffffffffffffffffffffffff";

const FSNCallAddress_Topic_To_Function = {
  // GenNotationFunc wacom
  0: "GenNotationFunc", // = iota
  // GenAssetFunc wacom
  1: "GenAssetFunc",
  // SendAssetFunc wacom
  2: "SendAssetFunc",
  // TimeLockFunc wacom
  3: "TimeLockFunc",
  // BuyTicketFunc wacom
  4: "BuyTicketFunc",
  // AssetValueChangeFunc wacom
  5: "AssetValueChangeFunc",
  // MakeSwapFunc wacom
  6: "MakeSwapFunc",
  // RecallSwapFunc wacom
  7: "RecallSwapFunc",
  // TakeSwapFunc wacom
  8: "TakeSwapFunc"
};

export const FSNCallAddress_Topic_GenNotationFunc =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const FSNCallAddress_Topic_GenAssetFunc =
  "0x0000000000000000000000000000000000000000000000000000000000000001";
export const FSNCallAddress_Topic_SendAssetFunc =
  "0x0000000000000000000000000000000000000000000000000000000000000002";
export const FSNCallAddress_Topic_TimeLockFunc =
  "0x0000000000000000000000000000000000000000000000000000000000000003";
export const FSNCallAddress_Topic_BuyTicketFunc =
  "0x0000000000000000000000000000000000000000000000000000000000000004";
export const FSNCallAddress_Topic_AssetValueChangeFunc =
  "0x0000000000000000000000000000000000000000000000000000000000000005";
export const FSNCallAddress_Topic_MakeSwapFunc =
  "0x0000000000000000000000000000000000000000000000000000000000000006";
export const FSNCallAddress_Topic_RecallSwapFunc =
  "0x0000000000000000000000000000000000000000000000000000000000000007";
export const FSNCallAddress_Topic_TakeSwapFunc =
  "0x0000000000000000000000000000000000000000000000000000000000000008";

export function web3FusionExtensons(web3) {
  if (!web3._extend) {
    // simulate the server platform so
    // definitions below can be imported from
    // server unchancged
    web3._extend = web3.extend;
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
