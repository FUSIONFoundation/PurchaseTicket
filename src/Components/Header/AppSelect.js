import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity
} from "react-native";
import colors from "../colors";
import constants from "../constants";
import NodeSelect from "../NodeSelect";
import Header from "./Header";

var fusionLogo = require("../../images/explorer-logo.svg");
var wallet = require("./wallet.svg");
var asset = require("./asset.svg");
var autobuy = require("./autobuy.svg");
var block = require("./block.svg");
var network = require("./network.svg");
var swap = require("./swap.svg");

class SelectItem extends Component {
    state = {
        hover : false
    }
    render( ) {
        let bkc = this.state.hover ? colors.backgroundGrey : colors.white

        return (
            <TouchableOpacity onPress={()=>{

                window.open( this.props.link )
                Header.hideAppDisplay()
            }}>
            <View  onMouseEnter={()=>{
                this.setState( { hover : true } )
            }}
            onMouseLeave={()=>{
                this.setState( { hover : false } )
            }}
             style={{flex:1,flexDirection:'row',alignItems:'center',
             marginBottom : 16,
             justifyContent:'flex-start', backgroundColor : bkc}}>
                 <Image
                source={this.props.image}
                resizeMode="contain"
                style={{marginRight : 16, width: 14, height: 14 }}
              />
                <Text style={styles.selectItemText}>{this.props.text}</Text>
            </View>
            </TouchableOpacity>
        )
    }
}
export default class AppSelect extends Component {
 
  constructor( props ) {
      super(props)
      this.state = {
        appSelectOpen: false
      };
      Header.setAppDisplay(this)
  }
  render() {
    if ( !this.state.appSelectOpen ) {
        return  <View></View>;
    }
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Header.hideAppDisplay()
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.popupMenuBox}>
            <Text style={styles.appsText}>Apps</Text>
            <SelectItem image={wallet} text="My Wallet" link="https://www.myfusionwallet.com"/>
            <SelectItem image={asset} text="Asset Gateway" link="https://assetgateway.fusionnetwork.io"/>
            <SelectItem image={autobuy} text="Auto Buy Stake" link="https://tickets.fusionnetwork.io"/>
            <SelectItem image={block} text="Block Explorer" link="https://blocks.fusionnetwork.io"/>
            <SelectItem image={network} text="Network Monitor" link="https://node.fusionnetwork.io"/>
            <SelectItem image={swap} text="Quantum Swap" link="https://swap.fusionnetwork.io"/>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

var styles = StyleSheet.create({
  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0)"
  },
  popupMenuBox: {
    backgroundColor: colors.white,
    width: 224,
    boxShadow:
      "0 8px 16px 0 rgba(0, 15, 33, 0.16), 0 0 8px 0 rgba(0, 15, 33, 0.08);",
    borderWidth: 1,
    borderRadius: 3,
    borderColor: colors.orderGrey,
    position: "absolute",
    top: 64,
    left: 224,
    padding: 16
  },
  selectItemText : {
    fontFamily: constants.fontFamily,
    fontSize: 14,
    fontWeight: constants.boldFont,
    color: colors.textBlue,
  },
  appsText : {
    fontFamily: constants.fontFamily,
    fontSize: 14,
    fontWeight: constants.regularFont,
    color: colors.labelGrey,
    marginBottom : 16
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
