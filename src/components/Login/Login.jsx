// Login.jsx
import React, { useState } from 'react';
import useStropheClient from '../../connection/StropheClient';

const Login = () => {
  const {
    chatMessages,
    jid,
    setJid,
    password,
    setPassword,
    sendMessage,
    handleConnect,
  } = useStropheClient();

  return (
    <div>
        <div>
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
        <button onClick={handleConnect}>Iniciar sesión</button>
      </div>
    </div>
  );
};

export default Login;
