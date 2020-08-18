import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Task from "../Team/task";

const styles = (theme) => ({
  cardGroup: {
    width: "21%",
    margin: "2%",
    backgroundColor: "lightblue",
  },
  cardItem: {},
  container: {
    display: "flex",
  },
});

class Whiteboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0,
    };
  }

  handleChange = (event, newValue) => {
    this.setState({ tabValue: newValue });
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <AuthUserContext.Consumer>
          {(authUser) => (
            <div className={classes.container}>
              <Card className={classes.cardGroup} variant="outlined">
                <CardHeader title="To do" />
                <CardContent>
                  <Task></Task>
                  <Task></Task>
                  <Task></Task>
                </CardContent>
              </Card>
              <Card className={classes.cardGroup} variant="outlined">
                <CardHeader title="In progress" />
                <CardContent>
                  <Task></Task>

                  <Task></Task>

                  <Task></Task>
                </CardContent>
              </Card>

              <Card className={classes.cardGroup} variant="outlined">
                <CardHeader title="Done" />
                <CardContent>
                  <Task></Task>

                  <Task></Task>

                  <Task></Task>
                </CardContent>
              </Card>
            </div>
          )}
        </AuthUserContext.Consumer>
      </div>
    );
  }
}

export default withFirebase(withStyles(styles)(Whiteboard));
