import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { MyNavbar, MyAsideBar } from "./Bars.js";
import { TableOfVehicles, Configurator, PaymentPage, Reservations } from "./ContentComponents.js";
import { Login } from "./Login";
import * as API from "./API.js";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      logged: false,
      user: null,
      loginError: false,
      loadingLogin: false,
      selectedCategories: [],
      selectedBrands: [],
      rental: null,
      csrf: null,
    };
  }

  render() {
    if (this.state.logged === false) return <Router>
      <MyNavbar logged={this.state.logged} />

      <Switch>
        <Route path="/login">
          <Login loading={this.state.loadingLogin} userLogin={this.userLogin} loginError={this.state.loginError} />
        </Route>

        <Route path="/home">
          <div className="container-fluid">
            <div className="row vheight-100">
              <MyAsideBar changeCategories={this.changeCategories} selectedCategories={this.state.selectedCategories} changeBrands={this.changeBrands} selectedBrands={this.state.selectedBrands} />
              <TableOfVehicles selectedCategories={this.state.selectedCategories} selectedBrands={this.state.selectedBrands} />
            </div>
          </div>
        </Route>

        <Route>
          <Redirect to="/home" />
        </Route>
      </Switch>

    </Router>

    else return <Router>

      <MyNavbar logged={this.state.logged} userLogout={this.userLogout} user={this.props.user} />

      <Switch>

        <Route path="/home">
          <div className="container-fluid">
            <div className="row vheight-100">
              <MyAsideBar changeCategories={this.changeCategories} selectedCategories={this.state.selectedCategories} changeBrands={this.changeBrands} selectedBrands={this.state.selectedBrands} />
              <TableOfVehicles selectedCategories={this.state.selectedCategories} selectedBrands={this.state.selectedBrands} />
            </div>
          </div>
        </Route>

        <Route path="/configurator">
          <Configurator user={this.state.user} setRental={this.setRental} />
        </Route>

        <Route path="/payment">
          <PaymentPage rental={this.state.rental} setRental={this.setRental} csrf={this.state.csrf} />
        </Route>

        <Route path="/reservations">
          <Reservations user={this.state.user} csrf={this.state.csrf} />
        </Route>

        <Route>
          <Redirect to="configurator" />
        </Route>

      </Switch>

    </Router>;
  }

  userLogin = (user, pass) => {
    this.setState({ loadingLogin: true });
    API.userLogin(user, pass).then(
      (userObj) => {
        this.setState({ logged: true, user: userObj, loginError: false, loadingLogin: false });
        API.getCSRFToken().then( (response) => this.setState({csrf: response.csrfToken}));
      }
    ).catch(
      () => { this.setState({ logged: false, user: null, loginError: true, loadingLogin: false }) }
    )
  }

  userLogout = () => {
    this.setState({ loadingLogin: true });
    API.userLogout()
      .then(() => this.setState({ logged: false, user: null, loginError: false, loadingLogin: false }))
      .catch(() => this.setState({ loadingLogin: false }));
  }

  changeCategories = (category) => {
    if (this.state.selectedCategories.indexOf(category) !== -1) {
      const selectedCategories = this.state.selectedCategories.filter((c) => c !== category);
      this.setState({ selectedCategories: selectedCategories });
    } else {
      const selectedCategories = [category, ...this.state.selectedCategories];
      this.setState({ selectedCategories: selectedCategories });
    }
  }

  changeBrands = (brand) => {
    if (this.state.selectedBrands.indexOf(brand) !== -1) {
      const selectedBrands = this.state.selectedBrands.filter((b) => b !== brand);
      this.setState({ selectedBrands: selectedBrands });
    } else {
      const selectedBrands = [brand, ...this.state.selectedBrands];
      this.setState({ selectedBrands: selectedBrands });
    }
  }

  setRental = (rental) => {
    this.setState({ rental: rental });
  }
}

export default App;
