import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Clipboard,
  TouchableOpacity
} from "react-native";

import "../App.css";
import history from "../history.js";
import colors from "./colors";
import constants from "./constants";
import utils from "../utils";
import moment from "moment";
import currentDataState from "../api/currentDataState";
import BlockDisplayer from "./BlockDisplayer";
var BN = currentDataState.BN;

var lineGraph = require("../images/lineGraph.svg");
var closebutton = require("../images/times.svg");

var styles;

class Status extends Component {
  // this is what i use for production
  state = { paintKey: 0, ticketDisplayOn: false, lastTicketStatus : "" , ticketStop : false };

  constructor(props) {
    super();
    this.balanceListener = this.balanceListener.bind(this);
    this.purchaseTikStatus = this.purchaseTikStatus.bind(this)
  }

  totalStake(data) {
    return data.ticketPrice.mul(new BN(data.numberOfTickets));
  }

  balanceListener(balanceInfo) {
    currentDataState.setBalanceInfo(balanceInfo);
    this.setState({ paintKey: this.state.paintKey + 1 });
  }

  purchaseTikStatus(data) {
    this.setState( { lastTicketStatus : data.lastCall, ticketStop : false })
  }

  componentDidMount() {
    currentDataState.web3api.on("balanceInfo", this.balanceListener);
    currentDataState.web3api.on("purchaseAgain", this.purchaseTikStatus )
    currentDataState.web3api.on("purchaseCompleted", this.purchaseTikStatus )
    currentDataState.web3api.on("purchaseStarted", this.purchaseTikStatus )
    currentDataState.web3api.on("purchaseWaitForNewBlock", this.purchaseTikStatus )
    currentDataState.web3api.on("purchaseSubmitTicket", this.purchaseTikStatus )
  }

  componentWillUnmount() {
    currentDataState.web3api.removeEventListener(
      "balanceInfo",
      this.balanceListener
    );
    currentDataState.web3api.removeEventListener("purchaseAgain", this.purchaseTikStatus )
    currentDataState.web3api.removeEventListener("purchaseCompleted", this.purchaseTikStatus )
    currentDataState.web3api.removeEventListener("purchaseStarted", this.purchaseTikStatus )
    currentDataState.web3api.removeEventListener("purchaseWaitForNewBlock", this.purchaseTikStatus )
    currentDataState.web3api.removeEventListener("purchaseSubmitTicket", this.purchaseTikStatus )
  }

