// Login.jsx
import React, { useState } from 'react';
import useStropheClient from '../../connection/StropheClient';
import styles from './Login.module.css';

const Login = () => {
  const {
    jid,
    setJid,
    password,
    setPassword,
    handleConnect,
  } = useStropheClient();

  return (
    <form className={styles.loginContainer}>
      <input
        type="text"
        placeholder="JID"
        value={jid}
        onChange={(e) => setJid(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" onClick={handleConnect}>Iniciar sesión</button>
    </form>
  );
};

export default Login;
