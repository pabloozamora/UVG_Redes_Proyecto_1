import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './SideBar.module.css';
import useStropheClient from '../../connection/StropheClient';

function SideBar() {
  const { handleDisconnect } = useStropheClient();
  return (
    <div className={styles.sideBarContainer}>
        <div className={styles.sideBarHeader}>
            <h1>Alumchat</h1>
        </div>
        <div className={styles.sideBarContent}>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? `${styles.active}` : "" )}>Perfil</NavLink>
            <NavLink to="/" className={({ isActive }) => (isActive ? `${styles.active}` : "" )}>Chats</NavLink>
            <NavLink to="/contacts" className={({ isActive }) => (isActive ? `${styles.active}` : "" )}>Contactos</NavLink>
            <NavLink to="/rooms" className={({ isActive }) => (isActive ? `${styles.active}` : "" )}>Grupos</NavLink>
            <div className={styles.logoutButton} onClick={handleDisconnect}>Cerrar sesión</div>
        </div>
    </div>
  );
}

export default SideBar;