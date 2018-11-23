import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'

var styles;

var radioOn = require("../../images/radio_on.svg");
var radioOff = require("../../images/radio_off.svg");

export default class YesNoQuestion extends Component {



    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.questionText}>{this.props.text}</Text>
                <View style={styles.yesnodiv}>
                    <TouchableOpacity onPress={() => {
                        this.props.onChange("yes");
                    }}>
                        <View style={styles.checkTextArea}>
                        <Image source={this.props.value==='yes'?radioOn:radioOff} style={{marginRight:5,width:20,height:20}}/>
                            <Text>Yes</Text>
                        </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => {
                        this.props.onChange("no");
                    }}>
                        <View style={styles.checkTextArea}>
                            <Image source={this.props.value==='no'?radioOn:radioOff}  style={{marginRight:5,width:20,height:20}}/>
                            <View>
                            <Text>No</Text>
                        </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}


styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow : 1,
        flexShrink : 0,
        flexBasis : 'auto',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
        marginTop: 10,
    },
    checkTextArea : {
        flex: 1,
        flexGrow : 1,
        flexShrink : 0,
        flexBasis : 'auto',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginRight: 10,
    },
    questionText: {
        fontSize: 14,
        color: 'rgba(22,22,22,.5)',
        width: 400,
        fontFamily : "'Roboto', sans-serif"
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
    yesnodiv : {
        flex: 1,
        flexGrow : 1,
        flexShrink : 0,
        flexBasis : 'auto',
        flexDirection : 'row',
        justifyContent : 'flex-start',
        alignItems : 'center',
        marginTop : 10,
    }
});