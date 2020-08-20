import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Task from "../Team/task";
import AddIcon from "@material-ui/icons/Add";
import {
  IconButton,
  Modal,
  Fade,
  Backdrop,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
} from "@material-ui/core";

const styles = (theme) => ({
  cardGroup: {
    width: "21%",
    margin: "2%",
    height: "100%",
    backgroundColor: "lightblue",
  },
  container: {
    display: "flex",
  },
  modal: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    width: "400px",
    overflow: "hidden",
    maxHeight: "70vh",
    padding: "10px",
  },
  topMargin: {
    marginTop: "10px",
  },
  textField: {
    width: "100%",
  },
});

class Whiteboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 0,
      tasks: [],
      addTaskModal: false,
      newTaskTitle: "",
      newTaskDescription: "",
      newTaskStatus: "",
    };
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleTaskDescriptionChange = this.handleTaskDescriptionChange.bind(
      this
    );
    this.handleTaskTitleChange = this.handleTaskTitleChange.bind(this);
    this.handleTaskSubmit = this.handleTaskSubmit.bind(this);
    this.getTasks = this.getTasks.bind(this);
  }

  addTaskModal(status) {
    console.log(status);
    this.setState({ addTaskModal: true, newTaskStatus: status });
  }

  handleModalClose() {
    this.setState({
      addTaskModal: false,
      newTaskTitle: "",
      newTaskDescription: "",
      newTaskStatus: "",
    });
  }
  handleTaskTitleChange(e) {
    const { name, value } = e.target;
    this.setState({ newTaskTitle: value });
  }
  handleTaskDescriptionChange(e) {
    const { name, value } = e.target;
    this.setState({ newTaskDescription: value });
  }
  handleTaskSubmit = async (e) => {
    console.log("jei");
    e.preventDefault();
    //create tasks and append to current team in db
    let key = await this.props.firebase.db.collection("Tasks").add({
      title: this.state.newTaskTitle,
      description: this.state.newTaskDescription,
      status: this.state.newTaskStatus,
      participants: [],
    });
    console.log(key.id);
    this.props.firebase.db
      .collection("Teams")
      .doc(this.props.team)
      .get()
      .then((doc) => {
        let oldTasks = doc.data().tasks;
        oldTasks.push(key.id);
        this.props.firebase.db
          .collection("Teams")
          .doc(this.props.team)
          .update({ tasks: oldTasks })
          .then(() => {
            oldTasks = this.state.tasks;
            oldTasks.push({
              title: this.state.newTaskTitle,
              description: this.state.newTaskDescription,
              status: this.state.newTaskStatus,
              participants: [],
            });
            this.setState({
              addTaskModal: false,
              newTaskTitle: "",
              newTaskDescription: "",
              newTaskStatus: "",
              tasks: oldTasks,
            });
          });
      });
  };

  getTasks() {
    this.props.firebase.db
      .collection("Teams")
      .doc(this.props.team)
      .get()
      .then((doc) => {
        let teamTasks = doc.data().tasks;
        console.log(teamTasks);
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

  componentDidMount() {
    this.getTasks();
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
                      return <Task dbObject={value} key={index}></Task>;
                    } else return null;
                  })}
                  <IconButton onClick={() => this.addTaskModal("to do")}>
                    <AddIcon></AddIcon>
                  </IconButton>
                </CardContent>

                <Modal
                  open={this.state.addTaskModal}
                  onClose={this.handleModalClose}
                  BackdropComponent={Backdrop}
                >
                  <Fade in={this.state.addTaskModal} className={classes.modal}>
                    <form>
                      <h1>New task</h1>
                      <TextField
                        required={true}
                        label="Title"
                        name="taskTitle"
                        type="text"
                        onChange={this.handleTaskTitleChange}
                        className={classes.textField}
                      />
                      <div className={classes.break}></div>
                      <TextField
                        multiline
                        rows={4}
                        required={true}
                        label="Description"
                        name="taskTitle"
                        type="text"
                        onChange={this.handleTaskDescriptionChange}
                        className={classes.textField}
                      />
                      <div className={classes.break}></div>
                      <Button
                        type="submit"
                        onClick={this.handleTaskSubmit}
                        className={classes.topMargin}
                      >
                        Submit
                      </Button>
                    </form>
                  </Fade>
                </Modal>
              </Card>
              <Card className={classes.cardGroup} variant="outlined">
                <CardHeader title="In progress" />
                <CardContent>
                  {this.state.tasks.map((value, index) => {
                    if (value.status === "in progress") {
                      return <Task dbObject={value} key={index}></Task>;
                    } else return null;
                  })}
                  <IconButton onClick={() => this.addTaskModal("in progress")}>
                    <AddIcon></AddIcon>
                  </IconButton>
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
                  <IconButton onClick={() => this.addTaskModal("done")}>
                    <AddIcon></AddIcon>
                  </IconButton>
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
