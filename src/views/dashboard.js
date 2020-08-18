import React from "react";
import SideBar from "../components/Drawer/index";
import TopBar from "../components/TopBar";
import InnerGrid from "../components/InnerGrid";
import Teams from "../components/Main/teams";
import Invitations from "../components/Main/invitations";
import { withStyles } from "@material-ui/core/styles";
import { AuthUserContext } from "../components/Session";
import { withFirebase } from "../components/Firebase";
import { Switch, Route, BrowserRouter } from "react-router-dom";
import SingleTeam from "../components/Main/singleTeam";

const styles = (theme) => ({
  noTop: {
    marginTop: 0,
  },
});
// conditional rendering based on auth

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sideBarState: "open",
      active: "Teams",
    };
    this.handleMenuChange = this.handleMenuChange.bind(this);
    this.handleChangeMenuItem = this.handleChangeMenuItem.bind(this);
  }

  handleMenuChange() {
    if (this.state.sideBarState === "open") {
      this.setState({ sideBarState: "closed" });
    } else {
      this.setState({ sideBarState: "open" });
    }
  }
  handleChangeMenuItem(val) {
    this.setState({ active: val });
  }
  render() {
    const { classes } = this.props;
    const containerOpenStyle = {
      marginLeft: 240,
      marginTop: 3,
      width: `calc(100% - 240px)`,
      transition: `200ms ease-in-out`,
    };
    const containerClosedStyle = {
      marginLeft: 57,
      marginTop: 3,
      width: `calc(100% - 57px)`,
      transition: `200ms ease-in-out`,
    };
    var containerStyle;
    if (this.state.sideBarState === "open") {
      containerStyle = containerOpenStyle;
    } else {
      containerStyle = containerClosedStyle;
    }
    return (
      <div className="App">
        <BrowserRouter>
          <AuthUserContext.Consumer>
            {(authUser) =>
              authUser ? (
                <div>
                  <TopBar small={this.state.sideBarState}></TopBar>
                  <SideBar
                    state={this.state.sideBarState}
                    onMenuChange={this.handleMenuChange}
                    onChangeMenuItem={this.handleChangeMenuItem}
                  ></SideBar>
                  <Switch>
                    <Route exact path="/home">
                      <Teams style={containerStyle}></Teams>
                    </Route>
                    <Route exact path="/home/closeFriends">
                      <InnerGrid style={containerStyle}></InnerGrid>
                    </Route>
                    <Route exact path="/home/invitations">
                      <Invitations style={containerStyle}></Invitations>
                    </Route>
                    <Route path="/home/team/:team">
                      <SingleTeam
                        style={containerStyle}
                        className={classes.noTop}
                      ></SingleTeam>
                    </Route>
                  </Switch>
                </div>
              ) : (
                <h1>Not registred</h1>
              )
            }
          </AuthUserContext.Consumer>
        </BrowserRouter>
      </div>
    );
  }
}

export default withFirebase(withStyles(styles)(Dashboard));
