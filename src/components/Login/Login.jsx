// Login.jsx
import React, { useState } from 'react';
import useStropheClient from '../../connection/StropheClient';
import styles from './Login.module.css';
import useXmppClient from '../../connection/XMPPClient';

const Login = () => {
  const {
    chatMessages,
    jid,
    setJid,
    password,
    setPassword,
    sendMessage,
    handleConnect,
  } = useStropheClient();

  const {
    handleSignUp,
  } = useXmppClient();

  return (
    <div className={styles.loginContainer}>
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
      <button onClick={handleConnect}>Iniciar sesión</button>
    </div>
  );
};

export default Login;
