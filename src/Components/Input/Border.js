import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native'

var styles;

export default class Border extends Component {

    render() {
        return (
            <View style={styles.border}/>
        );
    }
}

styles = StyleSheet.create({
    border : { 
        marginTop :10,
        height : 1,
        transform : 'scaleY(.2)',
        width : 600,
        backgroundColor : 'rgb(128,128,128)'
    }
});