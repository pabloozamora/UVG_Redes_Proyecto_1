import React from "react";
import Login from "../../components/Login/Login";
import styles from './LoginPage.module.css';
import PropTypes from 'prop-types';

/**
 * Función que renderiza la página de inicio de sesión
 * @param {setSignUp} setSignUp - Función para cambiar el estado de registro
 * @returns {JSX.Element} - Página de inicio de sesión
 */
function LoginPage({ setSignUp }) {
  return (
    <div className={styles.loginPageContainer}>
      <h1 style={{margin: 0}}>AlumChat</h1>
      <h3>Cliente por Pablo Zamora</h3>
      <h2>Iniciar sesión</h2>
      <Login />
      <span className={styles.registerButton} onClick={setSignUp}>¿Aún no tienes una cuenta? Regístrate</span>
    </div>
  );
}

LoginPage.propTypes = {
  setSignUp: PropTypes.func.isRequired,
};

export default LoginPage;
