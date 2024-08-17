import React, { useContext, useEffect, useState } from "react";
import useStropheClient from "../../connection/StropheClient";
import SessionContext from "../../components/context/SessionContext";

function ChatPage() {
	const { loggedIn, connection, messagesByUser, contacts } = useContext(SessionContext);
	const { sendMessage } = useStropheClient();
	const [message, setMessage] = useState('');

	const handleSendMessage = () => {
    sendMessage(message, 'zam21780-gajim@alumchat.lol');
    setMessage('');
  }

  return (
    <div>
      <h1>Mensajes</h1>
      {loggedIn && <p>Sesión iniciada como {connection.jid}</p>}
      <div>
        <input
          type="text"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <div>
        <h3>Messages by User</h3>
        {Object.keys(messagesByUser).map((userJid) => (
          <div key={userJid}>
            <h4>{userJid}</h4>
            {messagesByUser[userJid].map((msg, index) => (
              <div key={index} style={{ textAlign: msg.type === 'sent' ? 'right' : 'left' }}>
                <strong>{msg.type === 'sent' ? 'Yo' : msg.from}</strong>: {msg.messageText}
              </div>
            ))}
          </div>
        ))}
      </div>
			<div>
        <h3>Contacts</h3>
        {contacts.map((contact, index) => (
          <div key={index}>
            <strong>{contact.name || contact.jid}</strong> ({contact.subscription})
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatPage;