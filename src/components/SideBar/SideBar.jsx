import React, { useContext } from 'react';
import SessionContext from '../context/SessionContext';
import { NavLink } from 'react-router-dom';
import styles from './SideBar.module.css';
import useStropheClient from '../../connection/StropheClient';
import { FaUser, FaUsers } from 'react-icons/fa';
import { IoChatbubble, IoChatbubbles, IoLogOut } from "react-icons/io5";
import { BiSolidContact } from "react-icons/bi";

/**
 * Función que renderiza un componente SideBar
 * @returns {JSX.Element} - Componente SideBar
 */
function SideBar() {
  const { handleDisconnect } = useStropheClient();
  const { newPrivateChat, newGroupChat } = useContext(SessionContext);
  return (
    <div className={styles.sideBarContainer}>
        <div className={styles.sideBarHeader}>
            <h1 className={styles.sideBarTitle}>Alumchat</h1>
            <h3 className={styles.sideBarSubtitle}>Cliente por Pablo Zamora</h3>
        </div>
        <div className={styles.sideBarContent}>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? `${styles.navElement} ${styles.active}` : `${styles.navElement}` )}>
              <FaUser />
              <span>Perfil</span>
            </NavLink>
            <NavLink to="/" className={({ isActive }) => (isActive ? `${styles.navElement} ${styles.active}` : `${styles.navElement}` )}>
              <IoChatbubble />
              <span>Chats</span>
              {newPrivateChat && <div className={styles.newMessageIndicator}></div>}
            </NavLink>
            <NavLink to="/contacts" className={({ isActive }) => (isActive ? `${styles.navElement} ${styles.active}` : `${styles.navElement}` )}>
              <BiSolidContact />
              <span>Contactos</span>
            </NavLink>
            <NavLink to="/rooms" className={({ isActive }) => (isActive ? `${styles.navElement} ${styles.active}` : `${styles.navElement}` )}>
              <IoChatbubbles />
              <span>Salas</span>
              {newGroupChat && <div className={styles.newMessageIndicator}></div>}
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => (isActive ? `${styles.navElement} ${styles.active}` : `${styles.navElement}` )}>
              <FaUsers />
              <span>Usuarios</span>
            </NavLink>
            <div className={`${styles.navElement} ${styles.logoutButton}`} onClick={handleDisconnect}>
              <IoLogOut />
              <span>Cerrar sesión</span>
            </div>
        </div>
    </div>
  );
}

export default SideBar;