import React from "react";
import SignUp from "../../components/SignUp";
import styles from "./SignUpPage.module.css";
import PropTypes from "prop-types";

function SignUpPage({ setSignUp }) {
  return (
    <div className={styles.loginPageContainer}>
      <h1 style={{margin: 0}}>AlumChat</h1>
      <h3>Cliente por Pablo Zamora</h3>
      <h2>Registrarse</h2>
      <SignUp setSignUp={setSignUp} />
    </div>
  );
}

SignUpPage.propTypes = {
  setSignUp: PropTypes.func.isRequired,
};

export default SignUpPage;