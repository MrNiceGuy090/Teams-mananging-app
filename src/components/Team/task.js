import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import { Divider, Button } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";

const styles = (theme) => ({
  cardItem: {
    cursor: "pointer",
  },
  avatar: {
    marginRight: "5px",
  },
  component: { padding: "5px", paddingBottom: "5px!important" },
  title: {
    fontSize: "15px",
    marginBottom: "5px",
    marginTop: "5px",
  },
  avatarsContainer: {
    display: "flex",
    flexDirection: "row-reverse",
  },
  modal: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    width: "700px",
    overflow: "hidden",
    maxHeight: "70vh",
    padding: "10px",

    display: "flex",
    flexDirection: "row-reverse",
  },
  taskMain: {},
  members: {
    maxWidth: "40%",
    padding: "10px",
  },
  taskDetails: {
    width: "60%",
    padding: "10px",
  },
  break: {
    width: "100%",
    height: "10px",
  },

  spacer: {
    flexGrow: 1,
  },
});

class Task extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      participants: [],
      participantsPics: [],
      isJoined: false,
    };
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.joinTask = this.joinTask.bind(this);
    this.leaveTask = this.leaveTask.bind(this);
  }

  joinTask() {
    // add user to task participants
    this.props.firebase.db
      .collection("Tasks")
      .doc(this.props.taskName)
      .get()
      .then((doc) => {
        let list = doc.data().participants;
        list.push(this.context.uid);
        this.props.firebase.db
          .collection("Tasks")
          .doc(this.props.taskName)
          .update({ participants: list })
          .then(() => {
            // update state with current user data
            this.props.firebase.db
              .collection("Users")
              .doc(this.context.uid)
              .get()
              .then((doc) => {
                const list = this.state.participants.concat(doc.data());
                this.setState({ participants: list });
              });

            this.props.firebase.storageRef
              .child(`Users/ProfilePics/${this.context.uid}`)
              .getDownloadURL()
              .then((url) => {
                const list = this.state.participantsPics.concat(url);
                this.setState({ participantsPics: list });
              });
          });
      });
    // update user's tasks
    this.props.firebase.db
      .collection("Users")
      .doc(this.context.uid)
      .get()
      .then((doc) => {
        let userTasks = doc.data().tasks;
        userTasks.push(this.props.taskName);
        this.props.firebase.db
          .collection("Users")
          .doc(this.context.uid)
          .update({ tasks: userTasks });
      });
    this.setState({ isJoined: true });
  }

  leaveTask() {
    console.log(typeof this.state.participants[0], this.state.participants[0]);
    // delete task from user's tasks
    var currentUser = this.context.uid;
    var curretnTaskName = this.props.taskName;
    this.props.firebase.db
      .collection("Users")
      .doc(currentUser)
      .get()
      .then((doc) => {
        console.log("users", this.state.participants);
        let userTasks = doc.data().tasks;
        userTasks = userTasks.filter(function (val) {
          return val !== curretnTaskName;
        });
        this.props.firebase.db
          .collection("Users")
          .doc(currentUser)
          .update({ tasks: userTasks });
      });
    // delete user from task participants
    this.props.firebase.db
      .collection("Tasks")
      .doc(this.props.taskName)
      .get()
      .then((doc) => {
        let list = doc.data().participants;
        list = list.filter(function (val) {
          return val !== currentUser;
        });
        this.props.firebase.db
          .collection("Tasks")
          .doc(this.props.taskName)
          .update({ participants: list })
          .then(() => {
            // remove user from task state
            this.state.participants.map((value, index) => {
              if (value.uid === currentUser) {
                console.log(value, index, this.state.participants);
                let par = this.state.participants.splice(index - 1, 1);
                let parPics = this.state.participantsPics.splice(index - 1, 1);
                console.log(par);
                this.setState({
                  participants: par,
                  participantsPics: parPics,
                });

                console.log(value, index, this.state.participants);
              }
            });

            console.log(this.state.participants, "start");
            this.setState({ isJoined: false });
          });
      });
  }

  handleModalOpen() {
    this.setState({ modalOpen: true });
  }

  handleModalClose() {
    this.setState({ modalOpen: false });
  }
  componentDidMount() {
    for (let x of this.props.dbObject.participants) {
      let user = x;
      this.props.firebase.db
        .collection("Users")
        .doc(user)
        .get()
        .then((doc) => {
          const list = this.state.participants.concat(doc.data());
          this.setState({ participants: list });
          for (let user of list) {
            if (user.uid === this.context.uid)
              this.setState({ isJoined: true });
          }
        });

      this.props.firebase.storageRef
        .child(`Users/ProfilePics/${user}`)
        .getDownloadURL()
        .then((url) => {
          const list = this.state.participantsPics.concat(url);
          this.setState({ participantsPics: list });
        });
    }
  }

  render() {
    const { classes } = this.props;
    let isJoined = this.state.isJoined;
    console.log(this.state.participants);
    return (
      <div style={{ padding: 0 }}>
        <AuthUserContext.Consumer>
          {(authUser) => (
            <div>
              <Card
                variant="outlined"
                className={classes.cardItem}
                onClick={this.handleModalOpen}
              >
                <CardContent className={classes.component}>
                  <p className={classes.title}>{this.props.dbObject.title}</p>
                  <div className={classes.avatarsContainer}>
                    {this.state.participantsPics.map((value, index) => {
                      return (
                        <Avatar
                          size="small"
                          className={classes.avatar}
                          src={value}
                          key={index}
                        ></Avatar>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Modal
                open={this.state.modalOpen}
                onClose={this.handleModalClose}
                BackdropComponent={Backdrop}
              >
                <Fade className={classes.modal} in={this.state.modalOpen}>
                  <div className={classes.taskMain}>
                    <div className={classes.members}>
                      <p>
                        <b>Participants</b>
                      </p>
                      {/* container for members that participate to the task */}

                      {this.state.participants.map((value, index) => {
                        return (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                            }}
                            key={index}
                          >
                            <Avatar
                              size="small"
                              style={{
                                alignSelf: "center",
                                marginRight: "10px",
                              }}
                              src={this.state.participantsPics[index]}
                            />
                            <p>{value.username}</p>
                            <div className={classes.break}></div>
                          </div>
                        );
                      })}
                    </div>
                    <Divider
                      orientation="vertical"
                      variant="fullWidth"
                      flexItem
                    />
                    <div className={classes.spacer}></div>
                    <div className={classes.taskDetails}>
                      <h1>{this.props.dbObject.title}</h1>
                      <p>
                        <b>Description</b>
                      </p>
                      <p>{this.props.dbObject.description}</p>
                      <p>
                        <b>Updates</b>
                      </p>
                      <p>Mesages</p>
                      {isJoined ? (
                        <div>
                          <Button>Move</Button>
                          <Button onClick={this.leaveTask}>Leave</Button>
                        </div>
                      ) : (
                        <Button onClick={this.joinTask}> Join </Button>
                      )}
                    </div>
                  </div>
                </Fade>
              </Modal>
            </div>
          )}
        </AuthUserContext.Consumer>
      </div>
    );
  }
}

Task.contextType = AuthUserContext;
export default withFirebase(withStyles(styles)(Task));
