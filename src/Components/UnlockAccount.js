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
import moment from "moment";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";
import currentDataState from "../api/currentDataState";

var styles;

let radioOn = require("../images/radio_on.svg");
let radioOff = require("../images/radio_off.svg");

export default class UnlockAccount extends Component {
  state = {
    accessViaPrivateKey: false
  };

  render() {
    let accessViaPrivateKey = this.state.accessViaPrivateKey;

    return (
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Access Your Wallet</Text>
        </View>
        <View style={styles.accessBox}>
          <Text style={styles.textHowToAccess}>
            How would you like to access your wallet?
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableHighlight
              onPress={() => {
                this.setState({ accessViaPrivateKey: !accessViaPrivateKey });
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={!accessViaPrivateKey ? radioOn : radioOff}
                  resizeMode="contain"
                  style={{ width: 14, height: 14 }}
                />
                <Text style={styles.radioSelectionText}>
                  Keystore / JSON File
                </Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={() => {
                this.setState({ accessViaPrivateKey: !accessViaPrivateKey });
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={accessViaPrivateKey ? radioOn : radioOff}
                  resizeMode="contain"
                  style={{ width: 14, height: 14 }}
                />
                <Text style={styles.radioSelectionText}>Private Key</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={styles.selectionBox} >
          </View>
          <TouchableHighlight
            onPress=
            {() => {
              alert("unlock")
            }}>
            <View>
            <Text style={styles.unlockWalletButton}>Unlock Wallet</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "auto",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%"
  },
  innerContainer: {
    width: 620,
    flexGrow: 1,
    flex: 1,
    flexShrink: "auto",
    justifyContent: "center",
    alignItems: "flex-start"
  },
  title: {
    fontSize: 24,
    fontFamily: constants.fontFamily,
    fontWeight: constants.boldFont,
    color: colors.textBlue,
    marginTop: 35,
    alignSelf: "flex-start",
    marginBottom: 16
  },
  textHowToAccess: {
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.textBlue,
    alignSelf: "flex-start",
    marginBottom: 16
  },
  radioSelectionText: {
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.textBlue,
    marginRight: 16,
    marginLeft: 8
  },
  accessBox: {
    borderColor: colors.orderGrey,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1,
    alignItems: "flex-start",
    width: 620,
    overflow: "visible",
    boxShadow: "0 2px 0 0 rgba(189, 196, 206, 0.2)",
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 32,
    paddingRight: 32
  },
  selectionBox: {
    borderColor: colors.orderGrey,
    borderRadius: 3,
    backgroundColor: colors.backgroundGrey,
    borderWidth: 1,
    width: 556,
    alignItems: "flex-start",
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 20
  },
  unlockWalletButton: {
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
  }
});
