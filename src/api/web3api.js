import Web3 from "web3";
import EventEmitter from "events";
import utils from "../utils";
var currentDataState;
var web3FusionExtend = require("web3-fusion-extend");
const rp = require("request-promise");

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
    let provider;

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
      let onHandle = () => {
        console.log("blockchain connected");
        this.connectedOnce = true;
        provider.__connected = true;
        this.emit("connectstatus", ["connected"], null);
        this.mustGetOneBalance = true;
        this.setupMonitor();
      };
      onHandle = onHandle.bind(this);
      try {
        provider = new Web3.providers.WebsocketProvider(newNodeAddress, {timeout : 10000 });
      } catch (e) {
        setTimeout(() => {
          this.emit("connectstatus", ["error"], e);
        }, 1);
        return;
      }
      httpOnly = false;
      provider.on("connect", onHandle);
    } else {
      provider = new Web3.providers.HttpProvider(newNodeAddress);
      httpOnly = true;
    }

    if (httpOnly) {
      let wb = new Web3(provider);
      let w3 = web3FusionExtend.extend(wb);
      this._web3 = w3;

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
      provider.__connected = true;
      this.provider = provider;
      return;
    }

    let resetInfo = {};

    let errorHandler = e => {
      if ( !provider || provider.__ignoreNotifications) {
        // debugger
        return
      }
      console.error("Blockchain WS Error", e);
      this.emit("connectstatus", ["error"], e);
      if (!resetInfo.resetConnection) {
        this._web3 = null;
        resetInfo.resetConnection = true;
        this.provider.disconnect();
        this.provider = null;
        provider.__connected = false;
        setTimeout(() => {
          this.emit("connectstatus", ["disconnected"], null);
          if (this.connectedOnce === true) {
            this.setNodeAddress(newNodeAddress);
          }
        }, 500);
      }
    };

    errorHandler = errorHandler.bind(this);

    provider.on("error", errorHandler);

    let disconnectHandler = () => {
      if ( !provider || provider.__ignoreNotifications) {
        // debugger
        return
      }
      console.log("Blockchain disconnected will try to reconnect");
      this.emit("connectstatus", ["error"], new Error("disconnected"));
      if (!resetInfo.resetConnection) {
        provider.disconnect();
        this._web3 = null;
        this.provider = null;
        provider.__connected = false;
        resetInfo.resetConnection = true;
        setTimeout(() => {
          this.emit("connectstatus", ["disconnected"], null);
          if (this.connectedOnce === true) {
            this.setNodeAddress(newNodeAddress);
          }
        }, 500);
      }
    };

    disconnectHandler = disconnectHandler.bind(this);

    provider.on("end", disconnectHandler);

    if ( this.provider ) {
      if ( this.previousProvider ) {
        this.previousProvider.__ignoreNotifications = true
        try {
          this.previousProvider.disconnect()
        } catch (e) {}
      }
      this.previousProvider = this.provider
    }

    this.provider = provider;
    let wb = new Web3(provider);
    let w3 = web3FusionExtend.extend(wb);
    this._web3 = w3;
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
      currentDataState.data.rewardsToDate = "-";
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

  checkConnection() {
    if (!this._web3 || !this.provider || !this.provider.__connected) {
      this.emit("connectstatus", ["error"], new Error("no connection"));
      throw new Error("disconnected");
    }
  }

  setupMonitor() {
    if (!this._web3 || !this.provider || !this.provider.__connected) {
      // reconnecting need to wait
      this.emit("connectstatus", ["error"], new Error("no connection"));
      setTimeout(() => {
        this.setupMonitor();
      }, 4 * 1000);
      return;
    }
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
        if ( !block ) {
          throw new Error("no block")
        }
        // console.log("c1")        
        this.emit("connectstatus", ["stillgood"], false);
        this.checkConnection();
        if (this.lastBlock.number !== block.number || this.mustGetOneBalance) {
          this.mustGetOneBalance = false;
          this.lastBlock = block;
          //console.log(block);
          this.emit("latestBlock", block);

          if (!walletAddress || walletAddress !== this._walletAddress) {
            return true;
          }
          //console.log("c2") 
          this.checkConnection();
          return this._web3.fsn
            .getAllBalances(walletAddress)
            .then(res => {
              //console.log("all balances", res);
              return res;
            })
            .then(allBalances => {
              this.checkConnection();
              // console.log("c3") 
              return this._web3.fsn
                .getAllTimeLockBalances(this._walletAddress)
                .then(timelocks => {
                  let timelockUsableBalance = new currentDataState.BN(0);
                  let fusion = timelocks[this._web3.fsn.consts.FSNToken];
                  // debugger
                  if (fusion && fusion.Items) {
                    let items = fusion.Items;

                    for (let i of items) {
                      let start = new Date().getTime() / 1000;
                      let end = new Date().getTime() / 1000 + 60 * 60 * 24 * 30;
                      if (
                        (i.EndTime >= end ||
                          i.EndTime === this._web3.fsn.consts.TimeForever) &&
                        i.StartTime < start
                      ) {
                        timelockUsableBalance = timelockUsableBalance.add(
                          new currentDataState.BN(i.Value)
                        );
                      }
                    }
                  }
                  this.checkConnection();
                  //console.log("c4") 
                  return this._web3.fsn
                    .allTicketsByAddress(walletAddress)
                    .then(res => {
                      //console.log("all tickets", res);
                      console.log("c5") 
                      return {
                        allBalances,
                        allTickets: res,
                        timelockUsableBalance
                      };
                    });
                });
            })
            .then(loadsOfInfo => {
              //console.log("c6") 
              this.checkConnection();
              return this._web3.fsn.ticketPrice().then(res => {
                return Object.assign(loadsOfInfo, { ticketPrice: res });
              });
            })
            .then(loadsOfInfo => {
              this.checkConnection();
              //console.log("c7") 
              return this._web3.eth.getGasPrice().then(gasPrice => {
                return Object.assign(loadsOfInfo, { gasPrice });
              });
            })
            .then(loadsOfInfo => {
              //console.log("c8") 
              this.checkConnection();
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
              //console.log("c9") 
              const requestOptions = {
                method: "GET",
                uri:
                  "https://api.fusionnetwork.io/balances/" +
                  this._walletAddress,
                qs: {},
                headers: {},
                json: true,
                gzip: true
              };

              return rp(requestOptions)
                .then(response => {
                  if (Array.isArray(response) && response.length > 0) {
                    return Object.assign(loadsOfInfo, {
                      rewardEarn: response[0].rewardEarn
                    });
                  }
                  return loadsOfInfo;
                })
                .catch(err => {
                  //console.log("can't get balance", err);
                  return loadsOfInfo;
                });
            })
            .then(loadsOfInfo => {
              //console.log("c10") 
              this.emit("balanceInfo", loadsOfInfo, false);
            });
        }
      })
      .then(res => {
        //console.log("c11") 
        setTimeout(() => {
          this.setupMonitor();
        }, 4 * 1000);
      })
      .catch(e => {
        //console.log("monitor error ", e);
        if (this.attempForMonitor === nextMonitorCall) {
          this.emit("connectstatus", ["error"], e);
          setTimeout(() => {
            this.setupMonitor();
          }, 7 * 1000);
        }
      }
    )
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
    let originalData = Object.assign(data, { original: true });
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
      if (data.autoBuyStopDate) {
        let stopTime = data.date.getTime();
        let now = new Date().getTime();
        if (stopTime < now) {
          data.lastStatus = "Completed";
          data.lastCall = "purchaseCompleted";
          data.activeTicketPurchase = false;
          this.emit("purchaseCompleted", data);
          return;
        }
      }

      if (
        data.autoBuyTickets &&
        data.ticketQuantity < currentDataState.data.numberOfTickets
      ) {
        data.lastStatus = "Waiting for ticket level to drop...";
        data.lastCall = "purchaseWaitForNewBlock";
        this.emit("purchaseWaitForNewBlock", data);
        this.lastTicketCheckTimer = setTimeout(timerFunc, 1000);
      } else if (data.startBlock < this.lastBlock.number) {
        this.purchaseOneTicket(data, cb);
      } else {
        data.lastStatus = "Waiting for new block...";
        data.lastCall = "purchaseWaitForNewBlock";
        this.emit("purchaseWaitForNewBlock", data);
        this.lastTicketCheckTimer = setTimeout(timerFunc, 1000);
      }
    };
    timerFunc = timerFunc.bind(this);

    cb = (err, step) => {
      setTimeout(() => {
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
          if (data.activeTicketPurchase && data.autoBuyTickets) {
            this.buyTickets(originalData);
            return;
          }
          data.lastStatus = "Completed";
          data.lastCall = "purchaseCompleted";
          data.activeTicketPurchase = false;
          this.emit("purchaseCompleted", data);
        }
      }, 10);
    };

    cb = cb.bind(this);

    let afterUnlock = ret => {
      if (
        data.autoBuyTickets &&
        data.ticketQuantity < currentDataState.data.numberOfTickets
      ) {
        data.lastStatus = "Waiting for ticket level to drop...";
        data.lastCall = "purchaseWaitForNewBlock";
        this.emit("purchaseWaitForNewBlock", data);
        this.lastTicketCheckTimer = setTimeout(timerFunc, 1000);
      } else {
        this.purchaseOneTicket(data, cb);
      }
    };
    afterUnlock = afterUnlock.bind(this);

    this.freeTicketTimeLockbalances(data, afterUnlock);

    data.lastCall = "purchaseStarted";
    this.emit("purchaseStarted", data);
  }

  unlockNextTimeLock(timelocks, index, cb, data) {
    if (timelocks.length === index || (data && !data.activeTicketPurchase)) {
      return true;
    }
    let i = timelocks[index];
    let msg = {
      from: this._walletAddress,
      to: this._walletAddress,
      start: "0x" + i.StartTime.toString(16),
      end: this._web3.fsn.consts.TimeForeverStr,
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
        console.log("Unlock request sent for 200 Ticket -> ", txHash);
        return this.unlockNextTimeLock(timelocks, index + 1, cb, data);
      })
      .catch(err => {
        console.log(msg);
        console.log(err);
        return this.unlockNextTimeLock(timelocks, index + 1, cb, data);
      });
  }

  freeTicketTimeLockbalances(data, cb) {
    return cb(null, data);
    // this._web3.fsn
    //   .getAllTimeLockBalances(this._walletAddress)
    //   .then(timelocks => {
    //     let process = [];
    //     let fusion = timelocks[this._web3.fsn.consts.FSNToken];
    //     if (fusion && fusion.Items) {
    //       let items = fusion.Items;

    //       for (let i of items) {
    //         let now = new Date().getTime() / 1000;
    //         if (
    //           i.EndTime === this._web3.fsn.consts.TimeForever &&
    //           i.Value === "200000000000000000000" &&
    //           i.StartTime < now
    //         ) {
    //           console.log("adding time lock balance to unlock");
    //           process.push(i);
    //         }
    //       }
    //     }
    //     process = []; // turn it off for now
    //     if (process.length) {
    //       return this.unlockNextTimeLock(process, 0, cb, data).then(ret => {
    //         if (cb) {
    //           cb(null, data);
    //         }
    //         return true;
    //       });
    //     } else {
    //       if (cb) {
    //         cb(null, data);
    //       }
    //       return true;
    //     }
    //   })
    //   .catch(err => {
    //     if (cb) {
    //       cb(err, data);
    //     }
    //   });
  }

  purchaseOneTicket(data, cb) {
    if (!this._web3 || !this.provider || !this.provider.__connected) {
      // reconnecting need to wait
      cb(new Error("reconnecting"), "reconnecting");
      return;
    }
    let days = data.daysQuantity;
    if (isNaN(days) || days < 21 || days > 100) {
      days = 30;
    }
    let now = Math.floor(new Date().getTime() / 1000);
    now += 60 * 60 * 24 * days;
    let dayHex = "0x" + now.toString(16);

    this._web3.fsntx
      .buildBuyTicketTx({ from: this._walletAddress, end: dayHex })
      .then(tx => {
        console.log(tx);
        // tx.gasLimit =  this._web3.utils.toWei( 21000, "gwei" )
        if (!this._web3 || !this.provider || !this.provider.__connected) {
          // reconnecting need to wait
          cb(new Error("reconnecting"), "reconnecting");
          return;
        }
        return this._web3.fsn.signAndTransmit(
          tx,
          currentDataState.data.signInfo.signTransaction
        );
      })
      .then(txHash => {
        console.log("buy ticket tx -> ", txHash);
        if (!data.activeTicketPurchase) {
          cb(null, "asked to leave");
          return true;
        }
        data.lastStatus = "Pending Tx:" + utils.midHashDisplay(txHash);
        data.lastCall = "purchaseSubmitTicket";
        this.emit("purchaseSubmitTicket", data);
        this.checkConnection();
        return this.waitForTransactionToComplete(
          txHash,
          data,
          new Date().getTime() + 120000
        )
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
        console.log(err)
        cb(err, "unknown err");
      });
  }

  waitForTransactionToComplete(transID, data, maxWaitTime) {
    if (!this._web3 || !this.provider || !this.provider.__connected) {
      // reconnecting need to wait
      throw new Error("reconnecting");
      return;
    }
    if (!data.activeTicketPurchase) {
      return true;
    }
    let now = (new Date()).getTime()
    //console.log( maxWaitTime , now )
    if (maxWaitTime < now ) {
      // a long time has past
      // assume that transaction is lost
      // or network is backlogged
      // continue on
      // console.log("too much time leaving");
      throw new Error("Error waiting for ticket to complete, timed out");
      return true;
    }
    // console.log("GTR E")
    return this._web3.eth
      .getTransactionReceipt(transID)
      .then(receipt => {
        //console.log("GTR L")
        if (!receipt) {
          // assume not scheduled yet
          if (!data.activeTicketPurchase) {
            throw Error("asked to stop purchasing");
          }
          return this.waitForTransactionToComplete(transID, data, maxWaitTime);
        }
        return receipt;
      })
      .catch(err => {
        // console.log("GTR L")
        throw err;
      });
  }
}

// _web3.eth.filter('latest').watch(function(err,log) {
//     _web3.fsn.buyTicket({from:_web3.fsn.coinbase},password)
// });

//fsn.assetToTimeLock({from:fsn.coinbase,to:fsn.coinbase,asset:"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",start:"0x0",end:"0x1",value:"0x1111111"},"123456")
