// XmppClient.js
import React, { useState, useEffect } from 'react';
import useStropheClient from '../../connection/StropheClient';

const Login = () => {
  const [message, setMessage] = useState('');
  const {
    chatMessages,
    jid,
    setJid,
    password,
    setPassword,
    handleConnect,
    sendMessage,
    loggedIn,
  } = useStropheClient();

  const handleSendMessage = () => {
    sendMessage(message, 'kie21581-test@alumchat.lol');
    setMessage('');
  }

  return (
    <div>
      <h2>XMPP Chat Client</h2>
      {!loggedIn && (
        <div>
        <p>Aún no has iniciado sesión</p>
        <input
          type="text"
          placeholder="JID"
          value={jid}
          onChange={(e) => setJid(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleConnect}>Connect</button>
      </div>
      )}
      {loggedIn && <p>Sesión iniciada como {jid}</p>}
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
        <h3>Messages</h3>
        {chatMessages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.from}</strong>: {msg.messageText}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Login;
