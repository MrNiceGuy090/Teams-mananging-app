// team view in dashboard
// TO DO: separate createTeam Modal component
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import {
  CardHeader,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Grid,
  Typography,
  FormControl,
  TextField,
  Input,
  InputLabel,
  FormHelperText,
  IconButton,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import { Link } from "react-router-dom";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";

const drawerWidth = 240;

const styles = (theme) => ({
  media: {
    height: 240,
    backgroundColor: "lightblue",
    fontSize: "1000%",
    textAlign: "center",
    width: "100%",
  },
  modal: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    width: "400px",
    overflow: "scroll",
    maxHeight: "70vh",
  },
  margTop: {
    marginTop: "40px",
  },
  modalImage: {
    width: "100%",
  },
  modalImageContainer: {
    width: "100%",
  },
  paddingForm: {
    padding: "30px",
  },
  teamCard: {},
});

class Teams extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      teams: [], //teams Id's
      teamsName: [], // team names for rendering
      teamsPic: [], //teams images from state.teams, updated from getTeamsPic() method
      loading: true, // if there is data downloading
      modalOpen: false, // truth state of create team modal being open
      membersEmail: [""], // create team form, list of members email
      membersUid: [""],
      teamName: "", // create team form team name
      file: "", // local filepath to image from create team form
      teamActive: null,
    };
    this.addMember = this.addMember.bind(this);
    this.handleTeamNameChange = this.handleTeamNameChange.bind(this);
    this.handleImageUpload = this.handleImageUpload.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
  }
  // clicked on a team
  changeTeamActive(index) {
    const teamAtIndex = this.state.teams[index];
    this.setState({ teamActive: teamAtIndex });
  }

  // called by getTeams() to get images from team Id's and team names
  getTeamsPic(index) {
    this.props.firebase.db
      .collection("Teams")
      .doc(this.state.teams[index])
      .get()
      .then((doc) => {
        if (index === 0) this.setState({ teamsName: [] });
        this.setState((state) => {
          const list = state.teamsName.concat(doc.data().name);
          return { teamsName: list };
        });
        this.props.firebase.storageRef
          .child(doc.data().image)
          .getDownloadURL()
          .then((url) => {
            if (index === 0) {
              this.setState({ teamsPic: [] });
            }
            this.setState((state) => {
              const list = state.teamsPic.concat(url);
              return { teamsPic: list };
            });
            if (this.state.teams.length > this.state.teamsPic.length) {
              this.getTeamsPic(index + 1);
            } else {
              console.log(this.state);
              this.setState({ loading: false });
            }
          });
      });
  }
  // called on mount and create team form submit to get team Id's
  getTeams() {
    this.setState({ loading: true });
    this.props.firebase.db
      .collection("Users")
      .doc(this.context.uid)
      .get()
      .then((doc) => {
        if (doc.data().teams.length > 0) {
          console.log(doc.data().teams);
          this.setState({ teams: doc.data().teams });
          this.getTeamsPic(0);
        } else {
          this.setState({ loading: false });
        }
      });
  }
  // from create team form, creates local image
  handleImageUpload(e) {
    this.setState({
      file: URL.createObjectURL(e.target.files[0]),
    });
  }
  // create team form team name to state
  handleTeamNameChange(e) {
    const { name, value } = e.target;
    this.setState({ teamName: value });
  }
  // create team form append current written member to state.membersEmail
  async handleInputChangeMemberAdd(e, index) {
    const { name, value } = e.target;
    // validate email with database
    const snapshot = await this.props.firebase.db
      .collection("Users")
      .where("email", "==", value)
      .get();
    if (snapshot.docs.length > 0) {
      if (this.state.membersUid.length >= index + 1) {
        this.setState((state) => {
          let list = this.state.membersUid;
          list[index] = snapshot.docs[0].data().uid;
          return { membersUid: list };
        });
      } else {
        this.setState((state) => {
          const list = this.state.membersUid.concat(
            snapshot.docs[0].data().uid
          );
          return { membersUid: list };
        });
      }
    } else console.log("User doesnt exists");

    //validation ends here
    if (this.state.membersEmail.length >= index + 1) {
      this.setState((state) => {
        let list = this.state.membersEmail;
        list[index] = value;
        return { membersEmail: list };
      });
    } else {
      this.setState((state) => {
        const list = this.state.membersEmail.concat(value);
        return { membersEmail: list };
      });
    }
  }
  // create team form add field and place in state.membersEmail
  addMember() {
    this.setState((state) => {
      const list = this.state.membersEmail.concat("");
      return { membersEmail: list };
    });
  }
  // create team form remove member field and erase from state.membersEmail
  removeMember(index) {
    let list = this.state.membersEmail;
    list.splice(index, 1);
    this.setState({ membersEmail: list });
  }
  // called by handleSubmit to create a fileBlob
  getFileBlob = function (url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.addEventListener("load", function () {
      cb(xhr.response);
    });
    xhr.send();
  };

  async sendTeamInvites(teamId) {
    console.log(this.state.membersUid);
    for (var user of this.state.membersUid) {
      let userUid = user;
      if (userUid !== "") {
        this.props.firebase.db
          .collection("Users")
          .doc(userUid)
          .get()
          .then((doc) => {
            if (!doc.data().teamInvites) {
              console.log(userUid, teamId);
              this.props.firebase.db
                .collection("Users")
                .doc(userUid)
                .update({
                  teamInvites: [teamId],
                });
            } else {
              var invites = doc.data().teamInvites;
              invites.push(teamId);
              console.log(userUid, invites);
              this.props.firebase.db.collection("Users").doc(userUid).update({
                teamInvites: invites,
              });
            }
          });
      }
    }
  }

  // create react form submit handling
  handleSubmit = (e) => {
    e.preventDefault();
    var teamId = this.context.uid + Date.now();

    // insert photo into storage
    this.getFileBlob(this.state.file, (blob) => {
      this.props.firebase.storageRef
        .child(`Teams/${teamId}`)
        .put(blob)
        .then(function (snapshot) {
          console.log("Uploaded a file!");
        });
    });
    // create team object in db
    this.props.firebase.db
      .collection("Teams")
      .doc(teamId)
      .set({
        name: this.state.teamName,
        members: [this.context.uid],
        pendingReq: this.state.membersUid,
        id: teamId,
        admins: [this.context.uid],
        image: `Teams/${teamId}`,
      });
    //send pending request to join group
    this.sendTeamInvites(teamId);
    // update team founder database teams
    this.props.firebase.db
      .collection("Users")
      .doc(this.context.uid)
      .get()
      .then((doc) => {
        var teams = doc.data().teams;
        console.log(teams);
        teams.push(teamId);
        this.props.firebase.db
          .collection("Users")
          .doc(this.context.uid)
          .update({ teams: teams })
          .then(console.log(teams), this.getTeams());
        this.setState({ modalOpen: false });
      });
    e.preventDefault();
  };
  // modal open
  handleOpen() {
    this.setState({
      modalOpen: true,
      membersEmail: [""],
      membersUid: [""],
      teamName: "",
      file: "",
    });
  }
  // modal close
  handleClose() {
    this.setState({ modalOpen: false });
  }
  componentDidMount() {
    this.getTeams();
    console.log("Mounterd");
  }

  render() {
    const { classes } = this.props;
    const isLoading = this.state.loading;
    const teamActive = this.state.teamActive;

    return (
      <div>
        {teamActive ? (
          <h1 style={this.props.style}>{this.state.teamActive}</h1>
        ) : (
          <div>
            {isLoading ? (
              <h1 style={this.props.style}>Loading...</h1>
            ) : (
              <AuthUserContext.Consumer>
                {(authUser) => (
                  <Grid container spacing={6} style={this.props.style}>
                    {this.state.teamsName.map((value, index) => {
                      return (
                        <Grid item xs={4} key={index}>
                          <Link
                            to={`/home/team/${this.state.teams[index]}`}
                            style={{ textDecoration: "none", color: "black" }}
                          >
                            <Card
                              className={classes.teamCard}
                              onClick={() => this.changeTeamActive(index)}
                            >
                              <CardActionArea>
                                <CardMedia
                                  image={this.state.teamsPic[index]}
                                  className={classes.media}
                                  title="Team"
                                ></CardMedia>
                                <CardContent>
                                  <Typography variant="h5" component="h2">
                                    {value}
                                  </Typography>
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          </Link>
                        </Grid>
                      );
                    })}

                    <Grid item xs={4}>
                      <Card onClick={this.handleOpen}>
                        <CardActionArea>
                          <AddIcon className={classes.media}></AddIcon>
                          <CardContent>
                            <Typography variant="h5" component="h2">
                              Add team
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                    <Modal
                      open={this.state.modalOpen}
                      onClose={this.handleClose}
                      BackdropComponent={Backdrop}
                    >
                      <Fade className={classes.modal} in={this.state.modalOpen}>
                        <form>
                          <img
                            src={this.state.file}
                            className={classes.modalImage}
                          />

                          <div className={classes.paddingForm}>
                            <h1>Create team</h1>
                            <TextField
                              required={true}
                              id="teamNameField"
                              label="Team's name"
                              name="teamName"
                              type="text"
                              onChange={this.handleTeamNameChange}
                            />
                            <br className={classes.margTop}></br>
                            <h3>Team photo</h3>
                            <input
                              type="file"
                              onChange={this.handleImageUpload}
                            />
                            <h3 className={classes.margTop}>Members</h3>
                            {this.state.membersEmail.map((value, index) => {
                              return (
                                <div key={index}>
                                  <TextField
                                    required
                                    label="Member's email"
                                    value={value.email}
                                    onChange={(e) =>
                                      this.handleInputChangeMemberAdd(e, index)
                                    }
                                  />
                                  <IconButton
                                    onClick={() => this.removeMember(index)}
                                  >
                                    <RemoveIcon></RemoveIcon>
                                  </IconButton>
                                  {this.state.membersEmail.length - 1 ===
                                    index && (
                                    <IconButton onClick={this.addMember}>
                                      <AddIcon></AddIcon>
                                    </IconButton>
                                  )}
                                </div>
                              );
                            })}
                            <button type="submit" onClick={this.handleSubmit}>
                              Submit
                            </button>
                          </div>
                        </form>
                      </Fade>
                    </Modal>
                  </Grid>
                )}
              </AuthUserContext.Consumer>
            )}
          </div>
        )}
      </div>
    );
  }
}
Teams.contextType = AuthUserContext;
export default withFirebase(withStyles(styles)(Teams));
