import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import PropTypes from "prop-types";
import Whiteboard from "../Team/whiteboard";

const styles = (theme) => ({
  appBar: {
    marginTop: -3,
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <div p={3}>
          <h1>{children}</h1>
        </div>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

class SingleTeam extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      currentTeam: window.location.pathname.split("/").pop(),
      value: 0,
    };
  }

  handleChange = (event, newValue) => {
    this.setState({ value: newValue });
  };

  componentDidMount() {
    console.log(this.props.location);
  }

  render() {
    const { classes } = this.props;
    const isLoading = this.state.loading;
    return (
      <div>
        {isLoading ? (
          <h1 style={this.props.style}>Loading...</h1>
        ) : (
          <AuthUserContext.Consumer>
            {(authUser) => (
              <div style={this.props.style}>
                <AppBar position="static" className={classes.appBar}>
                  <Tabs
                    value={this.state.value}
                    onChange={this.handleChange}
                    aria-label="simple tabs example"
                    position="sticky"
                  >
                    <Tab label="Whiteboard" />
                    <Tab label="Chat" />
                    <Tab label="Members" />
                    <Tab label="Details" />
                  </Tabs>
                </AppBar>

                <TabPanel value={this.state.value} index={0}>
                  <Whiteboard team={this.state.currentTeam}></Whiteboard>
                </TabPanel>
                <TabPanel value={this.state.value} index={1}>
                  Item Two
                </TabPanel>
                <TabPanel value={this.state.value} index={2}>
                  Item Three
                </TabPanel>
                <TabPanel value={this.state.value} index={3}>
                  U have left
                </TabPanel>
              </div>
            )}
          </AuthUserContext.Consumer>
        )}
      </div>
    );
  }
}

export default withFirebase(withStyles(styles)(SingleTeam));
