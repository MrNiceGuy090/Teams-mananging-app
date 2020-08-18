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
    this.state = { modalOpen: false };
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
  }

  handleModalOpen() {
    this.setState({ modalOpen: true });
  }

  handleModalClose() {
    this.setState({ modalOpen: false });
  }

  render() {
    const { classes } = this.props;
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
                  <p className={classes.title}>Card1</p>
                  <div className={classes.avatarsContainer}>
                    <Avatar size="small" className={classes.avatar}></Avatar>
                    <Avatar size="small" className={classes.avatar}></Avatar>
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
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                        }}
                      >
                        <Avatar
                          size="small"
                          flexItem
                          style={{ alignSelf: "center" }}
                        />
                        <p flexItem>Alexandrescu Costel Rudi Garcia</p>
                        <div className={classes.break}></div>

                        <Avatar
                          size="small"
                          flexItem
                          style={{ alignSelf: "center", flexShrink: 0 }}
                        />
                        <p flexItem>G</p>
                        <div className={classes.break}></div>
                      </div>
                    </div>
                    <Divider
                      orientation="vertical"
                      variant="fullWidth"
                      flexItem
                    />
                    <div className={classes.spacer}></div>
                    <div className={classes.taskDetails}>
                      <h1>Tiltlu task</h1>
                      <p>
                        <b>Description</b>
                      </p>
                      <p>
                        Decsriere pe lung a taskului cu tpt felul de detalii
                        useless dar destul de lungi sa fie importante nu?
                      </p>
                      <p>
                        <b>Updates</b>
                      </p>
                      <p>Mesages</p>
                      <Button> Join </Button>
                      <Button> Follow </Button>
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
