import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import ActionButton from "./Input/ActionButton.js";
import "../App.css";
import history from "../history.js";
import YesNoQuestion from "./Input/YesNoQuestion.js";
import InputField from "./Input/InputField.js";
import Border from "./Input/Border.js";
import ImageUpload from "./Input/ImageUpload.js";
import CheckBox from "./Input/CheckBox.js";

var styles;

class UserInfo extends Component {
  // this is what i use for production
  state = {
    data: {
        walletAddress: "0x",
        balanceOfFSN: 0,
        numberOfTickets: 1,
        autoBuy: false,
        autoReinvest : true,
    }
  };

  // this is my test state
  // name state above old state, and name this state
  oldstate = {
    data: {
      walletAddress: "0x",
      balanceOfFSN: 0,
      numberOfTickets: 1,
      autoBuy: false,
      autoReinvest : true,
    }
  };

  constructor(props) {
    super();
    this.editCallBack = this.editCallBackFunc.bind(this);
  }

  editCallBackFunc(key, value) {
    let newData = Object.assign(this.state.data, {});

    newData[key] = value;

    this.setState({ data: newData });
  }

  render() {
    let disabled = false;
    let data = this.state.data;

    //lets run through all the data and see if we are ready
    for (let key in data) {
      let val = data[key];
      if (!val) {
        disabled = true;
        break;
      }
    }

    if (!disabled) {
      // check email
      // eslint-disable-next-line
      let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      disabled = !re.test(data.email);
    }

    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Buy Ticket</Text>
        <Border />
        <Text style={styles.sectionNumberTitle}>Please enter:</Text>
        <InputField
          type="text"
          cbkey="walletAddress"
          text="Wallet Address:"
          value={data.walletAddress}
          min={42}
          onChange={this.editCallBack}
          required={true}
        />
        <Text style={styles.label}>Balance of FSN</Text>
        <View
          style={styles.balanceBox}
        >
          <Text>0</Text>
          <Text>&nbsp;</Text>
          <Text>FSN</Text>
        </View>
        <InputField
          type="number"
          cbkey="numberOfTickets"
          text="Number To Buy"
          value={data.numberOfTickets}
          onChange={this.editCallBack}
          required={true}
        />
        <Text style={styles.label}>Tickets @ x FSN Per Ticket, Y gas </Text>
        <CheckBox
          text="Auto Buy"
          on={data.autoBuy}
          onPress={on => {
            this.editCallBackFunc("autobuy", on);
          }}
        />
            <CheckBox
          text="Auto Reinvest Reward"
          on={data.autoReinvest}
          onPress={on => {
            this.editCallBackFunc("autoReinvest", on);
          }}
        />
        <InputField
          type="date"
          cbkey="dos"
          text="Stop Date"
          value={data.dos}
          onChange={this.editCallBack}
          required={false}
        />

        
        <View style={{ height: 30, width: 1 }} />
        <ActionButton
          disabled={disabled}
          text="BUY TICKET"
          buttonStyle={
            disabled ? styles.actionButtonDisabled : styles.actionButton
          }
          buttonTextStyle={
            disabled ? styles.actionButtonTextDisabled : styles.actionButtonText
          }
          onPress={() => {
            alert("send data to an application/data is in the console");
            // remember you can use history.push
            // to move around
            //
          }}
        />
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
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: "transparent",
    marginLeft: 35,
    marginTop: 15
  },
  sectionTitle: {
    fontSize: 28,
    color: "rgba(22,22,22, .5)"
  },
  sectionNumberTitle: {
    fontSize: 18,
    color: "rgb(22,22,22)",
    marginTop: 30,
    marginBottom: 10
  },
  info: {
    fontSize: 16,
    color: "rgba(22,22,22, .5)"
  },
  imageUploadSection: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "auto",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: "transparent",
    marginLeft: 35,
    marginTop: 15
  },
  actionButtonDisabled: {
    backgroundColor: "#20C0FF",
    height: 35,
    width: 130,
    opacity: 0.5,
    boxShadow: "5px 10px 18px #888888"
  },
  actionButtonTextDisabled: {
    color: "#7f7f7f",
    fontSize: 19,
    marginTop: 7,
    textAlign: "center"
  },
  actionButton: {
    backgroundColor: "#20C0FF",
    height: 35,
    width: 130,
    boxShadow: "5px 10px 18px #888888"
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 19,
    marginTop: 7,
    textAlign: "center"
  },
  label: {
    fontSize: 14,
    color: "rgba(22,22,22,.5)",
    width: 160,
    marginBottom: 5
  },
  balanceBox : {
    width : 160,
    marginBottom : 5,
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    flexBasis: "100%"
  }
});

export default UserInfo;
