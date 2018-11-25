import React, { Component } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import colors from "../colors.js";
import constants from "../constants.js";

var styles;

var checkOn = require("../../images/check_on.svg");
var checkOff = require("../../images/check_off.svg");

export default class CheckBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textWidth: this.props.textWidth || 620
    };
  }

  render() {
    return (
      <View
        style={[
          styles.container,
          { width: this.state.textWidth}
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            this.props.onPress(!this.props.on);
          }}
        >
          <View style={styles.containerInner}>
            <Image
              source={this.props.on ? checkOn : checkOff}
              style={styles.checkOn}
            />
            <View>
              <Text style={styles.questionText}>{this.props.text}</Text>

              {this.props.subText && (
                <Text
                  style={[
                    styles.questionSubText
                    ,
                    { width: this.state.textWidth }
                  ]}
                >
                  {this.props.subText}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: "transparent",
    marginTop: 10
  },
  containerInner: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "auto",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: "transparent"
  },
  checkOn: {
    marginRight: 15,
    width: 20,
    height: 20
  },
  questionText: {
    fontSize: 14,
    color: colors.textBlue,
    fontFamily: constants.fontFamily,
    fontWeight: constants.mediumFont,
    marginBottom : 6
  },
  questionSubText: {
    fontSize: 14,
    color: colors.labelGrey,
    fontFamily: constants.fontFamily,
    fontWeight: constants.mediumFont,
    marginBottom: 16
  }
});
