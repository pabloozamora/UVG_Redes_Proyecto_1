import React from 'react';
import PropTypes from 'prop-types';
import styles from './Contact.module.css';
import { Link } from "react-router-dom";

/**
 * Función que renderiza un componente Contacto
 * @param {String} jid - JID del contacto
 * @param {String} status - Estado del contacto
 * @param {Boolean} newMessage - Indica si hay mensajes nuevos
 * @param {String} nick - Nickname del contacto
 * @param {Function} requestFollow - Función para solicitar seguir al contacto
 * @param {Boolean} subRequestSent - Indica si la solicitud de suscripción fue enviada
 * @returns {JSX.Element} - Componente Contacto
 */
function Contact({ jid, status, newMessage, nick, requestFollow, subRequestSent, show }) {

  const showClasses = {
    available: { className: styles.greenIndicator, description: 'Disponible' },
    chat: { className: styles.blueIndicator, description: 'Disponible para chatear' },
    away: { className: styles.yellowIndicator, description: 'Ausente' },
    xa: { className: styles.grayIndicator, description: 'No disponible' },
    dnd: { className: styles.redIndicator, description: 'Ocupado' }
  };
  
  const indicator = showClasses[show] || { className: 'defaultIndicator', description: 'Desconocido' };

  return (
    
      <div className={styles.contactContainer}>
        <div className={styles.contactInfoContainer}>
          <div className={styles.contactInfo}>
            <strong>{nick ? nick : jid}</strong>
            {show && (
              <div className={styles.showContainer}>
                <div className={indicator.className} />
                <span>{indicator.description}</span>
              </div>
            )}
            {status && <span>{status}</span>}
          </div>
          {newMessage && <div className={styles.newMessageIndicator} />}
        </div>
        {subRequestSent && <span>Solicitud de suscripción enviada</span>}
        <div className={styles.contactActions}>
          {requestFollow && <button onClick={() => requestFollow(jid)}>Seguir</button>}
          <Link to={`/chat/${jid}`} className={styles.chatLink}>
              <button>Chatear</button>
          </Link>
        </div>
      </div>
  );
}

Contact.propTypes = {
  jid: PropTypes.string.isRequired,
  subscription: PropTypes.string,
  newMessage: PropTypes.bool.isRequired,
  nick: PropTypes.string,
  requestFollow: PropTypes.func,
  subRequestSent: PropTypes.bool,
  status: PropTypes.string,
  show: PropTypes.string,
};

Contact.defaultProps = {
  newMessage: false,
  nick: '',
  status: '',
  requestFollow: null,
  subRequestSent: false,
  show: '',
};

export default Contact;