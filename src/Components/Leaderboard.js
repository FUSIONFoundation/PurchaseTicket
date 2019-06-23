import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from "react-native";

import "../App.css";
import colors from "./colors";
import utils from "../utils";
import constants from "./constants";
const rp = require("request-promise");

let server = utils.getServer()

var styles;

let bronze = require("../images/Bronze.svg");
let gold = require("../images/Gold.svg");
let silver = require("../images/Silver.svg");

var formatter = (new Intl.NumberFormat(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}))


class SelectButton extends Component {
  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.onPress();
        }}
      >
        <View
          style={{
            width: 110,
            marginLeft : 4,
            marginRight: 4,
            height: 36,
            overflow: "visible",
            borderRadius: 3,
            // borderWidth: 1,
            // borderColor: colors.orderGrey,
            boxShadow: "0 6px 12px 0 rgba(189, 196, 206, 0.2)",
            backgroundColor: this.props.active
              ? colors.primaryBlue
              : colors.white
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

export default class Leaderboard extends Component {
  state = {
    loading: true,
    thisMonth: [],
    lastMonth: [],
    lastYear: [],
    cmd: "Year To Date",
    width: parseInt(Dimensions.get("window").width)
  };

  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
  }
  render() {
    let { loading, error, cmd } = this.state;

    if (this.state.width < 640) {
      this.stacked = true;
      this.widthToUse = parseInt(Dimensions.get("window").width) - 64;
    } else {
      this.stacked = false;
      this.widthToUse = 585;
    }

    if (loading) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            marginTop: 32,
            marginLeft: 32
          }}
        >
          <ActivityIndicator size="small" color={colors.primaryBlue} />
          <Text style={[styles.titleText, { marginTop: 12, marginLeft: 16 }]}>
            Loading...
          </Text>
        </View>
      );
    }
    if (error) {
      return (
        <View>
          <Text style={styles.titleText}>{error}</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style={styles.subContainer}>
          <Text style={styles.titleText}>Staking Leaderboard</Text>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              marginBottom: 16,
            }}
          >
            <SelectButton
              text="Current Month"
              active={cmd === "Current Month"}
              onPress={() => {
                this.setState({ cmd: "Current Month" });
              }}
            />
            <SelectButton
              text="Prior Month"
              active={cmd === "Prior Month"}
              onPress={() => {
                this.setState({ cmd: "Prior Month" });
              }}
            />
            <SelectButton
              text="Year To Date"
              active={cmd === "Year To Date"}
              onPress={() => {
                this.setState({ cmd: "Year To Date" });
              }}
            />
          </View>
          {this.renderTop3()}
          <View style={{ height: 20 }} />
          <View
            style={{
              boxShadow: "0 6px 12px 0 rgba(189, 196, 206, 0.2)",
              overflow: "visible",
              paddingTop: 0,
              paddingRight: this.stacked ? 16 : 32,
              paddingLeft: this.stacked ? 16 : 32,
              paddingBottom: 32,
              borderWidth: 1,
              borderColor: colors.tagGrey
            }}
          >
            {this.renderTitle()}
            {this.renderTable()}
          </View>
        </View>
      </View>
    );
  }

  renderTitle() {
    if (this.stacked) {
      return undefined;
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "flex-start",
          marginTop: 16,
          marginBottom: 4
        }}
      >
        <Text style={[styles.headerText, { width: 32 }]}>#</Text>
        <Text style={[styles.headerText, { width: 372, marginRight: 4 }]}>
          Address
        </Text>

        <Text
          style={[
            styles.headerText,
            { textAlign: "right", width: 90, marginRight: 4 }
          ]}
        >
          P-FSN
        </Text>
        <Text
          style={[
            styles.headerText,
            { textAlign: "right", width: 90, marginRight: 4 }
          ]}
        >
          FSN Earned
        </Text>
      </View>
    );
  }

  renderTop3() {
    let ret = [];

    let data;
    switch (this.state.cmd) {
      case "Prior Month":
        data = this.state.lastMonth;
        break;
      case "Current Month":
        data = this.state.thisMonth;
        break;
      default:
        data = this.state.lastYear;
        break;
    }

    let datas = [data[1], data[0], data[2]];
    let heights = [134, 146, 134];
    let heightDiff = [12, 0, 12];
    let images = [silver, gold, bronze];
    let sizes = [52, 64, 40];
    let sizesStacked = [64, 52, 40];
    let width = 190;
    let imagesStacked = [gold, silver, bronze];

    for (let index = 0; index < 3; index++) {
      let row = this.stacked ? data[index] : datas[index];

      let count , miner

      if ( !row || !row.miner  ) {
        count = 0
        miner = "0x000000000000000000000"
        row = { count , miner }
      } else {
        count = row["count(miner)"];
        miner = row.miner.toLowerCase();  
      }

      if (this.stacked) {
        ret.push(
          <View
            key={"sep1" + index}
            style={{
              width: this.widthToUse + 32,
              height: 104,
              paddingRight: 0,
              paddingLeft: 0,
              // flex: 1,
              flexDirection: "row",
              // justifyContent: "flex-start",
              // alignItems: "flex-start",
              boxShadow: "0 6px 12px 0 rgba(189, 196, 206, 0.2)",
              overflow: "visible",
              borderWidth: 1,
              borderColor: colors.tagGrey,
              marginBottom: index === 2 ? 8 : 12
            }}
          >
            <View
              style={{
                height: 104,
                width: 96,
                justifyContent: "center",
                alignItems: "center"
                // backgroundColor : 'red'
              }}
            >
              <Image
                source={imagesStacked[index]}
                resizeMode="contain"
                style={{
                  width: sizesStacked[index],
                  height: sizesStacked[index]
                }}
              />
            </View>
            <View
              key={"sep1b" + index}
              style={{
                width: this.widthToUse - 96,
                height: 104,
                justifyContent: "center",
                alignItems: "flex-start",
                marginTop: 28
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  window.open(
                    "https://blocks.fusionnetwork.io/Addresses/" + miner
                  );
                }}
              >
                <Text
                  style={[
                    styles.rowText,
                    { color: colors.linkBlue, marginBottom: 4 }
                  ]}
                >
                  {utils.midHashDisplay(miner)}
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row"
                }}
              >
                <Text style={[styles.top3Number]}>
                  {this.pfsnEarned(count)}
                  <Text style={[styles.top3Text]}>PFSN</Text>
                </Text>
                <Text style={[styles.top3Number]}>
                  {this.fsnEarned(count)}
                  <Text style={[styles.top3Text]}>FSN</Text>
                </Text>
              </View>
            </View>
          </View>
        );
      } else {
        ret.push(
          <View
            key={"sep1" + index}
            style={{
              width: width,
              height: 200,
              flex: 1,
              justifyContent: "flex-start",
              alignItems: "center",
              overflow: "visible",
              marginRight: index === 1 ? 30 : 0,
              marginLeft: index === 1 ? 30 : 0
            }}
          >
            <View
              style={{
                zIndex: 1,
                height: 32 + heightDiff[index],
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
                position: "relative",
                top: sizes[index] / 2
              }}
            >
              <Image
                source={images[index]}
                resizeMode="contain"
                style={{ width: sizes[index], height: sizes[index] }}
              />
            </View>
            <View
              key={"sep1" + row.miner}
              style={{
                width: width,
                height: heights[index],
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.tagGrey,
                alignItems: "center",
                boxShadow: "0 6px 12px 0 rgba(189, 196, 206, 0.2)",
                overflow: "visible",
                alignSelf: "flex-end",
                marginTop: 8
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  window.open(
                    "https://blocks.fusionnetwork.io/Addresses/" + miner
                  );
                }}
              >
                <Text
                  style={[
                    styles.rowText,
                    { color: colors.linkBlue, marginBottom: 4 }
                  ]}
                >
                  {utils.midHashDisplay(miner)}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.top3Number]}>
                {this.pfsnEarned(count)}
                <Text style={[styles.top3Text]}>PFSN</Text>
              </Text>
              <Text style={[styles.top3Number]}>
                {this.fsnEarned(count)}
                <Text style={[styles.top3Text]}>FSN</Text>
              </Text>
            </View>
          </View>
        );
      }
    }

    return (
      <View
        key="top3"
        style={{
          flex: 1,
          flexDirection: this.stacked ? "column" : "row"
        }}
      >
        {ret}
      </View>
    );
  }

  renderTable() {
    let ret = [];

    let data;
    switch (this.state.cmd) {
      case "Prior Month":
        data = this.state.lastMonth;
        break;
      case "Current Month":
        data = this.state.thisMonth;
        break;
      default:
        data = this.state.lastYear;
        break;
    }

    let index = 1;

    for (let row of data) {
      if (index < 4) {
        index++;
        continue;
      }

      let count, miner

      if ( !row || !row.miner  ) {
        count = 0
        miner = "0x000000000000000000000"
        row = { count , miner }
      } else {
        count = row["count(miner)"];
        miner = row.miner.toLowerCase();  
      }

      if (!this.stacked | (index > 4)) {
        ret.push(
          <View
            key={"sep" + index}
            style={{
              marginTop: 8,
              marginBottom: 8,
              width: this.widthToUse,
              height: 1,
              backgroundColor: "#bdc4ce"
            }}
          />
        );
      } else {
        ret.push(
          <View
            key={"sep1" + index}
            style={{
              marginTop: 8,
              marginBottom: 8,
              width: this.widthToUse,
              height: 1
            }}
          />
        );
      }

      ret.push(
        <View
          key={"se11m"+index}
          style={{
            flex: 1,
            flexDirection: this.stacked ? "column" : "row",
            justifyContent: "flex-start",
            marginBottom: 4
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row"
            }}
          >
            <Text style={[styles.headerText, { width: 32 }]}>{index}</Text>
            <TouchableOpacity
              onPress={() => {
                window.open(
                  "https://blocks.fusionnetwork.io/Addresses/" + miner
                );
              }}
            >
              <Text
                style={[
                  styles.rowText,
                  { color: colors.linkBlue, width: 340, marginRight: 4 }
                ]}
              >
                {miner}
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.rowText,
              {
                textAlign: this.stacked ? "left" : "right",
                width: this.stacked ? 300 : 90,
                marginRight: 4,
                marginLeft: this.stacked ? 32 : 0
              }
            ]}
          >
            {this.pfsnEarned(count)}
            {this.stacked && (
              <Text style={[styles.headerText, { textAlign: "left" }]}>
                P-FSN
              </Text>
            )}
          </Text>
          <Text
            style={[
              styles.rowText,
              {
                textAlign: this.stacked ? "left" : "right",
                width: this.stacked ? 300 : 90,
                marginRight: 4,
                marginLeft: this.stacked ? 32 : 0
              }
            ]}
          >
            {this.fsnEarned(count)}
            {this.stacked && (
              <Text style={[styles.headerText, { textAlign: "left" }]}>
                FSN Earned
              </Text>
            )}
          </Text>
        </View>
      );
      index++;
    }

    return ret;
  }

  pfsnEarned(count) {
    return formatter.format(count * 2.5)
  }

  fsnEarned(count) {
    return formatter.format(count * 0.625)
  }

  componentDidMount() {
    this.intervalTimer = setInterval( ()=> {
        this.updateDimensions()
    }, 250 )

    window.addEventListener("resize", this.updateDimensions);
    this.mounted = true;

    const requestOptions = {
      method: "GET",
      uri: server + "/leaderboard",
      qs: {},
      headers: {
        "X-Content-Type-Options": "nosniff"
      },
      json: true,
      gzip: true
    };

    rp(requestOptions)
      .then(response => {
        if (response) {
          if (this.mounted) {
            this.setState({
              loading: false,
              lastMonth: response.lastMonth,
              lastYear: response.lastYear,
              thisMonth: response.thisMonth
            });
          }
        }
      })
      .catch(err => {
        console.log("API call error:", err.message);
        this.setState({
          error: "Unable to load, please refresh the page",
          loading: false
        });
      });
  }

  updateDimensions() {
    let newWidth = parseInt(Dimensions.get("window").width)
    if ( newWidth !== this.state.width ) {
      this.setState({ width: newWidth });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener("resize", this.updateDimensions);
    if ( this.intervalTimer ) {
      clearInterval( this.intervalTimer )
      this.intervalTimer = undefined
    }
  }
}

styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 32,
    height: "100%",
    width: "100%"
  },
  subContainer: {
    flex: 1,
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.white
  },
  titleText: {
    fontFamily: constants.fontFamily,
    fontSize: 32,
    color: colors.textBlue,
    fontWeight: constants.boldFont,
    marginBottom: 16
  },
  headerText: {
    fontFamily: constants.fontFamily,
    fontSize: 13,
    color: colors.labelGrey,
    fontWeight: constants.mediumFont,
    backgroundColor: colors.white,
    padding: 4
  },
  rowText: {
    fontFamily: constants.fontFamily,
    fontSize: 14,
    color: colors.labelGrey,
    fontWeight: constants.mediumFont,
    backgroundColor: colors.white,
    padding: 4
  },
  top3Number: {
    fontFamily: constants.fontFamily,
    fontSize: 16,
    color: colors.darkBlue,
    fontWeight: constants.boldFont,
    padding: 4
  },
  top3Text: {
    fontFamily: constants.fontFamily,
    fontSize: 12,
    color: colors.darkBlue,
    fontWeight: constants.mediumFont,
    padding: 4
  },
  youStakeRowText: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 16
  },
  youStakeText: {
    fontFamily: constants.fontFamily,
    fontSize: 20,
    color: colors.white,
    width: 240,
    fontWeight: constants.mediumFont
  },
  youStakeForText: {
    fontFamily: constants.fontFamily,
    fontSize: 20,
    color: colors.white,
    fontWeight: constants.mediumFont
  },
  youReceiveText: {
    fontFamily: constants.fontFamily,
    fontSize: 18,
    color: colors.white,
    fontWeight: constants.mediumFont
  },
  smallLabelText: {
    fontFamily: constants.fontFamily,
    fontSize: 12,
    color: colors.white,
    fontWeight: constants.mediumFont
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
    color: colors.white,
    fontWeight: constants.boldFont
  },
  calcLabelText: {
    fontFamily: constants.fontFamily,
    fontSize: 24,
    color: colors.white,
    fontWeight: constants.mediumFont,
    width: 200
  },
  calcAmountText: {
    fontFamily: constants.fontFamily,
    fontSize: 24,
    color: colors.white,
    fontWeight: constants.mediumFont,
    width: 200
  },
  calcReturnText: {
    fontFamily: constants.fontFamily,
    fontSize: 24,
    color: colors.white,
    fontWeight: constants.mediumFont
  },
  youStakeRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  stakeQuantityInput: {
    width: 200,
    borderColor: colors.orderGrey,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1,
    fontSize: 18,
    fontFamily: constants.mediumFont,
    color: colors.labelGrey,
    height: 48,
    textAlign: "right",
    paddingRight: 4,
    paddingLeft: 4,
    outline: "none",
    alignSelf: "flex-start"
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
    padding: 8
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
