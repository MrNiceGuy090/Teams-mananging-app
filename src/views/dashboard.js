import React from "react";
import SideBar from "../components/Drawer/index";
import TopBar from "../components/TopBar";
import InnerGrid from "../components/InnerGrid";
import Teams from "../components/Main/teams";
import Invitations from "../components/Main/invitations";
import { withStyles } from "@material-ui/core/styles";
import { AuthUserContext } from "../components/Session";
import { withFirebase } from "../components/Firebase";
const styles = (theme) => ({});
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
    console.log(this.state.sideBarState);
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
                {(() => {
                  switch (this.state.active) {
                    case "Teams":
                      return <Teams style={containerStyle}></Teams>;
                    case "Close friends":
                      return <InnerGrid style={containerStyle}></InnerGrid>;
                    case "Team invitations":
                      return <Invitations style={containerStyle}></Invitations>;
                    default:
                      return null;
                  }
                })()}
              </div>
            ) : (
              <h1>Not registred</h1>
            )
          }
        </AuthUserContext.Consumer>
      </div>
    );
  }
}

export default withFirebase(withStyles(styles)(Dashboard));
