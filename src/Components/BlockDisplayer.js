import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  AsyncStorage,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from "react-native";

import "../App.css";
import history from "../history.js";
import colors from "./colors";
import constants from "./constants";
import currentDataState from "../api/currentDataState";
import "font-awesome/css/font-awesome.min.css";
var web3api = currentDataState.web3api;

export default class BlockDisplayer extends Component {
  constructor(props) {
    super(props);
    this.lastestBlockListener = this.lastestBlockListener.bind(this);
    this.state = {};
    this.state.block = null;
    this.state.expand = false;
  }
  render() {
    let block = this.props.block || this.state.block;

    if (!block) {
      return <Text>Lastest Block Will Display Here</Text>;
    }

    if (!this.state.expand) {
      return (
        <TouchableOpacity
          onPress={() => {
            this.setState({ expand: true });
          }}
        >
          <View style={styles.stakeDetailBox}>
            <Text>
              Latest Block Number = {block.number}
              <i
                style={{ color: colors.textBlue, marginLeft: 4 }}
                className="fa fa-caret-down"
              />
            </Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          onPress={() => {
            this.setState({ expand: false });
          }}
        >
          <View style={styles.stakeDetailBox}>
            <Text>
              Latest Block Number = {block.number}
              <i
                style={{ color: colors.textBlue, marginLeft: 4 }}
                className="fa fa-caret-up"
              />
            </Text>
            <View style={styles.orderBorder} />
            <View style={styles.blockDetailRow}>
              <Text style={styles.labelLineText}>Time Stamp</Text>
              <Text style={styles.stakeTextFSN}>{block.timestamp}</Text>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.blockDetailRow}>
              <Text style={styles.labelLineText}>Hash</Text>
              <Text style={styles.stakeTextFSN}>{block.hash}</Text>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.blockDetailRow}>
              <Text style={styles.labelLineText}>Parent Hash</Text>
              <Text style={styles.stakeTextFSN}>{block.parentHash}</Text>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.blockDetailRow}>
              <Text style={styles.labelLineText}>Miner</Text>
              <Text style={styles.stakeTextFSN}>{block.miner}</Text>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.blockDetailRow}>
              <Text style={styles.labelLineText}>Nonce</Text>
              <Text style={styles.stakeTextFSN}>{block.nonce}</Text>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.blockDetailRow}>
              <Text style={styles.labelLineText}>Size</Text>
              <Text style={styles.stakeTextFSN}>{block.size}</Text>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.blockDetailRow}>
              <Text style={styles.labelLineText}>Gas Used:</Text>
              <Text style={styles.stakeTextFSN}>{block.gasUsed}</Text>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.blockDetailRow}>
              <Text style={styles.labelLineText}>Gas Limit:</Text>
              <Text style={styles.stakeTextFSN}>{block.gasLimit}</Text>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.blockDetailRow}>
              <Text style={styles.labelLineText}>Transactions #:</Text>
              <Text style={styles.stakeTextFSN}>
                {block.transactions.length}
              </Text>
            </View>
            <View style={styles.orderBorder} />
            <View style={styles.blockDetailRow}>
              <Text style={styles.labelLineText}>Total Difficulty:</Text>
              <Text style={styles.stakeTextFSN}>{block.totalDifficulty}</Text>
            </View>
            <View style={styles.orderBorder} />
          </View>
        </TouchableOpacity>
      );
    }
  }

  lastestBlockListener(block) {
    this.setState({ block });
  }

  componentDidMount() {
    if (!this.props.block) {
      web3api.on("latestBlock", this.lastestBlockListener);
    }
  }

  componentWillUnmount() {
    if (!this.props.block) {
      web3api.removeEventListener("latestBlock", this.lastestBlockListener);
    }
  }
}

var styles = StyleSheet.create({
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
  labelLineText: {
    fontSize: 12,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.labelGrey
  },
  stakeTextFSN: {
    fontFamily: constants.fontFamily,
    fontSize: 12,
    fontWeight: constants.regularFont,
    marginLeft: 4
  },
  stakeTextVal: {
    fontSize: 18,
    fontFamily: constants.fontFamily,
    fontWeight: constants.boldFont,
    alignSelf: "flex-end",
    color: colors.textBlue
  },
  blockDetailRow: {
    flex: 1,
    flexBasis: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44
  },
  orderBorder: {
    backgroundColor: colors.orderGrey,
    height: 1,
    width: 556
  }
});
