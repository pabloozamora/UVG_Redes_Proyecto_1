import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import PopUp from "../PopUp/PopUp";
import styles from './SubscribePopUp.module.css';
import useStropheClient from "../../connection/StropheClient";

function SubscribePopUp({
    close,
    isOpen,
    jid,
    callback,
}) {

  const [newJid, setNewJid] = useState(jid)
  const [message, setMessage] = useState('Hola, me gustaría suscribirme a tu presencia');
  const { sendSubscriptionRequest } = useStropheClient();

  const handleSubmit = () => {
    if (!newJid) return;
    console.log('PASÓOOOOOOOO');
    sendSubscriptionRequest(newJid);
    callback();
    close();
  };

  const handleClose = () => {
    callback();
    close();
  };

  useEffect(() => {
    setNewJid(jid || '');
  }, [jid]);

  return (
    isOpen && (
        <PopUp close={handleClose} maxWidth={400} closeButton>
            <div className={styles.subscribePopUpContainer}>
                <h2>Enviar solicitud de suscripción</h2>
                {jid && <p style={{ marginTop: '0' }}>Enviando solicitud a <strong>{jid}</strong></p>}
                {!jid && (
                    <input
                        type="text"
                        placeholder="JID"
                        value={newJid}
                        onChange={(e) => setNewJid(e.target.value)}
                    />
                )}
                <textarea
                    placeholder="Mensaje"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={handleSubmit}>Enviar</button>
            </div>
        </PopUp>
    )
  );
}

SubscribePopUp.propTypes = {
    close: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    jid: PropTypes.string,
    callback: PropTypes.func,
};

SubscribePopUp.defaultProps = {
    isOpen: false,
    jid: '',
    callback: () => {},
};

export default SubscribePopUp;
