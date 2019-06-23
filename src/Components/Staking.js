import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions
} from "react-native";

import "../App.css";
import colors from "./colors";
import constants from "./constants";
import utils from "../utils";
import currentDataState from "../api/dataAPI";


var formatter = (new Intl.NumberFormat(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}))
var styles;

class BigButton extends Component {
  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.onPress();
        }}
      >
        <View
          style={{
            width: 48,
            marginRight: 8,
            marginTop: 8,
            height: 36,
            borderRadius: 3,
            borderWidth: 1,
            borderColor: colors.orderGrey,
            backgroundColor: this.props.active ? colors.textBlue : colors.white
          }}
        >
          <Text
            style={[
              styles.bigButtonText,
              { color: this.props.active ? colors.white : colors.textBlue }
            ]}
          >
            {this.props.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

export default class Staking extends Component {
  state = {
    stakeVal: 5000,
    ticketVal : 4,
    cmd: "30d",
    PFSN_Amount: "-",
    FSN_Amount: "-",
    PFSN_Return: "-",
    FSN_Return: "-",
    Total_Amount: "-",
    Total_Return: "-",
    width: parseInt(Dimensions.get("window").width),
    ticketNumber: currentDataState.datablock.ticketNumber
  };

  constructor(props) {
    super(props);
    this.calcDisplay = this.calcDisplay.bind(this);
    this.calcTicketDisplay = this.calcTicketDisplay.bind(this)
    this.ticketNumberChanged = this.ticketNumberChanged.bind(this);

    this.updateDimensions = this.updateDimensions.bind(this);
  }

  calcTicketDisplay(valIn) {
    let val = valIn
    val = parseInt(val);
    if (
      isNaN(val) ||
      val <= 0 ||
      valIn.length === 0
    ) {
      let obj = Object.assign({}, this.state);
      obj.stakeVal = 0;
      obj.ticketVal = valIn
      obj.PFSN_Amount = "-";
      obj.FSN_Amount = "-";
      obj.PFSN_Return = "-";
      obj.FSN_Return = "-";
      obj.Total_Amount = "-";
      obj.Total_Return = "-";
      this.setState(obj);
      return;
    }

    this.calcDisplay( "" + (val * 5000) )
  }

  calcDisplay(valIn, cmdPast) {
    let val = valIn || this.state.stakeVal;
    let obj = Object.assign({}, this.state);
    let cmd = cmdPast || this.state.cmd;

    let ticketNumber = parseInt(this.state.ticketNumber);

    val = parseInt(val);
    if (
      isNaN(val) ||
      val <= 0 ||
      isNaN(ticketNumber) ||
      (!cmdPast && (!valIn ||
      valIn.length === 0))
    ) {
      obj.stakeVal = valIn;
      obj.ticketVal = 0
      obj.PFSN_Amount = "-";
      obj.FSN_Amount = "-";
      obj.PFSN_Return = "-";
      obj.FSN_Return = "-";
      obj.Total_Amount = "-";
      obj.Total_Return = "-";
      obj.cmd = cmd;
      this.setState(obj);
      return;
    }

    if ( !valIn ) {
      valIn = val
    }

    let days = 30;
    switch (cmd) {
      default:
      case "30d":
        days = 30;
        break;
      case "60d":
        days = 60;
        break;
      case "90d":
        days = 90;
        break;
      case "180d":
        days = 180;
        break;
      case "1y":
        days = 365;
        break;
    }

    //let averageBlockTime = 15;
    let Total_Tickets = ticketNumber;
    let User_FSN = val;
    let User_Tickets = Math.floor(User_FSN / 5000);

    let Time_Invested = days;
    //let pFsnToFsnExchange = 1;

    let Blocks_Per_Day = 5760;
    let New_Total_Tickets = Total_Tickets + User_Tickets;
    let Probability_Reward = User_Tickets / New_Total_Tickets;
    let PFSN_Reward_Block = 2.5;
    let FSN_Reward_Block = 0.625;
    let Total_PFSN_Reward_Day_Possible = PFSN_Reward_Block * Blocks_Per_Day;
    let Total_FSN_Reward_Day_Possible = Blocks_Per_Day * FSN_Reward_Block;
    let PFSN_Reward_User =
      Time_Invested * Probability_Reward * Total_PFSN_Reward_Day_Possible;
    let ROR_PFSN = PFSN_Reward_User / User_FSN;
    let FSN_Reward_User =
      Time_Invested * Probability_Reward * Total_FSN_Reward_Day_Possible;
    let ROR_FSN = FSN_Reward_User / User_FSN;
    let FSN_PFSN_Reward_User = PFSN_Reward_User + FSN_Reward_User;
    let ROR_PFSN_PLUS_FSN = FSN_PFSN_Reward_User / User_FSN;

    obj.PFSN_Amount = formatter.format( PFSN_Reward_User )
    obj.FSN_Amount = formatter.format( FSN_Reward_User );
    obj.PFSN_Return = ROR_PFSN * 100;
    obj.FSN_Return = ROR_FSN * 100;
    obj.Total_Amount = formatter.format( FSN_PFSN_Reward_User );
    obj.Total_Return = formatter.format( ROR_PFSN_PLUS_FSN * 100 );
    obj.stakeVal = "" + valIn;

    obj.ticketVal = parseInt( User_Tickets  )

    obj.cmd = cmd;
    this.setState(obj);
  }

  ticketNumberChanged(ticketNumber) {
    this.setState({ ticketNumber });
    this.calcDisplay(this.state.stakeVal);
  }

  componentDidMount() {
    this.intervalTimer = setInterval(() => {
      this.updateDimensions();
    }, 250);

    window.addEventListener("resize", this.updateDimensions);
    this.calcDisplay("1000");
    this.mounted = true;
    currentDataState.on("ticketNumber", this.ticketNumberChanged);
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener("resize", this.updateDimensions);
    currentDataState.removeEventListener(
      "ticketNumber",
      this.ticketNumberChanged
    );
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = undefined;
    }
  }

  updateDimensions() {
    let newWidth = parseInt(Dimensions.get("window").width);
    if (newWidth !== this.state.width) {
      this.setState({ width: newWidth });
    }
  }

  render() {
    let cmd = this.state.cmd;

    let displayWidth = 320;
    let displayHeight = 280;

    if (this.state.width < displayWidth * 2) {
      this.stacked = true;
      this.widthToUse = this.state.width - 64;
    } else {
      this.stacked = false;
      this.widthToUse = 585;
    }

    return (
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <View
            style={{
              width: displayWidth,
              height: displayHeight,
              backgroundColor: colors.tagGrey,
              paddingTop: 16,
              paddingBottom: 16,
              paddingLeft: 24,
              paddingRight: 24,
              boxShadow: "0 6px 12px 0 rgba(0, 15, 33, 0.04)",
              overflow: "visible"
            }}
          >
            <View
              style={{
                backgroundColor: colors.tagGrey
              }}
            >
              <View style={styles.youStakeRowText}>
                <Text style={styles.youStakeText}>
                  {"Active Tickets: " + this.state.ticketNumber}{" "}
                </Text>
              </View>
              <View style={styles.youStakeRowText}>
                <Text style={styles.youStakeText}>Your Stake</Text>
              </View>
              <View style={styles.youStakeRow}>
                <View>
                  <View
                    style={{
                      width: 125,
                      borderRadius: 3,
                      backgroundColor: "white",
                      borderWidth: 1,
                      height: 36,
                      flex: 1,
                      flexBasis : 'auto',
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderColor: colors.orderGrey,
                    }}
                  >
                    <TextInput
                      style={[styles.stakeQuantityInput]}
                      placeholder="0"
                      autoCorrect={false}
                      placeholderTextColor={colors.orderGrey}
                      maxLength={10}
                      value={"" + (this.state.stakeVal || "")}
                      onChangeText={val => {
                        this.calcDisplay(val);
                      }}
                    />
                    <Text style={styles.inputLabel}>FSN</Text>
                  </View>
                </View>
                <Text style={{marginTop:8,marginRight:8,marginLeft:8}}>=</Text>
                <View>
                  <View
                    style={{
                      width: 125,
                      borderRadius: 3,
                      backgroundColor: "white",
                      borderWidth: 1,
                      height: 36,
                      flex: "1 0 0",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderColor: colors.orderGrey,
                      marginRight: 16
                    }}
                  >
                    <TextInput
                      style={[styles.stakeQuantityInput]}
                      placeholder="0"
                      autoCorrect={false}
                      placeholderTextColor={colors.orderGrey}
                      maxLength={10}
                      value={"" + (this.state.ticketVal || "")}
                      onChangeText={val => {
                        this.calcTicketDisplay(val);
                      }}
                    />
                    <Text style={styles.inputLabel}>Tickets</Text>
                  </View>
                </View>
              </View>
              <View style={{ marginTop: 32 }}>
                <Text style={styles.youStakeForText}>Staking Time</Text>
                <View style={{ height: 8 }} />
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "flex-start"
                    //flexWrap : 'wrap',
                  }}
                >
                  <BigButton
                    text="30d"
                    active={cmd === "30d"}
                    onPress={() => {
                      this.calcDisplay(undefined, "30d");
                    }}
                  />
                  <BigButton
                    text="60d"
                    active={cmd === "60d"}
                    onPress={() => {
                      this.calcDisplay(undefined, "60d");
                    }}
                  />
                  <BigButton
                    text="90d"
                    active={cmd === "90d"}
                    onPress={() => {
                      this.calcDisplay(undefined, "90d");
                    }}
                  />
                  <BigButton
                    text="180d"
                    active={cmd === "180d"}
                    onPress={() => {
                      this.calcDisplay(undefined, "180d");
                    }}
                  />
                  <BigButton
                    text="1y"
                    active={cmd === "1y"}
                    onPress={() => {
                      this.calcDisplay(undefined, "1y");
                    }}
                  />
                </View>
                <View style={{ height: 32 }} />
              </View>
            </View>
          </View>
          <View
            style={{
              width: displayWidth,
              height: displayHeight,
              backgroundColor: colors.white,
              paddingTop: 16,
              paddingBottom: 16,
              paddingLeft: 24,
              paddingRight: 24,
              boxShadow: "0 6px 12px 0 rgba(0, 15, 33, 0.04)",
              overflow: "visible"
            }}
          >
            <View
              style={{
                backgroundColor: "white"
              }}
            >
              <Text
                style={[
                  styles.youReceiveText,
                  { marginTop: this.stacked ? 24 : 0 }
                ]}
              >
                Your Estimated Return
              </Text>
              <View style={{ height: 16 }} />
              <View style={styles.simpleRow}>
                <Text style={styles.calcAmountText}>
                  {this.state.PFSN_Amount}
                </Text>
                <Text style={styles.smallLabelText}>FSN</Text>
                <View style={{ width: 32 }} />
                <Text style={styles.calcReturnText}>
                  {utils.formatPercent(this.state.PFSN_Return)}
                </Text>
                <Text style={styles.smallLabelText}>ROR</Text>
              </View>
              {/* <View style={styles.simpleRow}>
                <Text style={styles.calcAmountText}>
                  {this.state.FSN_Amount}
                </Text>
                <Text style={styles.smallLabelText}>FSN</Text>
                <View style={{ width: 32 }} />
                <Text style={styles.calcReturnText}>
                  {utils.formatPercent(this.state.FSN_Return)}
                </Text>
                <Text style={styles.smallLabelText}>ROR</Text>
              </View> */}
              <View style={{ height: 48 }} />
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
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white
  },
  innerContainer: {
    flex: 1,
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: colors.white,
    flexWrap: "wrap",
    marginTop: 32
  },
  youStakeRowText: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 16
  },
  youStakeText: {
    fontFamily: constants.fontFamily,
    fontSize: 18,
    color: colors.textBlue,
    width: 240,
    fontWeight: constants.regularFont
  },
  titleText: {
    fontFamily: constants.fontFamily,
    fontSize: 22,
    color: colors.textBlue,
    width: 240,
    fontWeight: constants.mediumFont
  },
  youStakeForText: {
    fontFamily: constants.fontFamily,
    fontSize: 13,
    color: colors.texBlue,
    fontWeight: constants.regularFont
  },
  youReceiveText: {
    fontFamily: constants.fontFamily,
    fontSize: 18,
    color: colors.textBlue,
    fontWeight: constants.regularFont
  },
  smallLabelText: {
    fontFamily: constants.fontFamily,
    fontSize: 12,
    color: colors.textBlue,
    fontWeight: constants.mediumFont,
    paddingTop: 9
  },
  simpleRow: {
    marginTop: 16,
    flexDirection: "row",
    flex: 1,
    justifyContent: "flex-start"
  },
  plusText: {
    fontFamily: constants.fontFamily,
    fontSize: 24,
    color: colors.textBlue,
    fontWeight: constants.boldFont
  },
  calcLabelText: {
    fontFamily: constants.fontFamily,
    fontSize: 24,
    color: colors.textBlue,
    fontWeight: constants.mediumFont,
    width: 100
  },
  calcAmountText: {
    fontFamily: constants.fontFamily,
    fontSize: 22,
    color: colors.textBlue,
    fontWeight: constants.mediumFont,
    marginRight: 4,
    textAlign: "left"
  },
  calcReturnText: {
    fontFamily: constants.fontFamily,
    fontSize: 14,
    color: colors.textBlue,
    fontWeight: constants.mediumFont,
    marginRight: 4,
    textAlign: "left",
    paddingTop: 7
  },
  youStakeRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  stakeQuantityInput: {
    width: 80,
    fontSize: 14,
    fontStyle: constants.mediumFont,
    fontFamily: constants.fontFamily,
    color: colors.textBlue,
    height: 36,
    //alignSelf: "flex-end",
    textAlign: "left",
    paddingRight: 4,
    paddingLeft: 8,
    outline: "none"
  },
  inputLabel : {
    marginTop: 8,
    fontFamily: constants.fontFamily,
    fontSize: 12,
    color: colors.textBlue,
    fontWeight: constants.regularFont,
    width : 45,
    height : 20,
    paddingRight : 4,
    textAlign : 'right',
    whiteSpace : 'nowrap'
  },
  sectionTitle: {
    fontSize: 28,
    color: "rgba(22,22,22, .5)"
  },
  sectionNumberTitle: {
    fontSize: 18,
    color: "rgb(22,22,22)",
    marginTop: 30,
    marginBottom: 10
  },
  bigButtonText: {
    fontFamily: constants.fontFamily,
    fontSize: 14,
    fontWeight: constants.regularFont,
    color: colors.textBlue,
    textAlign: "center",
    paddingTop: 10
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
  }
});
