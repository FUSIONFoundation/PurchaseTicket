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
var web3api = currentDataState.web3api
var styles;

var currentNodeAddress;

var NODESELECT_WIDTH = 180;
var NODESELECT_HEIGHT = 44;

export default class NodeSelect extends Component {
  state = {
    initedNode: false,
    currentNodeAddress: null,
    newNodeAddress: "",
    error:  null,
    testing: false
  };

  constructor(props) {
    super(props);

    this.connectionListener  = this.connectionListener.bind( this )

    var val = window.localStorage.getItem( "address1" )
    var error = null
    {
          debugger
          if ( !error ) {
            if (this.didOneUpdate) {
            if (!val) {
                val = "";
            }
            this.setState({
                newNodeAddress: val,
                currentNodeAddress: val,
                initedNode: true
            });
            } else {
            if (!val) {
                val = "";
            }
            this.state.currentNodeAddress = val;
            this.state.newNodeAddress = val;
            this.state.initedNode = true;
            }
            return
        }
    
        val = "";
        if (this.didOneUpdate) {
          this.setState({
            newNodeAddress: val,
            currentNodeAddress: null,
            initedNode: true
          });
        } else {
          this.state.currentNodeAddress = null
          this.state.initedNode = true
          this.state.newNodeAddress = val
          this.state.inputNodeMode = false
          this.state.connectionError = false
        }
      }
  }

  componentDidUpdate(prevProps) {
    this.didOneUpdate = true;
  }

  connectionListener( arg , e ) {
    console.log("CONNECTION EVENTS FIRING AWAY", arg)
    if ( this.state.testing ) {
        if ( arg[0] === 'error' ) {
            alert( "Unable to connect to " + this.state.newNodeAddress)
            this.setState( { testing : false })
        }
        if ( arg[0] === 'connected' ) {
            this.setState( { connectionError : false, testing : false, currentNodeAddress : this.state.newNodeAddress  })
            window.localStorage.setItem( "address1", this.state.newNodeAddress )
        }
    } else {
        if ( arg[0] === 'error' ) {
            this.state( { connectionError : true })
        }
    }
  }

  setNodeAddress( address ) {
    web3api.setNodeAddress( address )
  }

  componentDidMount() {
    web3api.on( "connectstatus" , this.connectionListener  );
    if ( this.state.newNodeAddress && !this.state.testing ) {
        web3api.setNodeAddress( this.state.newNodeAddress )
    }
  }

  componentWillUnmount() {
    web3api.removeEventListener( "connectstatus" , this.connectionListener  );
  }

  render() {
    currentNodeAddress = AsyncStorage.getItem("lastNodeAddress");

    if (this.state.testing) {
      let nodeString = this.state.newNodeAddress;
      if (nodeString.length > 18) {
        nodeString = nodeString.substr(0, 15) + "..."
      }
      return (
        <View style={styles.testingBackground}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Text style={[styles.testingNode, { marginRight: 4 }]}>
              {nodeString}
            </Text>
            <ActivityIndicator animating={true} />
          </View>
        </View>
      );
    }

    if (this.state.error) {
      return (
        <TouchableOpacity
          onPress={() => {
            this.setState({ error: undefined });
          }}
        >
          <View style={styles.errorBackground}>
            <Text adjustsFontSizeToFit={true} style={styles.errorText}>
              {this.state.error}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (this.state.inputNodeMode) {
      return (
        <View style={styles.inputBackground}>
          <TextInput
            style={styles.nodeInput}
            placeholder="http(s):// or ws(s):// address:port"
            autoCorrect={false}
            placeholderTextColor={colors.orderGrey}
            maxLength={128}
            value={this.state.newNodeAddress}
            clearButtonMode="always"
            onChangeText={val => {
              this.setState({ newNodeAddress: val });
            }}
            autoFocus={true}
            onBlur={() => {
              this.setState({ inputNodeMode: false });
            }}
            onKeyPress={a => {
              if (a.charCode === 13) {
                if (this.state.newNodeAddress) {
                  this.setState({ testing: true , connectionError : false });
                  this.setNodeAddress( this.state.newNodeAddress )
                } else {
                  this.setState({ inputNodeMode: false });
                }
              }
            }}
          />
        </View>
      );
    }

    if (!this.state.currentNodeAddress) {
      return (
        <TouchableOpacity
          onPress={() => {
            this.setState({ inputNodeMode: true });
          }}
        >
          <View style={styles.inputBackground}>
            <Text style={styles.selectNode}>Select Node</Text>
          </View>
        </TouchableOpacity>
      );
    }

    let nodeString = this.state.currentNodeAddress;
    if (nodeString.length > 18) {
      nodeString = nodeString.substr(0, 15) + "..."
    }

     return (
        <View style={styles.inputBackground}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Text style={[styles.testingNode, { marginRight: 4 }]}>
              {nodeString}
            </Text>
          </View>
          </View>
        )
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
  errorBackground: {
    width: NODESELECT_WIDTH,
    height: NODESELECT_HEIGHT,
    borderRadius: 3,
    backgroundColor: colors.errorRed,
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "auto",
    justifyContent: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  errorText: {
    fontSize: 12,
    fontFamily: constants.mediumFont,
    color: colors.white
  },
  nodeInput: {
    borderColor: colors.orderGrey,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1,
    fontSize: 12,
    fontFamily: constants.mediumFont,
    color: colors.labelGrey,
    width: NODESELECT_WIDTH - 32,
    height: NODESELECT_HEIGHT - 12,
    outline: "none",
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 4,
    paddingBottom: 4
    //clearButtonMode : 'always'
  },
  inputBackground: {
    width: NODESELECT_WIDTH,
    height: NODESELECT_HEIGHT,
    borderRadius: 3,
    backgroundColor: colors.linkBlue,
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "auto",
    justifyContent: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  testingNode : {
    fontSize: 12,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.black,
    textAlign: "center"
  },
  testingBackground : {
    width: NODESELECT_WIDTH,
    height: NODESELECT_HEIGHT,
    borderRadius: 3,
    backgroundColor: colors.lightSuccessGreen,
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "auto",
    justifyContent: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  selectNode: {
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.white,
    backgroundColor: colors.linkBlue,
    textAlign: "center"
  }
});
