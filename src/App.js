import React from "react";
import Dashboard from "./views/dashboard";
import SignUpPage from "./views/sign_up";
import SignInPage from "./views/sign_in";
import LandingPage from "./views/landing";
import { BrowserRouter, Route } from "react-router-dom";
import { SIGN_UP, DASHBOARD, LANDING, SIGN_IN } from "./constants/routes";
import { withFirebase } from "./components/Firebase";
import { AuthUserContext } from "./components/Session";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: null,
    };
  }
  componentDidMount() {
    console.log(this.props.firebase.auth);
    this.listener = this.props.firebase.auth.onAuthStateChanged((authUser) => {
      authUser
        ? this.setState({ authUser })
        : this.setState({ authUser: null });
    });
  }
  componentWillUnmount() {
    this.listener();
  }

  render() {
    return (
      <AuthUserContext.Provider value={this.state.authUser}>
        <BrowserRouter>
          <Route exact path={LANDING} component={LandingPage} />
          <Route
            path={DASHBOARD}
            component={Dashboard}
            authUser={this.state.authUser}
          />
          <Route exact path={SIGN_UP} component={SignUpPage} />
          <Route exact path={SIGN_IN} component={SignInPage} />
        </BrowserRouter>
      </AuthUserContext.Provider>
    );
  }
}
export default withFirebase(App);
