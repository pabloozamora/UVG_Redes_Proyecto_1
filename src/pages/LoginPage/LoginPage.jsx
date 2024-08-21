import React from "react";
import Login from "../../components/Login/Login";
import styles from './LoginPage.module.css';

function LoginPage() {
  return (
    <div className={styles.loginPageContainer}>
      <h1 style={{margin: 0}}>AlumChat</h1>
      <h3>Cliente por Pablo Zamora</h3>
      <h2>Iniciar sesión</h2>
      <Login />
    </div>
  );
}

export default LoginPage;
