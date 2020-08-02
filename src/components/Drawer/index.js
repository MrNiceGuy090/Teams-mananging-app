import React from "react";
import { Drawer } from "@material-ui/core";

class SideBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor="left"
      >
        <h1>SideBar</h1>
        <h1>SideBar</h1>
        <h1>SideBar</h1>
        <h1>SideBar</h1>
      </Drawer>
    );
  }
}

export SideBar;
