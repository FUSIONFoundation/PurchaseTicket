import React, { Component } from "react";
import { View, Text } from "react-native";
import logo from "./logo.svg";
import "./App.css";
import history from "./history.js";
import BuyTicket from "./Components/BuyTicket.js";
import Status from "./Components/Status.js";
import Header from "./Components/Header.js";

import { Route, Router } from "react-router-dom";

class App extends Component {
  render() {
    if (false) {
      return <BuyTicket />;
    }
    return (
      <View>
        <Header/>
        <Router history={history}>
            <div>
              <Route exact path="/" component={BuyTicket} />
              <Route path="/Status" component={Status} />         
              <Route path="/BuyTicket" component={BuyTicket} />
            </div>
          </Router>
      </View>
    );
  }
}

export default App;
