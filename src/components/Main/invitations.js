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
    this.props.firebase.db
      .collection("Users")
      .doc(this.context.uid)
      .get()
      .then((doc) => {
        let teamUid = this.state.invites[index];
        // move team from teamInvites to teams for the current user
        var invites = doc.data().teamInvites;
        invites = invites.filter((item) => item !== this.state.invites[index]);
        var newTeams = doc.data().teams;
        newTeams.push(this.state.invites[index]);
        this.props.firebase.db
          .collection("Users")
          .doc(this.context.uid)
          .update({ teamInvites: invites, teams: newTeams })
          .then(
            // update states
            this.setState((state) => {
              this.state.invites.splice(index, 1);
              this.state.invitesPics.splice(index, 1);
              this.state.invitesName.splice(index, 1);
              this.state.teamSizes.splice(index, 1);
              return {};
            }),
            this.setState({ isLoading: false })
          );
        // move user from team pending requests to team members
        this.props.firebase.db
          .collection("Teams")
          .doc(teamUid)
          .get()
          .then((dox) => {
            var pendings = dox.data().pendingReq;
            pendings = pendings.filter((item) => item !== this.context.uid);
            console.log(pendings);
            this.props.firebase.db
              .collection("Teams")
              .doc(teamUid)
              .update({ pendingReq: pendings });
            this.props.firebase.db
              .collection("Teams")
              .doc(teamUid)
              .get()
              .then((doc) => {
                let newMembers = doc.data().members;
                newMembers.push(this.context.uid);
                this.props.firebase.db
                  .collection("Teams")
                  .doc(teamUid)
                  .update({ members: newMembers });
              });
          });
      });
  }

  declineInvite(index) {
    this.setState({ isLoading: true });
    this.props.firebase.db
      .collection("Users")
      .doc(this.context.uid)
      .get()
      .then((doc) => {
        let teamUid = this.state.invites[index];
        // delete team from teamInvites for the current user
        var invites = doc.data().teamInvites;
        invites = invites.filter((item) => item !== this.state.invites[index]);
        this.props.firebase.db
          .collection("Users")
          .doc(this.context.uid)
          .update({ teamInvites: invites })
          .then(
            // update states
            this.setState((state) => {
              this.state.invites.splice(index, 1);
              this.state.invitesPics.splice(index, 1);
              this.state.invitesName.splice(index, 1);
              this.state.teamSizes.splice(index, 1);
              return {};
            }),
            this.setState({ isLoading: false })
          );
        // remove user from team pending requests
        this.props.firebase.db
          .collection("Teams")
          .doc(teamUid)
          .get()
          .then((dox) => {
            var pendings = dox.data().pendingReq;
            pendings = pendings.filter((item) => item !== this.context.uid);
            this.props.firebase.db
              .collection("Teams")
              .doc(teamUid)
              .update({ pendingReq: pendings });
          });
      });
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
                            <IconButton
                              onClick={() => this.declineInvite(index)}
                            >
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
