import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from "react-native";

import "../App.css";
import history from "../history.js";
import colors from "./colors";
import constants from "./constants";
import currentDataState from "../api/currentDataState";
import withSelectFiles from "react-select-files";
import "font-awesome/css/font-awesome.min.css";
var web3api = currentDataState.web3api
var styles;


let radioOn = require("../images/radioOn.svg");
let radioOff = require("../images/radioOff.svg");
let selectFileTitle;

var glb_selectFiles;

const SelectKeyStoreFile = withSelectFiles("selectFiles")(function({
  selectFiles
}) {
  glb_selectFiles = selectFiles;
  let check;
  if ( selectFileTitle === "Wallet File Valid") {
    check = <i key ="c11" className="fa fa-check-circle" style={{color:colors.successGreen,marginRight:4}}/>
  }
  return (
    <Text key={selectFileTitle} style={styles.selectWalletFileText}>
    {check}
    {selectFileTitle}</Text>
  );
});

export default class UnlockAccount extends Component {
  state = {
    accessViaPrivateKey: false,
    secureEntry: true,
    password : ''
  };

  render() {
    let accessViaPrivateKey = this.state.accessViaPrivateKey;

    let btnStyle = styles.unlockWalletButtonDisabled;
    let enabled = false;

    if ( accessViaPrivateKey && this.state.privateKeyOK ) {
      btnStyle = styles.unlockWalletButton;
      enabled = true;
    } else if ( !accessViaPrivateKey && this.state.keyData && this.state.privateKeyOK ) {
      btnStyle = styles.unlockWalletButton;
      enabled = true;
    }

    return (
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Access Your Wallet</Text>
        </View>
        <View style={styles.accessBox}>
          <Text style={styles.textHowToAccess}>
            How would you like to access your wallet?
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => {
                this.setState({ unlockError : false, keyData : null, privateKeyOK: false, password : null,  accessViaPrivateKey: !accessViaPrivateKey });
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={!accessViaPrivateKey ? radioOn : radioOff}
                  resizeMode="contain"
                  style={{ width: 14, height: 14 }}
                />
                <Text style={styles.radioSelectionText}>
                  Keystore / JSON File
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.setState({ unlockError : false,  keyData : null, privateKeyOK: false, password : null,  accessViaPrivateKey: !accessViaPrivateKey });
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={accessViaPrivateKey ? radioOn : radioOff}
                  resizeMode="contain"
                  style={{ width: 14, height: 14 }}
                />
                <Text style={styles.radioSelectionText}>Private Key</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.selectionBox}>
            {accessViaPrivateKey
              ? this.privateKeyRender()
              : this.keyStoreRender()}
          </View>
          <TouchableOpacity
            disabled = {!enabled}
            onPress={() => {
              if ( !this.state.accessViaPrivateKey ) {
                    try {
                      let obj = this.state.keyData
                      let crypto = obj.Crypto || obj.crypto
                      currentDataState.data.accountUnlocked = true
                      currentDataState.data.signInfo = web3api._web3.eth.accounts.decrypt( {crypto , version:obj.version}, this.state.password )
                      web3api.walletAddress = currentDataState.data.signInfo.address
                    } catch (e) {
                      this.setState( { unlockError : true } );
                      return;
                    }
              } else {
                currentDataState.data.accountUnlocked = true
                currentDataState.data.signInfo = web3api._web3.eth.accounts.privateKeyToAccount(this.state.password);
                web3api.walletAddress = currentDataState.data.signInfo.address
              }
              history.push('/Status')
            }}
          >
            <View>
              <Text style={btnStyle}>Unlock Wallet</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  keyStoreRender() {
    let fileSelectColor = colors.white;

    let borderColor = this.state.unlockError ? colors.errorRed : colors.orderGrey;

    selectFileTitle = this.state.keyData ?  "Wallet File Valid"  : "Select a Wallet File..."

    return (
      <View key="accek">
        <Text style={styles.textHowToAccess}>
          Select your wallet file and enter your password. Please ensure that
          the above URL is correct before loading wallets or entering passwords.
        </Text>
        <TouchableOpacity
          onPress={() => {
            glb_selectFiles({multiple: false}).then( (files) => {
              if ( files.length === 1 ) {
                // read the 
                let reader = new FileReader();
                reader.onload = (event) => {
                  let data = event.target.result;
                  if ( !data ) {
                    this.setState( {error:'Unable to read file', keyData : null})
                  }
                  try {
                    let obj = JSON.parse( data );
                    if ( !obj.address ) {
                      this.setState( {error:'Invalid key store file ', keyData : null})
                    } else {
                      this.setState( {error: null , keyData : obj } );
                    }
                  } catch (e) {
                    this.setState( {error:'Unable to read file', keyData : null })
                  }
                };
                reader.onerror = (event) => {
                  this.setState( {error:'Unable to read file', keyData : null})
                }
                reader.readAsText(files[0]);
              }
            })
          }}
        >
          <View style={[styles.selectWalletBox, {backgroundColor:fileSelectColor}]}>
            <SelectKeyStoreFile />
          </View>
        </TouchableOpacity>
        {this.state.error && (
          <Text style={styles.errorText}>{this.state.error}</Text>
        )}
        <Text style={styles.labelText}>Enter Your Password</Text>
        <View style={[styles.passwordInputBox,{borderColor}]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            autoCorrect={false}
            autoComplete="current-password"
            secureTextEntry={this.state.secureEntry}
            placeholderTextColor={colors.orderGrey}
            maxLength={128}
            value = {this.state.password}
            onChangeText={ (val)=> {
                this.setState( { unlockError : false, password : val, privateKeyOK : val && val.length })
            }}
          />
          <View
            style={{ width: 1, height: 36, backgroundColor: colors.orderGrey }}
          />
          <TouchableOpacity onPress={() => {
            this.setState( { secureEntry : !this.state.secureEntry })
          }}>
            <View
              style={{
                backgroundColor: colors.backgroundGrey,
                width: 32,
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              {this.state.secureEntry ? (
                <i className="fa fa-eye" />
              ) : (
                <i className="fa fa-eye-slash" />
              )}
            </View>
          </TouchableOpacity>
        </View>
        {this.state.unlockError && (
          <View>
            <View style={{height:4,width:3}}/>
            <Text style={styles.errorText}>The password provided is invalid.</Text>
          </View>
        )}
      </View>
    );
  }

  privateKeyRender() {
    return (
      <View key="prik">
        <Text style={styles.textHowToAccess}>
          Enter your private keys. Please ensure that the above URL is correct
          before loading wallets or entering passwords.
        </Text>
        <View style={{height:8,width : 1}}/>
        <Text style={styles.labelText}>Enter Your Private Key</Text>
        <View style={styles.passwordInputBox}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Private Key - starts with 0x"
            autoCorrect={false}
            autoComplete="current-password"
            secureTextEntry={this.state.secureEntry}
            placeholderTextColor={colors.orderGrey}
            maxLength={66}
            value={this.state.password}
            onChangeText={(text)=>{
              if ( text.length < 66 ) {
                this.setState( { privateKeyOK : false , password : text })
              } else {
                this.setState( { privateKeyOK : 
                  web3api.web3.utils.isHexStrict( text )
                  , password : text })
              }
            }}
          />
          <View
            style={{ width: 1, height: 36, backgroundColor: colors.orderGrey }}
          />
          <TouchableOpacity onPress={() => {
            this.setState( { secureEntry : !this.state.secureEntry })
          }}>
            <View
              style={{
                backgroundColor: colors.backgroundGrey,
                width: 32,
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              {this.state.secureEntry ? (
                <i class="fa fa-eye" />
              ) : (
                <i class="fa fa-eye-slash" />
              )}
            </View>
          </TouchableOpacity>
        </View>
        <View style={{height:32,width : 1}}/>
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
    alignItems: "center",
    width: "100%"
  },
  innerContainer: {
    width: 620,
    flexGrow: 1,
    flex: 1,
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "flex-start"
  },
  title: {
    fontSize: 24,
    fontFamily: constants.fontFamily,
    fontWeight: constants.boldFont,
    color: colors.textBlue,
    marginTop: 35,
    alignSelf: "flex-start",
    marginBottom: 16
  },
  textHowToAccess: {
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.textBlue,
    alignSelf: "flex-start",
    marginBottom: 16
  },
  radioSelectionText: {
    fontSize: 14,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.textBlue,
    marginRight: 16,
    marginLeft: 8
  },
  accessBox: {
    borderColor: colors.orderGrey,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1,
    alignItems: "flex-start",
    width: 620,
    overflow: "visible",
    boxShadow: "0 2px 0 0 rgba(189, 196, 206, 0.2)",
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 32,
    paddingRight: 32
  },
  selectWalletBox: {
    borderColor: colors.orderGrey,
    borderRadius: 4,
    backgroundColor: "white",
    borderWidth: 1,
    width: 516,
    height: 48,
    overflow: "visible",
    //boxShadow: "0 2px 0 0 rgba(189, 196, 206, 0.2)",
    flex: 1,
    flexBasis: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16
  },
  passwordInputBox: {
    borderColor: colors.orderGrey,
    borderRadius: 3,
    backgroundColor: "white",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    height: 36,
    width: 512,
    marginTop: 4
  },
  passwordInput: {
    fontSize: 13,
    color: colors.textBlue,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    width: 482,
    paddingLeft: 6
  },
  selectionBox: {
    borderColor: colors.orderGrey,
    borderRadius: 3,
    backgroundColor: colors.backgroundGrey,
    borderWidth: 1,
    width: 556,
    alignItems: "flex-start",
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 20
  },
  labelText: {
    fontSize: 12,
    color: colors.labelGrey,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont
  },
  selectWalletFileText: {
    fontSize: 16,
    color: colors.textBlue,
    fontFamily: constants.fontFamily,
    fontWeight: constants.mediumFont,
    textAlign: "center"
  },
  errorText : {
    fontSize: 12,
    color: colors.errorRed,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    marginBottom : 8
  },
  unlockWalletButtonDisabled : {
    fontSize: 16,
    width: 556,
    borderRadius: 3,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.white,
    backgroundColor: colors.disabledBlue,
    textAlign: "center",
    padding: 12,
    marginTop: 20
  },
  unlockWalletButton: {
    fontSize: 16,
    width: 556,
    borderRadius: 3,
    fontFamily: constants.fontFamily,
    fontWeight: constants.regularFont,
    color: colors.white,
    backgroundColor: colors.linkBlue,
    textAlign: "center",
    padding: 12,
    marginTop: 20
  }
});
