import moment from 'moment'

var datablock = {
    accountUnlocked : false,
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
        walletAddress : "0x.....",
    },
    ticketPrice  : 200,
    walletBalance : 140122.4333,
    autoBuyStopTime : moment( "20190214", "YYYYMMDD"),
    lastTicketExpires : moment(  "20190101", "YYYYMMDD")
};

export default class currentDataState
{
    static get data() {
        return datablock
    }
}