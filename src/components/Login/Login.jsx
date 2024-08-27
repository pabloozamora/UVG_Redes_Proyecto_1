// Login.jsx
import React, { useState } from 'react';
import useStropheClient from '../../connection/StropheClient';
import styles from './Login.module.css';

/**
 * Función que renderiza un componente de inicio de sesión
 * @returns {JSX.Element} - Componente de inicio de sesión
 */
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
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" onClick={handleConnect}>Iniciar sesión</button>
    </form>
  );
};

export default Login;