  render() {
    let data = currentDataState.data;

    if (!BN) {
      BN = currentDataState.BN;
    }

    if (data.accountUnlocked) {
      data.web3api.walletAddress = data.signInfo.address;
    }

    let rewardNumber = utils.formatWei(data.rewardsToDate);
    let ticketText = data.totalTickets === 1 ? "Ticket" : "Tickets";
    let rewardStyle;
    let textNumberOfRewardsGivenType;
    if (rewardNumber.length < 4) {
      rewardStyle = styles.textNumberOfRewardsGiven;
      textNumberOfRewardsGivenType = styles.textNumberOfRewardsGivenType;
    } else {
      textNumberOfRewardsGivenType = styles.textNumberOfRewardsGivenTypeSmaller;
      rewardStyle = styles.textNumberOfRewardsGivenSmaller;
    }

    let displayPercent =
      data.totalTickets > 0
        ? utils.displayPercent(data.numberOfTickets / data.totalTickets)
        : "0.00";

    if (displayPercent === "0.00" && data.numberOfTickets > 0) {
      displayPercent = "< 0.01";
    }

    let dt = new moment(data.lastUpdateTime);

    let ticketPurchaseStatus
    let ticketStatus = currentDataState.data.ticketPurchasing
    if ( ticketStatus === undefined ) {
      ticketStatus = { activeTicketPurchase : false }
    }
    let msg = ticketStatus.lastStatus

    if ( ticketStatus.activeTicketPurchase ) {
        let widgetWidth = 224
        let widgetHeight = 20
   
        let width = parseInt( widgetWidth * (ticketStatus.ticketsPurchased )/ ticketStatus.ticketQuantity )
        ticketPurchaseStatus = ( <View key="ticketPurchaseView" style={{width:widgetWidth, height:  24 , alignItems : 'flex-start', justifyContent : 'flex-start'}}>
            <View style={{width:200, height:  widgetHeight }}>
                <View style={{width:widgetWidth,height:widgetHeight,backgroundColor:'transparent', position :'absolute' , 
                              top : 0 , left : 0, borderWidth : 1, borderColor : colors.orderGrey,  borderRadius: 3 }}/>
                <View style={{width:width,height:widgetHeight,backgroundColor:colors.successGreen, position :'absolute' , 
                              top : 0 , left : 0, borderWidth : 1, borderColor : 'transparent',  borderRadius: 3 }}/>
              <Text  style={[styles.labelLineText,{width:widgetWidth, 
                              height : widgetHeight, position :'absolute' , textAlign : 'center',
                              top : 4 , left : 0}]}>{`${ticketStatus.ticketsPurchased+1} of ${ticketStatus.ticketQuantity}`}</Text>
            </View>
            <Text  style={[styles.labelLineText,{width:widgetWidth, marginTop : 4}]}>{msg}</Text>
        </View>)
    }


    let dtDisplay = dt.toString(); // dt.format("YYYY-MM-DD HH:mm:ss.SSS z");

    if (!data.accountUnlocked) {
      return (
        <View style={{ padding: 15 }}>
          <Text style={styles.Auto_Buy_Stake_Monit}>
            You Account Must be unlocked to use this screen.
          </Text>
          <TouchableOpacity
            style={{ width: 100 }}
            onPress={() => {
              history.push("/UnlockAccount");
            }}
          >
            <Text style={styles.activeButton}>Select An Account</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (this.state.ticketDisplayOn) {
      let tickets = Object.keys(data.allTickets ? data.allTickets : {});

      let ticketViews = [];

      for (let ticket of tickets) {
        let t = data.allTickets[ticket];
        let dt = moment(new Date(t.ExpireTime*1000));
        let txt = dt.format("L LT z");
        ticketViews.push(
          <View key={"" + t.ExpireTime}>
            <View style={styles.ticketDetailRow}>
              <Text style={[styles.labelLineText, { width: 120 }]}>{txt}</Text>
              <Text
                style={[
                  styles.labelLineText,
                  { textAlign: "center", width: 60 }
                ]}
              >
                {utils.formatWei(data.ticketPrice)}
              </Text>
              <Text
                style={[
                  styles.labelLineText,
                  { textAlign: "right", width: 366, fontSize: 10 }
                ]}
              >
                {t.ID}
              </Text>
            </View>
            <View style={styles.orderBorder} />
          </View>
        );
      }

      return (
        <View style={styles.container}>
          <View>
            <View style={styles.stakeDetailBox}>
              <View style={styles.stakeDetailRow}>
                <Text style={styles.stakeDetailText}>
                  Ticket Details
                  <Text style={styles.dateValue}>
                    {"  " +
                      data.numberOfTickets +
                      (data.numberOfTickets === 1 ? " Ticket" : " Tickets")}
                  </Text>
                </Text>
              </View>
              <View style={styles.ticketDetailRow}>
                <Text style={[styles.labelLineText, { width: 120 }]}>
                  Expiration Time
                </Text>
                <Text style={[styles.labelLineText, { width: 80 }]}>
                  Ticket Price
                </Text>
                <Text
                  style={[
                    styles.labelLineText,
                    { textAlign: "right", width: 340 }
                  ]}
                >
                  Ticket Hash
                </Text>
                <View />
              </View>
              <View style={styles.orderBorder} />
              {ticketViews}
            </View>
            <TouchableOpacity
              onPress={() => {
                this.setState({ ticketDisplayOn: false });
              }}
              style={styles.closeButton}
            >
              <Image
                resizeMode="contain"
                source={closebutton}
                style={{width:14, height : 14}}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    
   
    return (
      <View style={{ marginLeft: 30, backgroundColor: colors.backgroundGrey }}>
        <View style={styles.container}>
          <View style={styles.titleBox}>
            <Text style={styles.Auto_Buy_Stake_Monit}>
              Auto Buy Stake Monitor
            </Text>
            <TouchableOpacity>
              <Text style={styles.lastUpdated}>
                {`Last Updated: ${dtDisplay}`}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.walletBox}>
            <Text style={styles.walletLabel}>Wallet Address</Text>
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(data.signInfo.address);
              }}
            >
              <Text style={styles.walletLabelAddress}>
                {data.signInfo.address}
                <i style={{ marginLeft: 4 }} className="fa fa-copy" />
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 10, width: 1 }} />
          <BlockDisplayer block={data.latestBlock} />
          <View style={{ height: 10, width: 1 }} />
          <View style={styles.largeMetricBox}>
            <View style={styles.rewardHolderView}>
              <Image
                resizeMode="contain"
                source={lineGraph}
                style={styles.lineGraph}
              />
              <View style={styles.rewardHolderViewGradient} />
              <View style={styles.rewardHolderViewText}>
                <View style={styles.rwcTextViewbox}>
                  <Text style={styles.labelLineText}>
                    Current Reward Probablity
                  </Text>
                  <View>
                    <Text style={styles.stakingMonitorActive}>
                      {displayPercent}
                      <Text style={styles.stakingMonitorActivePercent}>%</Text>
                    </Text>
                  </View>
                  <Text style={styles.simpleLineText}>{`${
                    data.numberOfTickets
                  } of ${utils.displayNumber(
                    data.totalTickets,
                    data.totalTickets < 1000 ? 0 : 2
                  )} ${ticketText}`}</Text>
                </View>
              </View>
            </View>
            <View style={styles.rewardsGivenBox}>
              <View style={styles.rwcTextViewbox}>
                <View style={styles.rewardGivenBoxTextHolder}>
                  <Text style={styles.labelLineText}>Rewards to Date</Text>
                  <View style={styles.rewardsGivenBoxRewardCount}>
                    <Text style={rewardStyle}>{rewardNumber}</Text>
                    <Text style={textNumberOfRewardsGivenType}>FSN</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.stakeDetailBox}>
            <View style={styles.stakeDetailRow}>
              <Text style={styles.stakeDetailText}>Stake Details</Text>
              <TouchableOpacity
                  disabled = {this.state.ticketStop }
                onPress={() => {                  
                  if (  !ticketStatus.activeTicketPurchase ) {
                    history.push("/PurchaseTicket");
                  } else {
                    if ( window.confirm("Are you sure you want to stop purchasing?")) {
                      this.setState( {  ticketStop : true })
                      currentDataState.web3api.stopTicketPurchase()
                    }
                  }
                }}
              >
                {this.handleStakeButtons(data, ticketStatus)}
              </TouchableOpacity>
            </View>
            <View style={{ height: 20 }} />
            <View style={styles.stakeDetailRow}>
              <Text style={styles.labelLineText}>Staking Status</Text>
              {ticketPurchaseStatus}
              { ticketStatus.activeTicketPurchase ? (
                <Text key="ab1" style={styles.activeButton}>
                  Active
                </Text>
              ) : (
                <Text key="ab1" style={styles.inActiveButton}>
                  Inactive
                </Text>
              )}
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.stakeDetailRow}>
              <Text style={styles.labelLineText}>Active Tickets</Text>
              <View>
                <Text style={styles.stakeTextVal}>
                  {data.numberOfTickets}
                  <Text style={styles.stakeTextFSN}>FSN</Text>
                </Text>
                {data.numberOfTickets > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({ ticketDisplayOn: true });
                    }}
                  >
                    <Text style={styles.viewTicketDetails}>
                      View Ticket Details
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.stakeDetailRow}>
              <Text style={styles.labelLineText}>Rewards to Date</Text>
              <View>
                <Text style={styles.stakeTextVal}>
                  {utils.formatWei(data.rewardsToDate)}
                  <Text style={styles.stakeTextFSN}>FSN</Text>
                </Text>
              </View>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.stakeDetailRow}>
              <Text style={styles.labelLineText}>FSN Staked</Text>
              <View>
                <Text style={styles.stakeTextVal}>
                  {utils.formatWei(this.totalStake(data))}
                  <Text style={styles.stakeTextFSN}>FSN</Text>
                </Text>
              </View>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.stakeDetailRow}>
              <Text style={styles.labelLineText}>FSN Available</Text>
              <View>
                <Text style={styles.stakeTextVal}>
                  {utils.formatWei(data.walletBalance)}
                  <Text style={styles.stakeTextFSN}>FSN</Text>
                </Text>
              </View>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.stakeDetailRow}>
              <Text style={styles.labelLineText}>Timelocked FSN Available</Text>
              <View>
                <Text style={styles.stakeTextVal}>
                  {utils.formatWei(data.timelockUsableBalance)}
                  <Text style={styles.stakeTextFSN}>FSN</Text>
                </Text>
              </View>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.stakeDetailRow}>
              <Text style={styles.labelLineText}>Total FSN</Text>
              <View>
                <Text style={styles.stakeTextVal}>
                  {utils.formatWei(
                    data.timelockUsableBalance.add(data.walletBalance.add(this.totalStake(data)))
                  )}
                  <Text style={styles.stakeTextFSN}>FSN</Text>
                </Text>
              </View>
            </View>
            <View style={styles.orderBorder} />
            {data.autoBuyOn && (
              <View key="aaa">
                <View style={styles.stakeDetailRow}>
                  <Text style={styles.labelLineText}>Auto Buy Tickets</Text>
                  <Text key="ab1" style={styles.activeButton}>
                    On
                  </Text>
                </View>
                <View style={styles.orderBorder} />
                <View style={styles.stakeDetailRow}>
                  <Text style={styles.labelLineText}>Auto Reinvest Reward</Text>
                  <Text
                    key="ab1"
                    style={
                      data.autoReinvestReward
                        ? styles.activeButton
                        : styles.inActiveButton
                    }
                  >
                    {data.autoReinvestReward ? "On" : "Off"}
                  </Text>
                </View>
                <View style={styles.orderBorder} />
                <View style={styles.stakeDetailRow}>
                  <Text style={styles.labelLineText}>Auto Buy Stop Time</Text>
                  <Text style={styles.dateValue}>
                    {data.autoBuyStopTime
                      ? data.autoBuyStopTime.format("lll")
                      : "Never"}
                  </Text>
                </View>
                <View style={styles.orderBorder} />
                <View style={styles.stakeDetailRow}>
                  <Text style={styles.labelLineText}>Last Ticket Expires</Text>
                  <Text style={styles.dateValue}>
                    {data.lastTicketExpires
                      ? data.lastTicketExpires.format("lll")
                      : "----"}
                  </Text>
                </View>
                <View style={styles.orderBorder} />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  handleStakeButtons(data, ticketStatus ) {
    if ( !ticketStatus.activeTicketPurchase ) {
      return (
        <Text key="ab1" style={styles.stakesPurchaseTicketButtton}>
          Purchase Staking Tickets
        </Text>
      );
    }
    if ( ticketStatus.activeTicketPurchase ) {
      return (
        <View
          style={{
            borderRadius: 3,
            borderWidth: 1,
            borderColor: this.state.ticketStop ? colors.errorRed : colors.orderGrey
          }}
        >
          <Text key="ab1" style={styles.stopAutoBuyButton}>
            {!this.state.ticketStop ?  "Stop Purchasing" : "Stopping Purchasing"}
          </Text>
        </View>
      );
    } else {
      return (
        <View
          style={{
            borderRadius: 3,
            borderWidth: 1,
            borderColor: colors.orderGrey
          }}
        >
          <Text key="ab1" style={styles.startAutoBuyButton}>
            Start Auto Buy
          </Text>
        </View>
      );
    }
  }
}

styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "auto",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 15,
    marginLeft: 15,
    backgroundColor: colors.backgroundGrey
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Roboto, san-serif",
    fontWeight: constants.boldFont,
    color: colors.textBlue
  },
  sectionNumberTitle: {
    fontSize: 18,
    color: "rgb(22,22,22)",
    marginTop: 30,
    marginBottom: 10
  },
  info: {
    fontSize: 16,
    color: "rgba(22,22,22, .5)"
  },
  imageUploadSection: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "auto",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: "transparent",
    marginLeft: 35,
    marginTop: 15
  },
  actionButtonDisabled: {
    backgroundColor: "#20C0FF",
    height: 35,
    width: 130,
    opacity: 0.5,
    boxShadow: "5px 10px 18px #888888"
  },
  actionButtonTextDisabled: {
    color: "#7f7f7f",
    fontSize: 19,
    marginTop: 7,
    textAlign: "center"
  },
  actionButton: {
    backgroundColor: "#20C0FF",
    height: 35,
    width: 130,
    boxShadow: "5px 10px 18px #888888"
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 19,
    marginTop: 7,
    textAlign: "center"
  },
  label: {
    fontSize: 14,
    color: "rgba(22,22,22,.5)",
    width: 160,
    marginBottom: 5
  },
  balanceBox: {
    width: 160,
    marginBottom: 5,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    flexBasis: "100%"
  },
  Auto_Buy_Stake_Monit: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: constants.fontFamily,
    fontWeight: constants.boldFont,
    color: colors.textBlue,
    marginBottom: 4,
    alignSelf: "flex-start"
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.labelGrey,
    alignSelf: "flex-start"
  },
  labelLineText: {
    fontSize: 12,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.labelGrey
  },
  simpleLineText: {
    fontSize: 12,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.textBlue
  },
  activeButton: {
    color: colors.textGreen,
    fontSize: 14,
    backgroundColor: colors.lightSuccessGreen,
    fontFamily: constants.fontFamily,
    padding: 8,
    fontWeight: constants.regularFont
  },
  stopAutoBuyButton: {
    padding: 8,
    fontSize: 14,
    color: colors.errorRed,
    fontWeight: constants.regularFont
  },
  startAutoBuyButton: {
    color: colors.textBlue,
    padding: 8,
    fontSize: 14,
    fontWeight: constants.regularFont
  },
  inActiveButton: {
    color: colors.textBlue,
    fontSize: 14,
    backgroundColor: colors.backgroundGrey,
    fontFamily: constants.fontFamily,
    padding: 8,
    fontWeight: constants.regularFont
  },
  stakingMonitorActive: {
    fontSize: 32,
    fontFamily: constants.fontFamily,
    color: colors.textBlue,
    fontWeight: constants.boldFont,
    marginTop: 8,
    marginBottom: 4
  },
  stakingMonitorActivePercent: {
    fontSize: 32,
    fontFamily: constants.fontFamily,
    color: colors.textBlue,
    fontWeight: constants.boldFont,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 1
  },
  largeMetricBox: {
    flex: 1,
    flexBasis: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: 620
  },
  stakeTextFSN: {
    fontFamily: constants.fontFamily,
    fontSize: 12,
    fontWeight: constants.regularFont,
    marginLeft: 4
  },
  viewTicketDetails: {
    fontFamily: constants.fontFamily,
    fontSize: 12,
    fontWeight: constants.regularFont,
    color: colors.linkBlue
  },
  stakeTextVal: {
    fontSize: 18,
    fontFamily: constants.fontFamily,
    fontWeight: constants.boldFont,
    alignSelf: "flex-end",
    color: colors.textBlue
  },
  dateValue: {
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.textBlue
  },
  orderBorder: {
    backgroundColor: colors.orderGrey,
    height: 1,
    width: 556
  },
  rewardsGivenBox: {
    borderColor: colors.orderGrey,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    width: 200,
    height: 132,
    overflow: "visible",
    boxShadow: "0 2px 0 0 rgba(189, 196, 206, 0.2)"
  },
  stakeDetailBox: {
    borderColor: colors.orderGrey,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1,
    width: 620,
    padding: 32,
    flex: 1,
    flexBasis: "100%",
    marginTop: 24,
    overflow: "visible",
    boxShadow: "0 2px 0 0 rgba(189, 196, 206, 0.2)"
  },
  rewardHolderView: {
    borderColor: colors.orderGrey,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    width: 388,
    height: 132,
    overflow: "visible",
    boxShadow: "0 2px 0 0 rgba(189, 196, 206, 0.2)"
  },
  rwcTextViewbox: {
    marginBottom: 16
  },
  rewardHolderViewText: {
    width: 227,
    marginLeft: 32,
    flex: 1,
    flexBasis: "100%",
    justifyContent: "center"
  },
  rewardHolderViewGradient: {
    backgroundImage:
      "linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0))",
    width: 40,
    marginLeft: 32,
    position: "absolute",
    height: 130,
    left: 138
  },
  rewardGivenBoxTextHolder: {
    marginLeft: 32,
    paddingTop: 8
  },
  textNumberOfRewardsGivenType: {
    fontSize: 12,
    fontFamily: constants.fontFamily,
    color: colors.textBlue,
    fontWeight: constants.regularFont,
    marginBottom: 10,
    marginLeft: 4
  },
  textNumberOfRewardsGivenTypeSmaller: {
    fontSize: 12,
    fontFamily: constants.fontFamily,
    color: colors.textBlue,
    fontWeight: constants.regularFont,
    marginBottom: 6,
    marginLeft: 4
  },
  textNumberOfRewardsGiven: {
    fontSize: 48,
    fontFamily: constants.fontFamily,
    color: colors.textBlue,
    fontWeight: constants.boldFont,
    marginTop: 8
  },
  textNumberOfRewardsGivenSmaller: {
    fontSize: 36,
    fontFamily: constants.fontFamily,
    color: colors.textBlue,
    fontWeight: constants.boldFont,
    marginTop: 8
  },
  rewardsGivenBoxRewardCount: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    marginTop: -2
  },
  lineGraph: {
    width: 216,
    height: 126,
    position: "absolute",
    left: 170,
    overflow: "visible"
  },
  titleBox: {
    width: 620
  },
  walletBox: {
    backgroundColor: colors.tagGrey,
    borderRadius: 3,
    width: 620,
    height: 48,
    marginTop: 20,
    flex: 1,
    flexBasis: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  walletLabel: {
    fontSize: 12,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    marginLeft: 32,
    color: colors.labelGrey
  },
  walletLabelAddress: {
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    marginRight: 32,
    color: colors.textBlue
  },
  stakeDetailText: {
    color: colors.textBlue,
    fontSize: 18,
    fontFamily: constants.fontFamily,
    fontWeight: constants.boldFont
  },
  stakesPurchaseTicketButtton: {
    borderRadius: 3,
    padding: 8,
    backgroundColor: colors.primaryBlue,
    color: colors.white,
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.mediumFont
  },
  stakesStopAutoBuy: {
    borderColor: colors.backgroundGrey,
    borderWidth: 1,
    borderRadius: 3,
    padding: 8,
    backgroundColor: colors.white
  },
  stakesStopAutoBuyText: {
    backgroundColor: colors.white,
    color: colors.errorRed,
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.mediumFont
  },
  stakeDetailRow: {
    flex: 1,
    flexBasis: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56
  },
  ticketDetailRow: {
    flex: 1,
    flexBasis: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 44,
    width: 620
  },
  closeButton: {
    width: 14,
    height: 14,
    position: "absolute",
    right: 18,
    top: 24,
    padding: 8
  }
});

export default Status;
