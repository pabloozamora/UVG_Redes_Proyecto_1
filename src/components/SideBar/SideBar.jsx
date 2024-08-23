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
            <NavLink to="/" className={({ isActive }) => (isActive ? `${styles.active}` : "" )}>Chat</NavLink>
            <NavLink to="/contacts" className={({ isActive }) => (isActive ? `${styles.active}` : "" )}>Contacts</NavLink>
            <NavLink to="/settings" className={({ isActive }) => (isActive ? `${styles.active}` : "" )}>Settings</NavLink>
            <div className={styles.logoutButton} onClick={handleDisconnect}>Cerrar sesión</div>
        </div>
    </div>
  );
}

export default SideBar;