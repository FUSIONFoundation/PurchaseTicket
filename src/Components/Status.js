import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableHighlight
} from "react-native";
import ActionButton from "./Input/ActionButton.js";
import "../App.css";
import history from "../history.js";
import YesNoQuestion from "./Input/YesNoQuestion.js";
import InputField from "./Input/InputField.js";
import Border from "./Input/Border.js";
import ImageUpload from "./Input/ImageUpload.js";
import CheckBox from "./Input/CheckBox.js";
import colors from "./colors";
import constants from "./constants";
import utils from "../utils";
import moment from 'moment'
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";

var lineGraph = require("../images/lineGraph.svg")

var styles;

class Status extends Component {
  // this is what i use for production
  state = {
    data: {
      active : false,
      walletAddress: "0x",
      balanceOfFSN: 0,
      numberOfTickets: 22,
      autoBuy: false,
      autoReinvest: true,
      probablity: 0.23,
      totalTickets: 124444450,
      rewardsToDate: 9000,
      lastUpdateTime : new Date(),
      walletAddress : "0x3f99Fa1d008a658A0F51D94570bCEa2fd8dBDd3B"
    }
  };

  // this is my test state
  // name state above old state, and name this state
  oldstate = {
    data: {
      walletAddress: "0x",
      balanceOfFSN: 0,
      numberOfTickets: 1,
      autoBuy: false,
      autoReinvest: true,
      totalTickets: 1250,
      rewardsToDate: 52
    }
  };

  constructor(props) {
    super();
    this.editCallBack = this.editCallBackFunc.bind(this);
  }

  editCallBackFunc(key, value) {
    let newData = Object.assign(this.state.data, {});

    newData[key] = value;

    this.setState({ data: newData });
  }

  render() {
    let disabled = false;
    let data = this.state.data;

    //lets run through all the data and see if we are ready
    for (let key in data) {
      let val = data[key];
      if (!val) {
        disabled = true;
        break;
      }
    }

    if (!disabled) {
      // check email
      // eslint-disable-next-line
      let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      disabled = !re.test(data.email);
    }

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

    let dt = new moment( data.lastUpdateTime );

    let dtDisplay = dt.format( "LLLL z" );

    return (
      <View style={{ marginLeft: 30, backgroundColor: colors.backgroundGrey }}>
        <View style={styles.container}>
          <Text style={styles.Auto_Buy_Stake_Monit}>
            Auto Buy Stake Monitor
          </Text>
          <TouchableHighlight>
            <Text style={styles.lastUpdated}>
              <Text>↻</Text> {`Last Updated: ${dtDisplay}`}
            </Text>
          </TouchableHighlight>
          <View style={styles.walletBox}> 
            <Text style={styles.walletLabel}>Wallet Address</Text>
            <Text style={styles.walletLabelAddress}>{data.walletAddress}</Text>
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
                    <TouchableHighlight onPress={()=>{alert("do something")}}>
                        {data.active ? (
                        <Text style={styles.stakesPurchaseTicketButtton}>Purchase Staking Tickets</Text>
                        ) :
                        (
                          <View style={styles.stakesStopAutoBuy}>
                          <Text style={styles.stakesStopAutoBuyText}>Stop Auto Buy</Text>
                          </View>
                          )}
                    </TouchableHighlight>
                </View>
          </View>
        </View>
      </View>
    );
  }
}

styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "auto",
    justifyContent: "flex-start",
    alignItems: "flex-center",
    marginTop: 15,
    marginLeft: 15,
    backgroundColor: colors.backgroundGrey
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Roboto, san-serif",
    fontWeight: 700,
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
    marginBottom : 4
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
  stakeDetailBox : {
    borderColor: colors.orderGrey,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    width: 620,
    padding : 32,
    marginTop : 24,
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
  walletBox : {
    backgroundColor : colors.tagGrey,
    borderRadius: 3,
    width : 620,
    height : 48,
    marginTop : 20,
    flex : 1,
    flexBasis : '100%',
    flexDirection : 'row',
    alignItems : 'center',
    justifyContent : 'space-between'
  },
  walletLabel : {
    fontSize : 12,
    fontFamily : constants.fontFamily,
    fontWeight : constants.regularFont,
    marginLeft : 32,
    color : colors.labelGrey
  },
  walletLabelAddress : {
    fontSize : 14,
    fontFamily : constants.fontFamily,
    fontWeight : constants.regularFont,
    marginRight : 32,
    color : colors.textBlue
  },
  stakeDetailText : {
    color : colors.textBlue,
    fontSize : 18,
    fontFamily : constants.fontFamily,
    fontWeight : constants.boldFont
  },
  stakesPurchaseTicketButtton : {
    borderRadius : 3,
    padding : 8,
    backgroundColor : colors.primaryBlue,
    color : colors.white,
    fontSize : 14,
    fontFamily : constants.fontFamily,
    fontWeight : constants.mediumFont
  },
  stakesStopAutoBuy : {
      borderColor : colors.backgroundGrey,
      borderWidth : 1,
      borderRadius : 3,
      padding : 8,
      backgroundColor : colors.white,
  },
  stakesStopAutoBuyText : {
    backgroundColor : colors.white,
    color : colors.errorRed,
    fontSize : 14,
    fontFamily : constants.fontFamily,
    fontWeight : constants.mediumFont
},
  stakeDetailRow : {
    flex : 1,
    flexBasis : '100%',
    flexDirection : 'row',
    alignItems : 'center',
    justifyContent : 'space-between'
  }
});

export default Status;
