import React, { Component } from "react";
import { View } from "react-native";
import "./App.css";
import history from "./history.js";
import UnlockAccount from "./Components/UnlockAccount.js";
import PurchaseTicket from "./Components/PurchaseTicket.js";
import Status from "./Components/Status.js";
import Header from "./Components/Header/Header.js";
import BlockDisplayer from "./Components/BlockDisplayer";
import 'font-awesome/css/font-awesome.min.css';
import AppSelect from "./Components/Header/AppSelect.js";
import Staking from "./Components/Staking.js";
import { Route, Router } from "react-router-dom";
import Leaderboard from "./Components/Leaderboard.js";

class App extends Component {
  render() {
    if (false) {
      return <UnlockAccount />;
    }
    if (window.location.href.toLowerCase().indexOf( "staking") > 0  ) {
      return <Staking></Staking>
    }
    if (window.location.href.toLowerCase().indexOf( "leaderboard") > 0  ) {
      return <Leaderboard/>
    }
    return (
      <View>
        <Header title="Auto Buy Stake" titleWidth={150} version="2.00.00" nodeSelect={true}/>
        <Router history={history}>
            <div>
              <Route exact path="/" component={UnlockAccount} />
              <Route path="/Status" component={Status} />         
              <Route path="/UnlockAccount" component={UnlockAccount} />
              <Route path="/PurchaseTicket" component={PurchaseTicket} />
              <Route path="/Block/:blockNumber" component={BlockDisplayer} />
              <Route path="/Staking" component={Staking} />
            </div>
          </Router>
          <AppSelect/>
      </View>
    );
  }
}

export default App;
