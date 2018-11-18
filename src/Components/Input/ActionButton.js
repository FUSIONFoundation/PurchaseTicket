import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';


var styles;

export default class ActionButton extends Component {

    render() {
        return (
            <TouchableOpacity disabled={this.props.disabled} style={{ marginLeft: 35 }} onPress={this.props.onPress}>
                <View style={this.props.buttonStyle||styles.actionButton}>
                    <Text style={this.props.buttonTextStyle||styles.actionButtonText}>{this.props.text}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}


styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 'auto',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
        marginTop: 10,
    },
    actionButton: {
        backgroundColor: '#2C3F54',
        borderRadius: 8,
        height: 35,
        //width: 'auto',
        color: '#9bb2cb',
        width: 130,
        overflow: 'hidden',
    },
    actionButtonText : {
        backgroundColor : '#2C3F54',
        color : '#9bb2cb',
        fontSize : 19,
        marginTop : 7,
        textAlign: 'center'
      }
});