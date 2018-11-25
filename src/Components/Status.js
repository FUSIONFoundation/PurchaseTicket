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

var lineGraph = require("../images/lineGraph.svg");

var styles;

class Status extends Component {
  // this is what i use for production
  state = {};

  constructor(props) {
    super();
  }

  totalStake(data) {
    return data.numberOfTickets * data.ticketPrice;
  }

  render() {
    let data = currentDataState.data;

    let rewardNumber = utils.displayNumber(data.rewardsToDate, 1, true);
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

    let dtDisplay = dt.format("LLLL z");

    if (!data.accountUnlocked) {
      return (
        <View style={{padding:15}}>
          <Text style={styles.Auto_Buy_Stake_Monit}>
            You Account Must be unlocked to use this screen.
          </Text>
          <TouchableOpacity style={{width:100}}
                onPress={() => {
                  history.push('/UnlockAccount')
                }}
              >
              <Text style={styles.activeButton}>Select An Account</Text>
              </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ marginLeft: 30, backgroundColor: colors.backgroundGrey }}>
        <View style={styles.container}>
          <Text style={styles.Auto_Buy_Stake_Monit}>
            Auto Buy Stake Monitor
          </Text>
          <TouchableOpacity>
            <Text style={styles.lastUpdated}>
              <Text>↻</Text> {`Last Updated: ${dtDisplay}`}
            </Text>
          </TouchableOpacity>
          <View style={styles.walletBox}>
            <Text style={styles.walletLabel}>Wallet Address</Text>
            <TouchableOpacity onPress={() => {Clipboard.setString(data.signInfo.address)}}>
              <Text style={styles.walletLabelAddress}>
                {data.signInfo.address}
                <i style={{ marginLeft: 4 }} className="fa fa-copy" />
              </Text>
            </TouchableOpacity>
          </View>
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
                onPress={() => {
                  if ( !data.autoBuyOn && data.numberOfTicketsToPurchase === 0 ) {
                    history.push('/PurchaseTicket')
                  } else {
                    alert("do something");
                  }
                }}
              >
                {this.handleStakeButtons(data)}
              </TouchableOpacity>
            </View>
            <View style={{ height: 20 }} />
            <View style={styles.stakeDetailRow}>
              <Text style={styles.labelLineText}>Staking Status</Text>
              {data.autoBuyOn || data.numberOfTickets ? (
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
                  <Text style={styles.viewTicketDetails}>
                    View Ticket Details
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.stakeDetailRow}>
              <Text style={styles.labelLineText}>Rewards to Date</Text>
              <View>
                <Text style={styles.stakeTextVal}>
                  {data.rewardsToDate.toFixed(2)}
                  <Text style={styles.stakeTextFSN}>FSN</Text>
                </Text>
              </View>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.stakeDetailRow}>
              <Text style={styles.labelLineText}>FSN Staked</Text>
              <View>
                <Text style={styles.stakeTextVal}>
                  {this.totalStake(data)}
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
              <Text style={styles.labelLineText}>Total FSN</Text>
              <View>
                <Text style={styles.stakeTextVal}>
                  {data.walletBalance + this.totalStake(data)}
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

  handleStakeButtons(data) {
    if (!data.autoBuyOn && data.numberOfTicketsToPurchase === 0) {
      return (
        <Text key="ab1" style={styles.stakesPurchaseTicketButtton}>
          Purchase Staking Tickets
        </Text>
      );
    }
    if (data.autoBuyOn) {
      return (
        <View
          style={{
            borderRadius: 3,
            borderWidth: 1,
            borderColor: colors.orderGrey
          }}
        >
          <Text key="ab1" style={styles.stopAutoBuyButton}>
            Stop Auto Buy
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
    alignItems: "flex-start",
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
    marginBottom: 4
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.labelGrey
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
    color : colors.textBlue,
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
  }
});

export default Status;
