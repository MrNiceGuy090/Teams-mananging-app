import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";
import { Paper, Grid, IconButton } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";

const styles = (theme) => ({
  invitationBox: {
    display: "flex",
    height: "100%",
  },
  invitationAvatar: {
    maxWidth: "100%",
    width: "auto",
    height: "auto",
  },
  centerItems: {
    textAlign: "center",
  },
});

class Invitations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      invites: [],
      invitesPics: [],
      invitesName: [],
      teamSizes: [],
    };
    this.acceptInvite = this.acceptInvite.bind(this);
  }

  componentDidMount() {
    this.getInvitations();
    console.log(this.state);
  }

  getInvitations() {
    this.props.firebase.db
      .collection("Users")
      .doc(this.context.uid)
      .get()
      .then((doc) => {
        let pendingInv = doc.data().teamInvites;
        this.setState({ invites: pendingInv });
        for (let team of this.state.invites) {
          let teamId = team;
          // get team images
          this.props.firebase.storageRef
            .child(`Teams/${teamId}`)
            .getDownloadURL()
            .then((url) => {
              this.setState((state) => {
                const list = state.invitesPics.concat(url);
                return { invitesPics: list };
              });
            });
          // get team names, sizes and admins
          this.props.firebase.db
            .collection("Teams")
            .doc(teamId)
            .get()
            .then((doc) => {
              this.setState((state) => {
                const names = state.invitesName.concat(doc.data().name);
                const sizes = state.teamSizes.concat(doc.data().members.length);
                return {
                  invitesName: names,
                  teamSizes: sizes,
                  isLoading: false,
                };
              });
              console.log(this.state);
            });
        }
      });
  }

  acceptInvite(index) {
    this.setState({ isLoading: true });
    console.log(this.state);
    this.props.firebase.db
      .collection("Users")
      .doc(this.context.uid)
      .get()
      .then((doc) => {
        // move team from teamInvites to teams for the current user
        var invites = doc.data().teamInvites;
        invites = invites.filter((item) => item !== this.state.invites[index]);
        var newTeams = doc.data().teams;
        newTeams.push(this.state.invites[index]);
        console.log(invites, newTeams);
        this.props.firebase.db
          .collection("Users")
          .doc(this.context.uid)
          .update({ teamInvites: invites, teams: newTeams });
        // delete user from team pending requests
        this.props.firebase.db
          .collection("Teams")
          .doc(this.state.invites[index])
          .get()
          .then((dox) => {
            var pendings = dox.data().pendingReq;
            pendings = pendings.filter((item) => item !== this.context.uid);
            this.props.firebase.db
              .collection("Teams")
              .doc(this.state.invites[index])
              .update({ pendingReq: pendings });
          });
      });
    // update states
    console.log(this.state);
    this.setState((state) => {
      let invitesList = this.state.invites.splice(index, 1);
      let invitesPicsList = this.state.invitesPics.splice(index, 1);
      let invitesNameList = this.state.invitesName.splice(index, 1);
      let teamSizesList = this.state.teamSizes.splice(index, 1);
      return {
        invites: invitesList,
        invitesPics: invitesPicsList,
        invitesName: invitesNameList,
        teamSizes: teamSizesList,
      };
    });
    this.setState({ isLoading: false });
    console.log(this.state);
  }

  render() {
    const { classes } = this.props;
    const isLoading = this.state.loading;
    console.log(this.state);
    return (
      <div>
        {isLoading ? (
          <h1 style={this.props.style}>Loading...</h1>
        ) : (
          <AuthUserContext.Consumer>
            {(authUser) => (
              <Grid container spacing={6} style={this.props.style}>
                {this.state.invitesName.map((value, index) => {
                  return (
                    <Grid
                      item
                      xs={4}
                      key={index}
                      className={classes.invitationBox}
                    >
                      <Paper>
                        <Grid container>
                          <Grid item xs={12}>
                            <Avatar
                              className={classes.invitationAvatar}
                              variant="square"
                              alt={this.state.invitesName[index]}
                              src={this.state.invitesPics[index]}
                            />
                          </Grid>
                          <Grid item xs={6} className={classes.centerItems}>
                            <h2 style={{ display: "inline-block" }}>{value}</h2>
                            <p style={{ display: "inline-block" }}>
                              ({this.state.teamSizes[index]} members)
                            </p>
                          </Grid>
                          <Grid item xs={3} className={classes.centerItems}>
                            <IconButton
                              onClick={() => this.acceptInvite(index)}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Grid>
                          <Grid item xs={3} className={classes.centerItems}>
                            <IconButton>
                              <ClearIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </AuthUserContext.Consumer>
        )}
      </div>
    );
  }
}

Invitations.contextType = AuthUserContext;
export default withFirebase(withStyles(styles)(Invitations));
