import React from 'react';
import PropTypes from 'prop-types';
import styles from './Contact.module.css';
import { Link } from "react-router-dom";

function Contact({ jid, status, newMessage, nick }) {

  return (
    <Link to={`/${jid}`} key={jid}>
      <div className={styles.contactContainer}>
        <div className={styles.contactInfo}>
          <strong>{nick ? nick : jid}</strong>
          {status && <span> ({status})</span>}
        </div>
        {newMessage && <div className={styles.newMessageIndicator} />}
      </div>
    </Link>
  );
}

Contact.propTypes = {
  jid: PropTypes.string.isRequired,
  subscription: PropTypes.string,
  newMessage: PropTypes.bool.isRequired,
  nick: PropTypes.string,
};

Contact.defaultProps = {
  subscription: '',
  newMessage: false,
  nick: '',
};

export default Contact;