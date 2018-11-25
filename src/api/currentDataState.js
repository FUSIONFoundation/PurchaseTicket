import moment from 'moment'

import web3 from './index.js'
var BN = web3.utils.BN;

var datablock = {
    accountUnlocked : true,
    autoBuyOn: false,
    balanceOfFSN: 0,
    numberOfTicketsToPurchase : 0,
    numberOfTickets: 50,
    autoBuy: false,
    autoReinvestReward: false,
    probablity: 0.23,
    totalTickets: 900,
    rewardsToDate: 678,
    lastUpdateTime : new Date(),
    signInfo : {
        address : "0x4A5a7Aa4130e407d3708dE56db9000F059200C62",
    },
    gasPriceString : "0.00053588",
    gasPrice : new BN("000535880000000000"),
    ticketPrice  : new BN("200"+"0".repeat(18)),
    ticketPriceString : "200",
    walletBalance : new BN("140122433300000000000000"),
    walletBalanceText : "140122.4333",
    autoBuyStopTime : moment( "20190214", "YYYYMMDD"),
    lastTicketExpires : moment(  "20190101", "YYYYMMDD")
};

console.log("WE" , datablock.walletBalance.toString() )

export default class currentDataState
{
    static get data() {
        return datablock
    }
}