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
    this.state = { modalOpen: false, participants: [], participantsPics: [] };
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
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
          console.log(this.state.participants);
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
    console.log(this.props.dbObject);
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
                        <b>Members</b>
                      </p>
                      {/* container for members that participate to the task */}

                      {this.state.participants.map((value, index) => {
                        return (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                            }}
                          >
                            <Avatar
                              size="small"
                              flexItem
                              style={{
                                alignSelf: "center",
                                marginRight: "10px",
                              }}
                              src={this.state.participantsPics[index]}
                            />
                            <p flexItem>{value.username}</p>
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
                      <Button> Join </Button>
                      <Button> Follow </Button>
                      <Button>Move</Button>
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

export default withFirebase(withStyles(styles)(Task));
