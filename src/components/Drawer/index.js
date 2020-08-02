import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { GroupIcon, PeopleOutlineIcon } from "@material-ui/icons";

class SideBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Drawer variant="permanent" elevation="24" open="true">
        <List>
          <ListItem button>
            <ListItemIcon>
              <GroupIcon></GroupIcon>
            </ListItemIcon>
            <ListItemText primary="Teams" />
          </ListItem>

          <ListItem button>
            <ListItemIcon>
              <PeopleAltOutlined></PeopleAltOutlined>
            </ListItemIcon>
            <ListItemText primary="Close friends" />
          </ListItem>

          <ListItem button>
            <ListItemIcon>
              <GroupIcon></GroupIcon>
            </ListItemIcon>
            <ListItemText primary="Teams" />
          </ListItem>

          <ListItem button>
            <ListItemIcon>
              <GroupIcon></GroupIcon>
            </ListItemIcon>
            <ListItemText primary="Teams" />
          </ListItem>
        </List>
      </Drawer>
    );
  }
}

export default SideBar;
