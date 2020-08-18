import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import GroupIcon from "@material-ui/icons/Group";
import PeopleOutlineIcon from "@material-ui/icons/PeopleOutline";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import SettingsIcon from "@material-ui/icons/Settings";
import { withStyles } from "@material-ui/core/styles";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Divider from "@material-ui/core/Divider";
import { Link } from "react-router-dom";

const drawerWidth = 240;

const styles = (theme) => ({
  drawerOpen: {
    width: drawerWidth,
    transition: `200ms ease-in-out`,
    overflow: "hidden",
    backgroundColor: "#b4dfe5",
  },
  drawerClosed: {
    transition: `200ms ease-in-out`,
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(7) + 1,
    },
    overflow: "hidden",
    backgroundColor: "#b4dfe5",
  },
  flexRight: {
    display: "flex",
    justifyContent: "flex-end",
    flexGrow: 0,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },
});

class SideBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleMenuChange = this.handleMenuChange.bind(this);
    this.changeMenuItem = this.changeMenuItem.bind(this);
  }

  handleMenuChange(e) {
    this.props.onMenuChange();
  }
  changeMenuItem(e) {
    var t = e.currentTarget.getAttribute("value");
    this.props.onChangeMenuItem(t);
  }

  render() {
    const { classes } = this.props;
    var drawerClass;
    if (this.props.state === "open") {
      drawerClass = classes.drawerOpen;
    } else {
      drawerClass = classes.drawerClosed;
    }
    return (
      <Drawer
        variant="permanent"
        classes={{
          paper: drawerClass,
        }}
      >
        <div className={classes.toolbar}>
          {this.props.state === "open" ? (
            <h3 style={{ flexGrow: 1 }}>Menu</h3>
          ) : (
            ""
          )}

          {this.props.state === "open" ? (
            <ChevronLeftIcon
              button
              onClick={this.handleMenuChange}
              className={classes.flexRight}
            />
          ) : (
            <ChevronRightIcon
              button
              onClick={this.handleMenuChange}
              style={{ flexGrow: 1 }}
            />
          )}
        </div>
        <Divider />
        <List style={{ margin: 0 }}>
          <Link to="/home" style={{ textDecoration: "none", color: "black" }}>
            <ListItem>
              <ListItemIcon>
                <GroupIcon></GroupIcon>
              </ListItemIcon>
              <ListItemText primary="Teams" />
            </ListItem>
          </Link>
          <Link
            to="/home/closeFriends"
            style={{ textDecoration: "none", color: "black" }}
          >
            <ListItem>
              <ListItemIcon>
                <PeopleOutlineIcon></PeopleOutlineIcon>
              </ListItemIcon>
              <ListItemText primary="Close friends" />
            </ListItem>
          </Link>
          <Link
            to="/home/invitations"
            style={{ textDecoration: "none", color: "black" }}
          >
            <ListItem>
              <ListItemIcon>
                <GroupAddIcon></GroupAddIcon>
              </ListItemIcon>
              <ListItemText primary="Team invitations" />
            </ListItem>
          </Link>
        </List>
      </Drawer>
    );
  }
}

export default withStyles(styles)(SideBar);
