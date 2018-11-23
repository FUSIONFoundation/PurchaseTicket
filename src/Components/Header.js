import React, { Component } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import colors from "./colors";
import constants from "./constants";
import utils from "../utils";
var fusionLogo = require("../images/explorer-logo.svg")

export default class Header extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Image source={fusionLogo} resizeMode="contain" style={{marginLeft:80,width:129,height:29}}/>
        <Text style={styles.titleAutoBuy}>Auto Buy Stake</Text>
        <Text style={styles.programVersion}>1.00.00</Text>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexDirection: "row",
    flexBasis: "auto",
    justifyContent: "flex-start",
    alignItems: "center",
    height: 72,
    width: "100%",
    backgroundColor: colors.white,
    overflow: "visible",
    boxShadow: "inset 0 -1px 0 0 #bdc4ce"
  },
  borderTitle : {
    width : .9,
    backgroundColor : colors.grey,
    height : 19,
    marginLeft : 14,
    marginRight : 14
  },
  titleAutoBuy: {
    fontFamily: constants.fontFamily,
    fontSize: 22,
    fontWeight: constants.boldFont,
    marginLeft : 15
  },
  programVersion: {
    fontFamily: constants.fontFamily,
    fontSize: 12,
    fontWeight: constants.regularFont,
    color : colors.textBlue,
    padding : 1 ,
    marginLeft : 8,
    backgroundColor : colors.grey
  }
});
