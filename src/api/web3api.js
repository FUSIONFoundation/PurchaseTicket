import Web3 from "web3";
import EventEmitter from "events";
import utils from "../utils";
var currentDataState;
var web3FusionExtend = require("web3-fusion-extend");

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
    this._walletAddress = "";
    this.setupMonitor = this.setupMonitor.bind(this);
    this.monitoringBlocks = {};
  }

  setDataStore(dataStore) {
    currentDataState = dataStore;
  }

  get web3() {
    if (!this._web3) {
      this._web3 = web3FusionExtend.extend(new Web3());
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
        this.provider = new Web3.providers.WebsocketProvider(newNodeAddress);
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
        this.mustGetOneBalance = true;
        this.setupMonitor();
      });
    } else {
      this.provider = new Web3.providers.HttpProvider(newNodeAddress);
      httpOnly = true;
    }

    if (!this._web3) {
      let wb = new Web3(this.provider);
      let w3 = web3FusionExtend.extend(wb);
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
      return;
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
    if (address !== this._walletAddress) {
      this._walletAddress = address;
      this.mustGetOneBalance = true;
      currentDataState.data.ticketPurchasing = {};
    }
  }

  get walletAddress() {
    return this._walletAddress;
  }

  startFilterEngine() {
    return; // will be doing soon
    //debugger
    let dt = new Date();
    this.filterEngineOn = dt;

    this.subscriptionFSNCallAddress = this._web3.eth.subscribe(
      "logs",
      {
        address: this._web3.fsn.consts.FSNCallAddress,
        fromBlock: "0x0",
        topics: [this._web3.fsn.consts.FSNCallAddress_Topic_BuyTicketFunc]
      },
      (error, result) => {
        debugger;
        if (!error) {
          //debugger
          if (result.topics.length > 0) {
            let topic = parseInt(result.topics[0].substr(2));
            let callType = this._web3.fsn.consts
              .FSNCallAddress_Topic_To_Function[topic];
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
        if (this.lastBlock.number !== block.number || this.mustGetOneBalance) {
          this.mustGetOneBalance = false;
          this.lastBlock = block;
          console.log(block);
          this.emit("latestBlock", block);

          if (!walletAddress || walletAddress !== this._walletAddress) {
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

  stopTicketPurchase() {
    currentDataState.data.ticketPurchasing.activeTicketPurchase = false;

    if (this.lastTicketCheckTimer) {
      // stop the previous time
      clearTimeout(this.lastTicketCheckTimer);
      currentDataState.data.lastStatus = "Completed";
      currentDataState.data.lastCall = "purchaseCompleted";
      this.emit("purchaseCompleted", currentDataState);
    }
  }

  buyTickets(data) {
    currentDataState.data.ticketPurchasing = data;
    data.purchaseStarted = true;
    data.activeTicketPurchase = true;
    data.ticketsPurchased = 0;
    data.startBlock = this.lastBlock.number;
    data.lastStatus = "";

    if (this.lastTicketCheckTimer) {
      clearTimeout(this.lastTicketCheckTimer);
      this.lastTicketCheckTimer = null;
    }

    let cb;

    let timerFunc = () => {
      this.lastTicketCheckTimer = null;
      if (data.startBlock < this.lastBlock.number) {
        this.purchaseOneTicket(data, cb);
      } else {
        data.lastStatus = "Wait for new block...";
        data.lastCall = "purchaseWaitForNewBlock";
        this.emit("purchaseWaitForNewBlock", data);
        this.lastTicketCheckTimer = setTimeout(timerFunc, 1000);
      }
    };
    timerFunc = timerFunc.bind(this);

    cb = (err, step) => {
      if (!err) {
        data.ticketsPurchased += 1;
      }
      data.lastStatus = step;
      if (
        data.activeTicketPurchase &&
        data.ticketsPurchased < data.ticketQuantity
      ) {
        // schedule another purchase
        if (!err) {
          data.lastStatus = "Purchase next ticket";
        }
        data.lastCall = "purchaseAgain";
        this.emit("purchaseAgain", data);
        this.lastTicketCheckTimer = setTimeout(timerFunc, 1000);
      } else {
        data.lastStatus = "Completed";
        data.activeTicketPurchase = false;
        data.lastCall = "purchaseCompleted";
        this.emit("purchaseCompleted", data);
      }
    };

    cb = cb.bind(this);

    let afterUnlock = ( ret ) => {
      debugger
      this.purchaseOneTicket(data, cb);
    }
    afterUnlock = afterUnlock.bind(this)

    this.freeTicketTimeLockbalances(data, afterUnlock )

    data.lastCall = "purchaseStarted";
    this.emit("purchaseStarted", data);
  }

  unlockNextTimeLock(timelocks, index, cb, data) {
    if (timelocks.length === index || (data && !data.activeTicketPurchase) ) {
      return true;
    }
    let i = timelocks[index];
    let msg = {
      from: this._walletAddress,
      to: this._walletAddress,
      start: "0x" + i.StartTime.toString(16),
      end: "0xffffffffffffffff",
      value: i.Value,
      asset: this._web3.fsn.consts.FSNToken
    };
    return this._web3.fsntx
      .buildTimeLockToAssetTx(msg)
      .then(tx => {
        return this._web3.fsn.signAndTransmit(
          tx,
          currentDataState.data.signInfo.signTransaction
        );
      })
      .then(txHash => {
        console.log("Unlock request sent for 200 Ticket -> ", txHash)
        return this.unlockNextTimeLock(timelocks, index + 1, cb, data);
      })
      .catch(err => {
        console.log(msg);
        console.log(err);
        return this.unlockNextTimeLock(timelocks, index + 1, cb, data);
      });
  }

  freeTicketTimeLockbalances(data, cb ) {
    this._web3.fsn
      .getAllTimeLockBalances(this._walletAddress)
      .then(timelocks => {
        let process = [];
        let fusion = timelocks[this._web3.fsn.consts.FSNToken];
        if (fusion && fusion.Items) {
          let items = fusion.Items;
          for (let i of items) {
            let now = new Date().getTime() / 1000;
            if (
              i.EndTime === this._web3.fsn.consts.TimeForever &&
              i.Value === "200000000000000000000" &&
              i.StartTime < now
            ) {
              process.push(i);
            }
          }
        }
        
        if (process.length) {
          return this.unlockNextTimeLock(process, 0, cb, data).then( (ret) => {
            if (cb) {
              cb(null, data);
            }
            return true
          })
        } else {
          if (cb) {
            cb(null, data);
          }
          return true;
        }
      })
      .catch(err => {
        if (cb) {
          cb(err, data);
        }
      });
  }

  purchaseOneTicket(data, cb) {
    this._web3.fsntx
      .buildBuyTicketTx({ from: this._walletAddress })
      .then(tx => {
        // tx.gasLimit =  this._web3.utils.toWei( 21000, "gwei" )
        return this._web3.fsn.signAndTransmit(
          tx,
          currentDataState.data.signInfo.signTransaction
        );
      })
      .then(txHash => {
        if (!data.activeTicketPurchase) {
          cb(null, "asked to leave");
          return true;
        }
        data.lastStatus = "Pending Tx:" + utils.midHashDisplay(txHash);
        data.lastCall = "purchaseSubmitTicket";
        this.emit("purchaseSubmitTicket", data);
        return this.waitForTransactionToComplete(txHash, data)
          .then(r => {
            if (r.status) {
              cb(null, "Ticket bought");
            } else {
              cb(new Error("failed to buy"), "Failed to buy ticket will retry");
            }
          })
          .catch(err => {
            cb(err, "Error waiting for ticket to complete");
          });
      })
      .catch(err => {
        cb(err, "unknown err");
      });
  }

  waitForTransactionToComplete(transID, data) {
    return this._web3.eth
      .getTransactionReceipt(transID)
      .then(receipt => {
        if (!receipt) {
          // assume not scheduled yet
          if (!data.activeTicketPurchase) {
            throw Error("asked to stop purchasing");
          }
          return this.waitForTransactionToComplete(transID, data);
        }
        return receipt;
      })
      .catch(err => {
        throw err;
      });
  }
}

// _web3.eth.filter('latest').watch(function(err,log) {
//     _web3.fsn.buyTicket({from:_web3.fsn.coinbase},password)
// });

//fsn.assetToTimeLock({from:fsn.coinbase,to:fsn.coinbase,asset:"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",start:"0x0",end:"0x1",value:"0x1111111"},"123456")
