import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import Toolbar from "@material-ui/core/Toolbar";
import { withStyles } from "@material-ui/core/styles";
import SignOutButton from "../views/sign_out";
import { AuthUserContext } from "./Session";
import { withFirebase } from "./Firebase";

const drawerWidth = 240;

const styles = (theme) => ({
  spacer: {
    flexGrow: 1,
  },
  notif: {
    flexGrow: 0,
    marginLeft: `${drawerWidth}px`,
    transition: `200ms ease-in-out`,
  },
  notifSmall: {
    flexGrow: 0,
    marginLeft: theme.spacing(7) + 1,
    transition: `200ms ease-in-out`,
  },
});

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { apiResponse: "Notification message", username: "" };
    this.callApi = this.callApi.bind(this);
  }

  callApi() {
    fetch("http://localhost:5000/testApi")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ apiResponse: data.response });
        console.log(data.response);
      });
  }

  componentDidMount() {
    console.log(this.context.uid);
    this.props.firebase.db
      .collection("Users")
      .doc(this.context.uid)
      .get()
      .then((doc) => {
        console.log(doc.data().username);
        this.setState({ username: doc.data().username });
      });
  }
  render() {
    const { classes } = this.props;
    var notif;
    if (this.props.small === "open") {
      notif = classes.notif;
    } else {
      notif = classes.notifSmall;
    }
    return (
      <AuthUserContext.Consumer>
        {(authUser) => (
          <AppBar className={classes.topbar} position="sticky">
            <Toolbar>
              <div className={notif}>{this.state.apiResponse}</div>
              <div className={classes.spacer}></div>

              <p>{this.state.username}</p>
              <p>{process.env.USER_UID}</p>
              <Avatar onClick={this.callApi}></Avatar>
              <SignOutButton></SignOutButton>
            </Toolbar>
          </AppBar>
        )}
      </AuthUserContext.Consumer>
    );
  }
}
TopBar.contextType = AuthUserContext;
export default withFirebase(withStyles(styles)(TopBar));
