import React, { useState } from "react";
import PropTypes from "prop-types";
import PopUp from "../PopUp/PopUp";
import styles from './JoinGroupPopUp.module.css';
import useStropheClient from "../../connection/StropheClient";

/**
 * Función que renderiza un componente PopUp para unirse a un chatroom
 * @param {close} close - Función para cerrar el PopUp
 * @param {isOpen} isOpen - Indica si el PopUp está abierto
 * @param {roomJid} roomJid - JID de la sala
 * @param {passRequired} passRequired - Indica si la sala requiere contraseña
 * @param {callback} callback - Función de callback al unirse a la sala
 * @param {manualCallback} manualCallback - Función de callback al unirse a la sala manualmente
 * @returns 
 */
function JoinGroupPopUp({
    close,
    isOpen,
    roomJid,
    passRequired,
    callback,
    manualCallback,
}) {

  const [nickName, setNickName] = useState('')
  const [password, setPassword] = useState(null);
  const { joinGroupChat, jid } = useStropheClient();
  const [manualRoomJid, setManualRoomJid] = useState('');

  const handleSubmit = () => {
    const roomNick = nickName || jid;
    if (!roomJid) {
            if (!manualRoomJid) return;
            joinGroupChat(manualRoomJid, roomNick, password);
            manualCallback(manualRoomJid, roomNick);

        } else {
            joinGroupChat(roomJid, roomNick, password);
            callback(roomNick);
    }
    close();
  };

  return (
    isOpen && (
        <PopUp close={close} maxWidth={400} closeButton>
            <div className={styles.subscribePopUpContainer}>
                <h2>Enviar solicitud de suscripción</h2>
                {roomJid && <p style={{ marginTop: '0' }}>Uniéndose a <strong>{roomJid}</strong></p>}
                {!roomJid && (
                    <input
                        type="text"
                        placeholder="JID de la sala"
                        value={manualRoomJid}
                        onChange={(e) => setManualRoomJid(e.target.value)}
                    />
                )}
                <input
                    type="text"
                    placeholder="Nickname"
                    value={nickName}
                    onChange={(e) => setNickName(e.target.value)}
                />
                {(passRequired || !roomJid) && (
                    <input
                        type="text"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                )}
                <button onClick={handleSubmit}>Unirse</button>
            </div>
        </PopUp>
    )
  );
}

JoinGroupPopUp.propTypes = {
    close: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    roomJid: PropTypes.string,
    passRequired: PropTypes.bool,
    callback: PropTypes.func,
    manualCallback: PropTypes.func,
};

JoinGroupPopUp.defaultProps = {
    isOpen: false,
    callback: () => {},
    roomJid: '',
    passRequired: false,
    manualCallback: null,
};

export default JoinGroupPopUp;
