import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { SignUpForm } from "./sign_up";
import { SignInForm } from "./sign_in";

const styles = (theme) => ({
  media: {
    height: 240,
    backgroundColor: "lightblue",
    fontSize: "1000%",
    textAlign: "center",
    width: "100%",
  },
});

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <h1>Landing Page</h1>
        <h2>Sign Up</h2>
        <SignUpForm></SignUpForm>
        <h3>sau</h3>
        <h2>Sign In</h2>
        <SignInForm></SignInForm>
      </div>
    );
  }
}

export default withStyles(styles)(LandingPage);
