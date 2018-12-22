import React, { Component } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import colors from "../colors";
import constants from "../constants";
import NodeSelect from "../NodeSelect.js"

var fusionLogo = require("../../images/explorer-logo.svg");
var boxes = require("./9Boxes.svg");


let glb_appSelect
let glb_header

export default class Header extends Component {
 
  constructor(props) {
    super(props)
    glb_header = this
    this.state = {
      appSelectOpen : false
    }
  }

  static setAppDisplay( appdisplay ) {
    glb_appSelect = appdisplay
  }
  static hideAppDisplay() {
      glb_appSelect.setState( { appSelectOpen : false })
      glb_header.setState( { appSelectOpen : false })
  }

  render() {
    let width = this.props.titleWidth || 150;
    let appBKColoor = this.state.appSelectOpen ? colors.backgroundGrey : colors.white
    return (
      <View style={styles.container}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center"
          }}
        >
          <Image
            source={fusionLogo}
            resizeMode="contain"
            style={{ marginLeft: 80, width: 129, height: 29 }}
          />
          <TouchableOpacity onPress={()=>{
            glb_appSelect.setState( { appSelectOpen : !this.state.appSelectOpen })
            this.setState( { appSelectOpen : !this.state.appSelectOpen })
          }}>
            <View style={[styles.appSelect, { backgroundColor: appBKColoor, width: width }]}>
              <Image
                source={boxes}
                resizeMode="contain"
                style={{ marginLeft: 8, width: 18, height: 18 }}
              />
              <Text style={styles.titleAutoBuy}>{this.props.title}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.programVersion}>{this.props.version}</Text>
        </View>
        {/* <View style={styles.nodeSelectBox}>
            <NodeSelect/>
        </View> */}
        {this.props.nodeSelect && (  <View style={styles.nodeSelectBox}>
            <NodeSelect/>
        </View>) }
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    height: 72,
    width: "100%",
    backgroundColor: colors.white,
    overflow: "visible",
    boxShadow: "inset 0 -1px 0 0 #bdc4ce"
  },
  appSelect: {
    height: 40,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: 16,
    overflow: "visible",
    boxShadow: "inset 0 -1px 0 0 #bdc4ce",
    borderWidth: 1,
    borderRadius: 3,
    borderColor: colors.orderGrey
  },
  popupMenuBox : {
    backgroundColor : colors.primaryBlue,
    width : 224,
    boxShadow: "0 8px 16px 0 rgba(0, 15, 33, 0.16), 0 0 8px 0 rgba(0, 15, 33, 0.08);",
    borderWidth: 1,
    borderRadius: 3,
    borderColor: colors.orderGrey,
    position : 'absolute',
    top : 64,
    left: 224,
    padding : 16
  },
  borderTitle: {
    width: 0.9,
    backgroundColor: colors.grey,
    height: 19,
    marginLeft: 14,
    marginRight: 14
  },
  titleAutoBuy: {
    fontFamily: constants.fontFamily,
    fontSize: 16,
    fontWeight: constants.boldFont,
    marginLeft: 8,
    color: colors.textBlue
  },
  programVersion: {
    fontFamily: constants.fontFamily,
    fontSize: 12,
    fontWeight: constants.regularFont,
    color: colors.textBlue,
    padding: 2,
    marginLeft: 16,
    backgroundColor: colors.grey
  },
  nodeSelectBox: {
    alignSelf: "center",
    marginRight: 32,
    marginLeft: 32
  }
});
