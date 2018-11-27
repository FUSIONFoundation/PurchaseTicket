import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  AsyncStorage,
  TouchableOpacity,
  TextInput
} from "react-native";

import "../App.css";
import history from "../history.js";
import colors from "./colors";
import constants from "./constants";
import currentDataState from "../api/currentDataState";
import "font-awesome/css/font-awesome.min.css";
import web3 from '../api'
var styles;

var currentNodeAddress;

var NODESELECT_WIDTH = 168
var NODESELECT_HEIGHT  = 44

export default class NodeSelect extends Component {
    state = {
        currentNodeAddress : null,
        initedNode : false,
        currentNodeAddress : null,
        newNodeAddress : null,
        error : "bad thing happen"
    }

    constructor(props) {
        super(props);

        AsyncStorage.getItem( "lastNodeAddress").then( (val)=>{
            if ( this.didOneUpdate ) {
                if ( !val ) {
                    val = "";
                }
                this.setState( {  newNodeAddress : val , currentNodeAddress : val, initedNode : true } )
            } else {
                this.state.currentNodeAddress = val
                this.state.newNodeAddress = val;
                this.state.initedNode = true
            }
        }).catch( (e) => {
            let val = "";
            if ( this.didOneUpdate ) {
                this.setState( { newNodeAddress : val , currentNodeAddress : null, initedNode : true } )
            } else {
                this.state.currentNodeAddress = null
                this.state.initedNode = true
                this.state.newNodeAddress = val
            }
        })
    }

    componentDidUpdate(prevProps) {
        this.didOneUpdate = true;
    }

    render() {
        currentNodeAddress = AsyncStorage.getItem( "lastNodeAddress")

        if ( this.state.error  ) {
            return <TouchableOpacity onPress={ ()=> {
                    this.setState( { error : undefined } )
            }}>
             <View style={styles.errorBackground}> 
                <Text style={styles.errorText}>{this.state.error}</Text>
                </View>
            </TouchableOpacity>
        }

        if ( this.state.inputNodeMode ) {
            return <View style={styles.inputBackground}> 
            <TextInput
            style={styles.nodeInput}
            placeholder="http(s):// or ws(s):// address:port"
            autoCorrect={false}
            placeholderTextColor={colors.orderGrey}
            maxLength={128}
            value = {this.state.newNodeAddress}
            onChangeText={ (val)=> {
                this.setState( { newNodeAddress : val } )
            }}
            autoFocus={true}
            onBlur={()=>{
                this.setState( { inputNodeMode : false } )
            }}
            handlekeydown={(a)=>{
                this.setState( { inputNodeMode : false } )
                if ( a.keyCode = 27 ) {
                    alert("escape the node")
                }
            }}
            onKeyPress={(a)=>{
                if ( a.charCode === 13 ) {
                    if ( this.state.newNodeAddress ) {
                        this.setState(  { testNode : true  } )
                    } else {
                        this.setState( { inputNodeMode : false } )
                    }
                }
            }}
          />
            </View>
        }

        if ( !this.state.currentNodeAddress  ) {
            return <TouchableOpacity onPress={ ()=> {
                    this.setState( { inputNodeMode : true } )
            }}>
             <View style={styles.inputBackground}> 
                <Text style={styles.selectNode}>Select Node</Text>
                </View>
            </TouchableOpacity>
        }
        return <Text>{this.state.currentNodeAddress}</Text>
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
      width: "100%"
    },
    errorBackground : {
        width: NODESELECT_WIDTH,
        height : NODESELECT_HEIGHT,
        borderRadius: 3,
        backgroundColor: colors.errorRed,
        flex: 1,
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: "auto",
        justifyContent : 'center',
        alignItems : 'center',
        justifyContent : 'center',
    }, 
    errorText : {
        fontSize: 12,
        fontFamily: constants.mediumFont,
        color: colors.white,
    },
    nodeInput : {
        borderColor: colors.orderGrey,
        borderRadius: 3,
        backgroundColor: "white",
        borderWidth: 1,
        fontSize: 12,
        fontFamily: constants.mediumFont,
        color: colors.labelGrey,
        width : NODESELECT_WIDTH - 32,
        height : NODESELECT_HEIGHT - 12,
        outline: "none",
        paddingLeft : 4,
        paddingRight : 4,
        //clearButtonMode : 'always'
    },
    inputBackground : {
        width: NODESELECT_WIDTH,
        height : NODESELECT_HEIGHT,
        borderRadius: 3,
        backgroundColor: colors.linkBlue,
        flex: 1,
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: "auto",
        justifyContent : 'center',
        alignItems : 'center',
        justifyContent : 'center',
    },
    selectNode: {
        fontSize: 14,
        fontFamily: constants.fontFamily,
        fontWeight: constants.regularFont,
        color: colors.white,
        backgroundColor: colors.linkBlue,
        textAlign: "center",
      },
})