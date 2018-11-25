import React, { Component } from "react";
import {
  Text,
  StyleSheet,
  AsyncStorage
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

export default class NodeSelect extends Component {
    state = {
        currentNodeAddress : null,
        initedNode : false
    }

    constructor(props) {
        super(props);

        AsyncStorage.getItem( "lastNodeAddress").then( (val)=>{
            if ( this.didOneUpdate ) {
                this.setState( { currentNodeAddress : val, initedNode : true } )
            } else {
                this.state.currentNodeAddress = val
                this.state.initedNode = true
            }
        }).catch( (e) => {
            if ( this.didOneUpdate ) {
                this.setState( { currentNodeAddress : null, initedNode : true } )
            } else {
                this.state.currentNodeAddress = null
                this.state.initedNode = true
            }
        })
    }

    componentDidUpdate(prevProps) {
        this.didOneUpdate = true;
    }

    render() {
        currentNodeAddress = AsyncStorage.getItem( "lastNodeAddress")
        return <Text>Select NODE</Text>
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
})