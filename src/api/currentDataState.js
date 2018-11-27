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
    rewardsToDate: new BN("678"+"0".repeat(18)),
    lastUpdateTime : new Date(),
    signInfo : {
        address : "0x4A5a7Aa4130e407d3708dE56db9000F059200C62",
    },
    gasPrice : new BN("000053588000000000"),
                     //123456789012345678
    ticketPrice  : new BN("200"+"0".repeat(18)),
    walletBalance : new BN("90122433300000000000000"),
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