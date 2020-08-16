import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import Toolbar from "@material-ui/core/Toolbar";
import { withStyles } from "@material-ui/core/styles";
import SignOutButton from "../views/sign_out";
import { AuthUserContext } from "./Session";
import { withFirebase } from "./Firebase";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

const drawerWidth = 240;

const styles = (theme) => ({
  topbar: {
    backgroundColor: "#303c6c",
  },
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
  userName: {
    marginRight: "20px",
    cursor: "pointer",
  },
  avatar: {
    cursor: "pointer",
  },
});

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiResponse: "Notification message",
      username: "",
      anchorUserOptions: null,
      profilePic: undefined,
    };
    this.handleAvatarClick = this.handleAvatarClick.bind(this);
    this.handleUserOptionsClose = this.handleUserOptionsClose.bind(this);
    this.getFileBlob = this.getFileBlob.bind(this);
    this.storeImage = this.storeImage.bind(this);
    this.changeProfilePic = this.changeProfilePic.bind(this);
  }

  handleAvatarClick(e) {
    this.setState({
      anchorUserOptions: document.getElementById("topbar"),
    });
  }
  handleUserOptionsClose() {
    this.setState({ anchorUserOptions: null });
  }

  componentDidMount() {
    // get user username
    this.props.firebase.db
      .collection("Users")
      .doc(this.context.uid)
      .get()
      .then((doc) => {
        console.log(doc.data().username);
        this.setState({ username: doc.data().username });
      });
    // get user profile pic
    this.props.firebase.storageRef
      .child(`Users/ProfilePics/${this.context.uid}`)
      .getDownloadURL()
      .then((url) => {
        this.setState({ profilePic: url });
        console.log(url);
      });
  }

  changeProfilePic(e) {
    this.handleUserOptionsClose();
    document.getElementById("profilePicInput").click();
  }

  // called by storeImage to create a fileBlob
  getFileBlob = function (url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.addEventListener("load", function () {
      cb(xhr.response);
    });
    xhr.send();
  };

  storeImage(e) {
    let image = URL.createObjectURL(e.target.files[0]);

    this.getFileBlob(image, (blob) => {
      this.props.firebase.storageRef
        .child(`Users/ProfilePics/${this.context.uid}`)
        .put(blob)
        .then(this.setState({ profilePic: image })); // updates the profile pic from local saved image
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
          <AppBar className={classes.topbar} id="topbar" position="sticky">
            <Toolbar>
              <div className={notif}>{this.state.apiResponse}</div>
              <div className={classes.spacer}></div>

              <p className={classes.userName} onClick={this.handleAvatarClick}>
                {this.state.username}
              </p>
              <Avatar
                id="avatar"
                onClick={this.handleAvatarClick}
                className={classes.avatar}
                src={this.state.profilePic ? this.state.profilePic : ""}
              ></Avatar>
              <Menu
                anchorEl={this.state.anchorUserOptions}
                keepMounted
                open={Boolean(this.state.anchorUserOptions)}
                onClose={this.handleUserOptionsClose}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              >
                <MenuItem onClick={this.changeProfilePic}>
                  <input
                    type="file"
                    id="profilePicInput"
                    style={{ display: "none" }}
                    onChange={this.storeImage}
                  ></input>
                  Change profile picture
                </MenuItem>
                <MenuItem onClick={this.handleUserOptionsClose}>
                  <SignOutButton></SignOutButton>
                </MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
        )}
      </AuthUserContext.Consumer>
    );
  }
}
TopBar.contextType = AuthUserContext;
export default withFirebase(withStyles(styles)(TopBar));
