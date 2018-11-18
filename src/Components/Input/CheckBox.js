import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'

var styles;

var checkOn = require("../../images/check_on.svg");
var checkOff = require("../../images/check_off.svg");

export default class CheckBox extends Component {

    render() {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {
                    this.props.onPress( !this.props.on );
                }}>
                    <View style={styles.containerInner}>
                        <Image source={this.props.on?checkOn:checkOff} style={styles.checkOn} />
                        <Text style={styles.questionText}>{this.props.text}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}

styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 'auto',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
        marginTop: 10,
    },
    containerInner: {
        flex: 1,
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 'auto',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'transparent',
        width : 400,
    },
    checkOn : {
        marginRight : 15, 
        width: 20, 
        height: 20 
    },
    questionText: {
        fontSize: 14,
        color: 'rgba(22,22,22,.5)',
        width: 400,
    },
    labelHint: {
        fontSize: 12,
        color: 'rgba(22,22,22,.5)',
        marginLeft: 10,
    },
    textInput: {
        width: 200,
        height: 30,
        backgroundColor: 'lightgray',
        borderColor: 'black',
        borderWidth: 1,
        padding: 5,

    },
    yesnodiv: {
        flex: 1,
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 'auto',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 10,
    }
});