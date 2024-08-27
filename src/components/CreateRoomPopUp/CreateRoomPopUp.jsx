import React, { useState } from "react";
import PropTypes from "prop-types";
import PopUp from "../PopUp/PopUp";
import styles from './CreateRoomPopUp.module.css';
import useStropheClient from "../../connection/StropheClient";
import { XMPP_DOMAIN } from "../../connection/xmppConfig";

/**
 * Función que renderiza un componente PopUp para crear un chatroom
 * @param {close} close - Función para cerrar el PopUp
 * @param {isOpen} isOpen - Indica si el PopUp está abierto
 * @param {callback} callback - Función de callback al crear el chatroom
 * @returns {JSX.Element} - Componente PopUp para crear un chatroom
 */
function CreateRoomPopUp({
    close,
    isOpen,
    callback,
}) {

  const [roomName, setRoomName] = useState('')
  const [nickName, setNickName] = useState('')
  const [password, setPassword] = useState(null);
  const { createGroupChat, jid } = useStropheClient();

  const handleSubmit = () => {
    const roomNick = nickName || jid;
    const options = { password: password, persistent: true };
    createGroupChat(roomName, roomNick, options);
    callback(`${roomName}@conference.${XMPP_DOMAIN}`, roomName, roomNick);
    close();
  };

  return (
    isOpen && (
        <PopUp close={close} maxWidth={400} closeButton>
            <div className={styles.subscribePopUpContainer}>
                <h2>Crear chatroom</h2>
                <input
                    type="text"
                    placeholder="Nombre de la sala"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Nickname"
                    value={nickName}
                    onChange={(e) => setNickName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Contraseña (Opcional)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleSubmit}>Unirse</button>
            </div>
        </PopUp>
    )
  );
}

CreateRoomPopUp.propTypes = {
    close: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    jid: PropTypes.string.isRequired,
    passRequired: PropTypes.bool,
    callback: PropTypes.func,
};

CreateRoomPopUp.defaultProps = {
    isOpen: false,
    callback: () => {},
    passRequired: false,
};

export default CreateRoomPopUp;
