import moment from 'moment'

export default class currentDataState
{
    static get data() {
        return {
            accountUnlocked : false,
            autoBuyOn: true,
            walletAddress: "0x",
            balanceOfFSN: 0,
            numberOfTickets: 50,
            autoBuy: false,
            autoReinvestReward: false,
            probablity: 0.23,
            totalTickets: 900,
            rewardsToDate: 678,
            lastUpdateTime : new Date(),
            walletAddress : "0x3f99Fa1d008a658A0F51D94570bCEa2fd8dBDd3B",
            ticketPrice  : 200,
            walletBalance : 140122.4333,
            autoBuyStopTime : moment( "20190214", "YYYYMMDD"),
            lastTicketExpires : moment(  "20190101", "YYYYMMDD")
        };
    }
}