import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Clipboard,
  TextInput,
  TouchableOpacity
} from "react-native";

import "../App.css";
import history from "../history.js";
import CheckBox from "./Input/CheckBox.js";
import colors from "./colors";
import constants from "./constants";
import utils from "../utils";
import currentDataState from "../api/currentDataState";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

var BN = currentDataState.data.BN;

var styles;

class Status extends Component {
  // this is what i use for production
  state = {
    ticketQuantity: undefined,
    daysQuantity : "30",
    totalCost: 0,
    daysError : false , 
    totalCostString: "0",
    autoBuyTickets: false,
    reinvestReward: false,
    autoBuyStopDate: false,
    totalPrice: new BN(0),
    error: false,
    repaintKey : 0,
    date: new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
  };

  constructor(props) {
    super();
    this.onChangeDate = this.onChangeDate.bind(this);
    this.balanceListener = this.balanceListener.bind(this)
  }

  totalStake(data) {
    return data.numberOfTickets * data.ticketPrice;
  }

  balanceListener( balanceInfo ) {
    currentDataState.setBalanceInfo( balanceInfo )
    this.calcDisplay(currentDataState.data, this.state.ticketQuantity );
    this.setState( { repaintKey : this.state.repaintKey + 1 })
  }

  componentDidMount() {
    currentDataState.web3api.on("balanceInfo", this.balanceListener);
  }

  componentWillUnmount() {
    currentDataState.web3api.removeEventListener("balanceInfo", this.balanceListener);
  }

