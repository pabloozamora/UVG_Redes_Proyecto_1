import React, { useState } from 'react';
import styles from './SignUp.module.css';
import useXmppClient from '../../connection/XMPPClient';
import PropTypes from 'prop-types';

const SignUp = ({ setSignUp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { handleSignUp } = useXmppClient();

  const signUp = (e) => {
    e.preventDefault();
    handleSignUp(username, password);
    setSignUp(false);
  }

  return (
    <form className={styles.loginContainer}>
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" onClick={signUp}>Registrarse</button>
    </form>
  );
};

SignUp.propTypes = {
  setSignUp: PropTypes.func.isRequired,
};

export default SignUp;
