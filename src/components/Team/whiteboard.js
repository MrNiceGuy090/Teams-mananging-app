import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Task from "../Team/task";
import AddIcon from "@material-ui/icons/Add";

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
      tasks: [],
    };
  }

  componentDidMount() {
    this.props.firebase.db
      .collection("Teams")
      .doc(this.props.team)
      .get()
      .then((doc) => {
        let teamTasks = doc.data().tasks;
        for (let x of teamTasks) {
          let task = x;
          this.props.firebase.db
            .collection("Tasks")
            .doc(task)
            .get()
            .then((doc) => {
              let list = this.state.tasks.concat(doc.data());
              this.setState({ tasks: list });
            });
        }
      });
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
                  {this.state.tasks.map((value, index) => {
                    if (value.status === "to do") {
                      console.log(value);
                      return <Task dbObject={value} key={index}></Task>;
                    } else return null;
                  })}
                  <AddIcon></AddIcon>
                </CardContent>
              </Card>
              <Card className={classes.cardGroup} variant="outlined">
                <CardHeader title="In progress" />
                <CardContent>
                  {this.state.tasks.map((value, index) => {
                    if (value.status === "in progress") {
                      return <Task dbObject={value} key={index}></Task>;
                    } else return null;
                  })}
                  <AddIcon></AddIcon>
                </CardContent>
              </Card>

              <Card className={classes.cardGroup} variant="outlined">
                <CardHeader title="Done" />
                <CardContent>
                  {this.state.tasks.map((value, index) => {
                    if (value.status === "done") {
                      return <Task dbObject={value} key={index}></Task>;
                    } else return null;
                  })}
                  <AddIcon></AddIcon>
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