  render() {
    let data = currentDataState.data;

    let btnStyle = styles.purchaseTicketButtonDisabled;
    let enabled = false;
    let purchaseText = "Purchase Tickets";

    if ( data.accountUnlocked ) {
      data.web3api.walletAddress = data.signInfo.address;
    }

    if (this.state.ticketQuantity > 0) {
      btnStyle = styles.purchaseTicketButton;
      enabled = true;
      if (this.state.ticketQuantity === 1) {
        purchaseText = "Purchase 1 Ticket";
      } else {
        purchaseText = `Purchase ${this.state.ticketQuantity} Tickets`;
      }
    }

    let stakeTextColor;

    if (this.state.error) {
      enabled = false;
      btnStyle = styles.purchaseTicketButtonDisabled;
      stakeTextColor = colors.errorRed;
    } else {
      stakeTextColor = colors.textBlue;
    }

    let daysTextcolor 
    if ( this.state.daysError ) {
      enabled = false;
      btnStyle = styles.purchaseTicketButtonDisabled;
      daysTextcolor = colors.errorRed;
    } else {
      daysTextcolor = colors.textBlue
    }

    let displayPercent =
      data.totalTickets > 0
        ? utils.displayPercent(data.numberOfTickets / data.totalTickets)
        : "0.00";

    if (displayPercent === "0.00" && data.numberOfTickets > 0) {
      displayPercent = "< 0.01";
    }

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

    let borderColor = this.state.error ? colors.errorRed : colors.orderGrey;

    return (
      <View style={{ marginLeft: 30, backgroundColor: colors.backgroundGrey }}>
        <View style={styles.container}>
          <Text style={styles.Auto_Buy_Stake_Monit}>
            Purchase Staking Tickets
          </Text>
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
          <View style={styles.stakeDetailBox}>
            <Text style={styles.infoText}>
              Earn rewards by purchasing staking tickets. You will earn a reward
              of 2.5 FSN per selected ticket. If your ticket is not selected,
              your FSN will be returned when the ticket expires (30 days after
              purchase). NOTE: Only one ticket at a time can be purchased per
              block for an address.
              <TouchableOpacity
                onPress={() => {
                  //TODO: once article is up point to it
                  window.open("https://fusion.org");
                }}
              >
                <Text style={[styles.infoTextLink, { marginLeft: 4 }]}>
                  Learn More
                </Text>
              </TouchableOpacity>
            </Text>
            <View style={{ height: 20 }} />
            <View style={styles.orderBorder} />
            <View
              style={[
                styles.fundsDetailRow,
                { backgroundColor: colors.backgroundGrey }
              ]}
            >
              <Text style={styles.labelLineText}>Funds Available</Text>
              <View>
                <Text style={styles.statText}>
                  {utils.formatWei(data.walletBalance)}
                  <Text style={styles.stakeTextFSN}>FSN</Text>
                </Text>
              </View>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.stakeDetailRow}>
              <Text style={styles.labelLineText}>Ticket Price</Text>
              <View>
                <Text style={styles.valText}>
                  {utils.formatWei(data.ticketPrice)}
                  <Text style={styles.stakeTextFSN}>FSN</Text>
                </Text>
              </View>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.stakeDetailRow}>
              <Text style={styles.labelLineText}>Gas Price</Text>
              <View>
                <Text style={styles.valText}>
                  {utils.formatWei(data.gasPrice)}
                  <Text style={styles.stakeTextFSN}>FSN</Text>
                </Text>
              </View>
            </View>
            <View style={styles.orderBorder} />
            <View style={[styles.stakeDetailRow, { height: 78 }]}>
              <Text style={styles.labelLineText}>Ticket Quantity</Text>
              <View>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  {this.state.error && (
                    <View style={styles.errorForFundsBox}>
                      <Text style={styles.errorForFunds}>
                        You don't have enough FSN
                      </Text>
                      <i
                        style={{
                          position: "relative",
                          left: -1,
                          color: colors.errorRed
                        }}
                        className="fa fa-caret-right"
                      />
                    </View>
                  )}
                  <TextInput
                    style={[
                      styles.ticketQuantityInput,
                      { borderColor: borderColor }
                    ]}
                    placeholder="0"
                    autoCorrect={false}
                    placeholderTextColor={colors.orderGrey}
                    maxLength={10}
                    value={"" + (this.state.ticketQuantity || "")}
                    onChangeText={val => {
                      this.calcDisplay(data, val);
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    let valGas = new BN(data.gasPrice);
                    let valTik = new BN(data.ticketPrice);
                    valTik = valTik.add(valGas);
                    let num = data.walletBalance.div(valTik);
                    this.calcDisplay(data, num.toNumber());
                  }}
                >
                  <Text style={styles.maxIt}>Max Quantity</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.orderBorder} />
            <View style={[styles.stakeDetailRow, { height: 78 }]}>
              <Text style={styles.labelLineText}>Ticket Days</Text>
              <View>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <TextInput
                    style={[
                      styles.ticketQuantityInput,
                      { borderColor: this.state.daysError ? colors.errorRed : colors.orderGrey }
                    ]}
                    placeholder="30"
                    autoCorrect={false}
                    placeholderTextColor={colors.orderGrey}
                    maxLength={10}
                    value={"" + (this.state.daysQuantity || "")}
                    onChangeText={val => {
                      let days = parseInt( val )
                      if ( isNaN(days) || days < 1 || days > 100 ) {
                        this.setState(  { daysQuantity : val, daysError : true })
                      } else {
                        this.setState( { daysQuantity : days, daysError  : false  } )
                      }
                    }}
                  />
                </View>
                <Text style={[styles.maxIt,{color : colors.orderGrey}]}>(1-100)</Text>
              </View>
            </View>
            <View style={styles.orderBorder} />
            <View style={{ height: 16, width: 1 }} />
            <View style={[styles.stakeDetailRow, { height: 30 }]}>
              <Text style={styles.labelLineText}>Total Cost</Text>
              <View>
                <Text style={styles.costCalcLineText}>
                  Ticket Cost {this.state.ticketQuantity || "0"} x{" "}
                  {utils.formatWei(data.ticketPrice)} FSN
                </Text>
              </View>
            </View>
            <View>
              <Text style={styles.costCalcLineText}>
                Gas Cost {this.state.ticketQuantity || "0"} x{" "}
                {utils.formatWei(data.gasPrice)} FSN
              </Text>
              <View style={{ height: 16, width: 1 }} />
              <View>
                <Text style={[styles.stakeTextVal, { color: stakeTextColor }]}>
                  {this.state.totalCostString}
                  <Text style={styles.stakeTextFSN}>FSN</Text>
                </Text>
              </View>
            </View>
            <View style={{ height: 20, width: 1 }} />
            <View style={styles.orderBorder} />
            <View style={{ height: 16, width: 1 }} />
            <CheckBox
              textWidth={512}
              onPress={() => {
                let obj = { autoBuyTickets: !this.state.autoBuyTickets }
                if ( !obj.autoBuyTickets ) {
                    obj.autoBuyStopDate = false
                }
                this.setState(obj);
              }}
              on={this.state.autoBuyTickets}
              text="Auto Buy Tickets"
              subText="Tickets will be repurchased when they expire or when they win rewards"
            />
            <CheckBox
              textWidth={512}
              onPress={() => {
                this.setState({ reinvestReward: !this.state.reinvestReward });
              }}
              on={this.state.reinvestReward}
              text="Reinvest Reward"
              subText="Rewards that are won will be reinvested to purchase more tickets when enough rewards are collected."
            />
            <CheckBox
              textWidth={512}
              disabled={!this.state.autoBuyTickets}
              onPress={() => {
                this.setState({ autoBuyStopDate: !this.state.autoBuyStopDate });
              }}
              on={this.state.autoBuyStopDate}
              text="Auto Buy Stop Date"
              subText="Auto Buy will stop on desired date"
            >
              {this.state.autoBuyStopDate && (
                <DatePicker
                  onChange={this.onChangeDate}
                  selected={this.state.date}
                  minDate={new Date(new Date().getTime() + 1000 * 60 * 60 * 24)}
                  showTimeSelect
                  dateFormat="Pp"
                />
              )}
            </CheckBox>
            <TouchableOpacity disabled={!enabled} onPress={() => {}}>
              <View>
                <Text style={btnStyle}>{purchaseText}</Text>
              </View>
            </TouchableOpacity>
            <View style={{ height: 16, width: 1 }} />
            <Text style={styles.footerText}>
              Funds used to purchase tickets will be sent back after tickets
              have expired. Tickets expire 30 days after date of purchase. Your
              browser window must remain open to continue autobuy.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  onChangeDate(date) {
    let dt = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
    if (date.getTime() < dt.getTime()) {
      date = dt;
    }
    this.setState({ date });
  }

  calcDisplay(data, val) {
    let x = parseInt(val);
    if (!x && (x !== 0 || x < 0)) {
      x = 0;
    }
    let valGas = new BN(x);
    valGas = valGas.mul(data.gasPrice);
    let valTik = new BN(x);
    valTik = valTik.mul(data.ticketPrice);
    valGas = valGas.add(valTik);
    let totalCostString = utils.formatWei(valGas.toString());
    this.setState({
      ticketQuantity: x,
      totalPrice: valGas,
      totalCostString,
      error: valGas.gt(data.walletBalance)
    });
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
  maxIt: {
    fontFamily: constants.fontFamily,
    fontSize: 12,
    fontWeight: constants.mediumFont,
    color: colors.linkBlue,
    alignSelf: "flex-end"
  },
  stakeTextVal: {
    fontSize: 18,
    fontFamily: constants.fontFamily,
    fontWeight: constants.boldFont,
    color: colors.textBlue,
    alignSelf: "flex-end"
  },
  valText: {
    fontSize: 18,
    fontFamily: constants.fontFamily,
    fontWeight: constants.mediumFont,
    color: colors.textBlue,
    alignSelf: "flex-end"
  },
  dateValue: {
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.textBlue
  },
  statText: {
    fontSize: 18,
    fontFamily: constants.fontFamily,
    fontWeight: constants.mediumFont,
    color: colors.textBlue
  },
  infoText: {
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.mediumFont,
    color: colors.textGrey,
    lineHeight: "1.71"
  },
  infoTextLink: {
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.mediumFont,
    color: colors.linkBlue
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
  },
  fundsDetailRow: {
    flex: 1,
    flexBasis: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44
  },
  errorForFunds: {
    fontSize: 12,
    fontWeight: constants.mediumFont,
    fontFamily: constants.fontFamily,
    color: colors.white,
    backgroundColor: colors.errorRed,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 3,
    height: 24,
    alignSelf: "center"
  },
  errorForFundsBox: {
    flex: 1,
    flexDirection: "row",
    marginRight: 6,
    alignItems: "center"
  },
  ticketQuantityInput: {
    borderColor: colors.orderGrey,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1,
    fontSize: 14,
    fontFamily: constants.mediumFont,
    color: colors.labelGrey,
    height: 36,
    width: 110,
    marginTop: 6,
    marginBottom: 6,
    alignSelf: "flex-end",
    textAlign: "right",
    paddingRight: 4,
    paddingLeft: 4,
    outline: "none"
  },
  costCalcLineText: {
    fontFamily: constants.fontFamily,
    fontSize: 12,
    fontWeight: constants.mediumFont,
    color: colors.labelGrey,
    alignSelf: "flex-end"
  },
  purchaseTicketButtonDisabled: {
    fontSize: 16,
    width: 556,
    borderRadius: 3,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.white,
    backgroundColor: colors.disabledBlue,
    textAlign: "center",
    padding: 12,
    marginTop: 20
  },
  purchaseTicketButton: {
    fontSize: 16,
    width: 556,
    borderRadius: 3,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.white,
    backgroundColor: colors.linkBlue,
    textAlign: "center",
    padding: 12,
    marginTop: 20
  },
  footerText: {
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.mediumFont,
    color: colors.disabledGrey
  }
});

export default Status;
