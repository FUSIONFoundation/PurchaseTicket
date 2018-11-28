import moment from "moment";

import web3api from "./web3api.js";
let web3interface = new web3api();

var BN = web3api.web3.utils.BN;

var datablock = {
  web3api: web3interface,
  BN,
  accountUnlocked: true,
  autoBuyOn: false,
  balanceOfFSN: 0,
  numberOfTicketsToPurchase: 0,
  numberOfTickets: 50,
  autoBuy: false,
  autoReinvestReward: false,
  probablity: 0.23,
  totalTickets: 900,
  rewardsToDate: new BN("678" + "0".repeat(18)),
  lastUpdateTime: new Date(),
  signInfo: {
    address: "0x4A5a7Aa4130e407d3708dE56db9000F059200C62"
  },
  gasPrice: new BN("0"),
  //123456789012345678
  ticketPrice: new BN("200" + "0".repeat(18)),
  walletBalance: new BN("0"),
  autoBuyStopTime: moment("20190214", "YYYYMMDD"),
  lastTicketExpires: moment("20190101", "YYYYMMDD")
};

console.log("WE", datablock.walletBalance.toString());

export default class currentDataState {
  static get BN() {
    return BN;
  }
  static get web3api() {
    return web3interface;
  }
  static get data() {
    return datablock;
  }

  static setBalanceInfo( balanceInfo ) {
      console.log( "balance info ",  balanceInfo )
      if (balanceInfo.ticketPrice) {
        datablock.ticketPrice = new BN( balanceInfo.ticketPrice )
      }
      if ( balanceInfo.allBalances ) {
          datablock.walletBalance = new BN( balanceInfo.allBalances["0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"])
      }
      if ( balanceInfo.gasPrice ) {
          datablock.gasPrice = new BN( balanceInfo.gasPrice )
      }
  }
}
