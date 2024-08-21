// useXmppClient.js
import { useState, useEffect } from 'react';
import { client, xml } from '@xmpp/client';
import { WEBSOCKET_SERVICE, XMPP_DOMAIN } from './xmppConfig';

const useXmppClient = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [jid, setJid] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  /* const initializeXmpp = (username, password) => {
    xmpp = client({
      service: WEBSOCKET_SERVICE,
      domain: XMPP_DOMAIN,
      username: username,
      password: password,
      resource: 'example',
    });

    xmpp.on('error', (err) => {
      console.error('❌', err.toString());
    });

    xmpp.on('offline', () => {
      console.log('⏹', 'offline');
    });

    xmpp.on('stanza', (stanza) => {
      if (stanza.is('message')) {
        const from = stanza.attrs.from;
        const body = stanza.getChildText('body');
        setChatMessages((prevMessages) => [...prevMessages, { from, messageText: body }]);
      }
    });

    xmpp.on('online', async (address) => {
      console.log('▶️', 'online as', address.toString());
      await xmpp.send(xml('presence'));
      setLoggedIn(true);
    });

    xmpp.on('status', (status) => {
      console.log('status', status);
    });
  };

  useEffect(() => {
    initializeXmpp('test1234', 'test1234');
  }, []); */

  const handleSignUp = () => {
    try {

      const socket = new WebSocket('ws://alumchat.lol:7070/ws', 'xmpp');

      socket.onopen = () => {

        console.log('Conexión abierta');

        // Enviar declaración del encabezado XML y la estanza inicial
        const openStream = `
          <stream:stream 
            to="${XMPP_DOMAIN}" 
            xmlns="jabber:client" 
            xmlns:stream="http://etherx.jabber.org/streams" 
            xml:lang="en"
            version="1.0">
        `;
        console.log('Enviando mensaje de apertura:', openStream);
        socket.send(openStream.trim());
        
      };

      socket.onmessage = (message) => {
        console.log('Mensaje recibido:', message.data);
        if (message.data.includes('<stream:features')) {
          console.log('Características del stream recibidas');
  
        }
  
        // Manejar la respuesta de registro
        if (message.data.includes('<iq') && message.data.includes('jabber:iq:register')) {
          console.log('Respuesta de registro recibida:', message.data);
          // Aquí podrías manejar la respuesta y completar el registro
        }
  
        // Manejar errores
        if (message.data.includes('<stream:error')) {
          console.error('Error de stream:', message.data);
        }
      };

      socket.onclose = () => {
        console.log('Conexión cerrada');
      };

      socket.onerror = (error) => {
        console.error('Error:', error);
      };

    } catch (error) {
      console.error('❌ Registro fallido', error);
    }
  };

  /* const handleConnect = async () => {
    try {
      initializeXmpp(jid, password);

      await xmpp.start();
    } catch (error) {
      console.error('❌ Conexión fallida', error);
    }
  }; */

  /* const sendMessage = async (message, to) => {
    const messageStanza = xml('message', { to, type: 'chat' }, xml('body', {}, message));
    await xmpp.send(messageStanza);
  }; */

  return {
    chatMessages,
    jid,
    setJid,
    password,
    setPassword,
    loggedIn,
    handleSignUp,
  };
};

export default useXmppClient;
