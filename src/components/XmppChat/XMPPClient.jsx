// src/components/XMPPClient.jsx
import React, { useState } from 'react';
import { client } from '@xmpp/client';
import xml from '@xmpp/xml';

const XMPPClient = () => {
  const [status, setStatus] = useState('Disconnected');
  const xmpp = client({
    service: 'ws://alumchat.lol:7070/ws/', // Cambia esto por la URL de tu servidor XMPP
    domain: 'alumchat.lol', // Cambia esto por tu dominio XMPP
    resource: 'example', // Opcional, puedes poner lo que quieras
    username: 'zam21780-gajim', // Cambia esto por tu nombre de usuario
    password: '123', // Cambia esto por tu contraseña
  });
  
  xmpp.start().catch(console.error);

  xmpp.on("online", () => {
    if (status === "Connected") return;
    setStatus("Connected");
  });

  xmpp.on("offline", () => {
    if (status === "Disconnected") return;
    setStatus("Disconnected");
  });

  const sendMessage = (to, body) => {
    const message = xml(
      'message',
      { type: 'chat', to },
      xml('body', {}, body)
    );
    xmpp.send(message);
  };

  return (
    <div>
      <h1>XMPP Client</h1>
      <p>Status: {status}</p>
      <button onClick={() => sendMessage('mor21762-test@alumchat.lol', 'ASDFASDFASDF')}>
        Send Message
      </button>
    </div>
  );
};

export default XMPPClient;
