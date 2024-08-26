import React, { useState } from "react";
import PropTypes from "prop-types";
import PopUp from "../PopUp/PopUp";
import styles from './JoinGroupPopUp.module.css';
import useStropheClient from "../../connection/StropheClient";

function JoinGroupPopUp({
    close,
    isOpen,
    roomJid,
    passRequired,
    callback,
}) {

  const [nickName, setNickName] = useState('')
  const [password, setPassword] = useState(null);
  const { joinGroupChat, jid } = useStropheClient();

  const handleSubmit = () => {
    console.log(roomJid, nickName, password);
    const roomNick = nickName || jid;
    joinGroupChat(roomJid, roomNick, password);
    callback(roomNick);
    close();
  };

  return (
    isOpen && (
        <PopUp close={close} maxWidth={400} closeButton>
            <div className={styles.subscribePopUpContainer}>
                <h2>Enviar solicitud de suscripción</h2>
                <p style={{ marginTop: '0' }}>Uniéndose a <strong>{roomJid}</strong></p>
                <input
                    type="text"
                    placeholder="Nickname"
                    value={nickName}
                    onChange={(e) => setNickName(e.target.value)}
                />
                {passRequired && (
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
    roomJid: PropTypes.string.isRequired,
    passRequired: PropTypes.bool,
    callback: PropTypes.func,
};

JoinGroupPopUp.defaultProps = {
    isOpen: false,
    callback: () => {},
    passRequired: false,
};

export default JoinGroupPopUp;
