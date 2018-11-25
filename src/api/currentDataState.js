import moment from 'moment'

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
    gasPrice : " 0.00053588",
    ticketPrice  : 200,
    ticketPriceString : "200",
    walletBalance : 140122.4333,
    walletBalanceText : "140122.4333",
    autoBuyStopTime : moment( "20190214", "YYYYMMDD"),
    lastTicketExpires : moment(  "20190101", "YYYYMMDD")
};

export default class currentDataState
{
    static get data() {
        return datablock
    }
}