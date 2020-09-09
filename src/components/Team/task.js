import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Avatar from "@material-ui/core/Avatar";
import { Divider, Button, TextField } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";

const styles = (theme) => ({
  cardItem: {},
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
      userProfilePic: "",
      messages: [],
      messagesPics: [],
      messageContent: "",
    };
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.joinTask = this.joinTask.bind(this);
    this.leaveTask = this.leaveTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
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

  deleteTask() {
    var taskName = this.props.taskName;
    // delete from team tasks
    this.props.firebase.db
      .collection("Teams")
      .doc(this.props.teamName)
      .get()
      .then((doc) => {
        let oldTasks = doc.data().tasks;
        let newTasks = oldTasks.filter((value, index) => {
          return value !== taskName;
        });
        // delete task from team tasks
        this.props.firebase.db
          .collection("Teams")
          .doc(this.props.teamName)
          .update({ tasks: newTasks });
        // deelete task from team members
        let members = doc.data().members;
        for (let x of members) {
          let member = x;
          this.props.firebase.db
            .collection("Users")
            .doc(member)
            .get()
            .then((doc) => {
              let oldTasks = doc.data().tasks;
              let newTasks = oldTasks.filter((value, index) => {
                return value !== taskName;
              });
              this.props.firebase.db
                .collection("Users")
                .doc(member)
                .update({ tasks: newTasks });
            });
        }
      });
    // delete Task
    this.props.firebase.db
      .collection("Tasks")
      .doc(taskName)
      .get()
      .then((doc) => doc.ref.delete());
    // update state
    this.setState({ modalOpen: false });

    this.props.rerender(this.props.keyIndex);
  }

  leaveTask() {
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
            for (var i = 0; i < this.state.participants.length; i++) {
              if (this.state.participants[i].uid === currentUser) {
                let par = Array.prototype.slice.call(this.state.participants);
                let parPics = Array.prototype.slice.call(
                  this.state.participantsPics
                );
                par.splice(i, 1);
                parPics.splice(i, 1);
                console.log(par, i);
                console.log(parPics);
                this.setState({
                  participants: par,
                  participantsPics: parPics,
                });

                console.log(
                  this.state.participants[i],
                  i,
                  this.state.participants
                );
                break;
              }
            }
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
        .then(async (doc) => {
          // get pics
          await this.props.firebase.storageRef
            .child(`Users/ProfilePics/${user}`)
            .getDownloadURL()
            .then((url) => {
              const list = this.state.participantsPics.concat(url);
              this.setState({ participantsPics: list });
            });

          // get users data
          const list = this.state.participants.concat(doc.data());
          this.setState({ participants: list });
          for (let user of list) {
            if (user.uid === this.context.uid)
              this.setState({ isJoined: true });
          }
        });
    }
    // get user profile pic
    this.props.firebase.storageRef
      .child(`Users/ProfilePics/${this.context.uid}`)
      .getDownloadURL()
      .then((url) => {
        this.setState({ userProfilePic: url });
      });
    // get messages
    this.props.firebase.db
      .collection("Tasks")
      .doc(this.props.taskName)
      .get()
      .then((doc) => {
        var messages = doc.data().messages;
        this.setState({ messages: messages });
        // get profile pics for messages
        messages.map((value, index) => {
          this.props.firebase.storageRef
            .child(`Users/ProfilePics/${value.user}`)
            .getDownloadURL()
            .then((url) => {
              let list = this.state.messagesPics.concat(url);
              this.setState({ messagesPics: list });
            });
        });
      });
  }
  handleMessageChange(e) {
    const { name, value } = e.target;
    this.setState({ messageContent: value });
  }
  postMessage = (e) => {
    e.preventDefault();
    let messageOb = {
      user: this.context.uid,
      content: this.state.messageContent,
    };
    let newMessages = this.state.messages.concat(messageOb);
    this.setState({ messages: newMessages });
    // user profile pic
    this.props.firebase.storageRef
      .child(`Users/ProfilePics/${this.context.uid}`)
      .getDownloadURL()
      .then((url) => {
        const list = this.state.messagesPics.concat(url);
        this.setState({ messagesPics: list });
      });
    // rerender locally
    this.props.firebase.db
      .collection("Tasks")
      .doc(this.props.taskName)
      .update({ messages: newMessages });
    // reset form
    document.getElementById("messagePost").reset();
  };

  render() {
    const { classes } = this.props;
    let isJoined = this.state.isJoined;
    return (
      <div style={{ padding: 0 }}>
        <AuthUserContext.Consumer>
          {(authUser) => (
            <div>
              <Card
                draggable
                onDragStart={(e) =>
                  this.props.startDrag(e, this.props.taskName)
                }
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
                      <p>Messages</p>
                      {/* task messages display */}
                      {this.state.messages.map((value, index) => {
                        return (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                            }}
                          >
                            <Avatar
                              style={{
                                alignSelf: "center",
                                marginRight: "10px",
                              }}
                              src={this.state.messagesPics[index]}
                            ></Avatar>
                            <p style={{ width: "70%" }}>{value.content}</p>
                          </div>
                        );
                      })}
                      {/*  box to post a new message */}
                      <form
                        id="messagePost"
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                        }}
                      >
                        <Avatar
                          style={{
                            alignSelf: "center",
                            marginRight: "10px",
                          }}
                          src={this.state.userProfilePic}
                        ></Avatar>
                        <TextField
                          multiline="true"
                          style={{ width: "70%" }}
                          onChange={this.handleMessageChange}
                        ></TextField>
                        <button onClick={this.postMessage} type="submit">
                          Post
                        </button>
                      </form>
                      {isJoined ? (
                        <div>
                          <Button onClick={this.leaveTask}>Leave</Button>
                          <Button onClick={this.deleteTask}>Delete</Button>
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
