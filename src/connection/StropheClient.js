import { useState, useContext, useEffect } from 'react';
import { Strophe, $msg, $pres, $build, $iq } from 'strophe.js';
import SessionContext from '../components/context/SessionContext';

const useStropheClient = () => {
  const { connection, setLoggedIn, setMessagesByUser, setContacts } = useContext(SessionContext);
  const [jid, setJid] = useState('');
  const [password, setPassword] = useState('');

  // Función para obtener el JID sin el recurso
  const getBareJid = (jid) => {
    return jid.split('/')[0];
  };

  const fetchContacts = () => {
    const iq = $iq({ type: 'get', id: 'roster1' }).c('query', { xmlns: 'jabber:iq:roster' });
    connection.sendIQ(iq, (iqResponse) => {
      const items = iqResponse.getElementsByTagName('item');
      const contactsList = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        contactsList.push({
          jid: item.getAttribute('jid'),
          name: item.getAttribute('name'),
          subscription: item.getAttribute('subscription')
        });
      }
      console.log('Contacts fetched:', contactsList); // Verifica que los contactos se obtengan correctamente
      setContacts(() => contactsList);
    }, (error) => {
      console.error('Failed to fetch contacts:', error);
    });
  };

  const onPresence = (presence) => {
    const type = presence.getAttribute('type');
    const from = presence.getAttribute('from');

    if (type === 'subscribe') {
      console.log(`${from} quiere suscribirse a tu presencia.`);
      // Aquí podrías mostrar una notificación al usuario o manejar la suscripción automáticamente.
    }

    return true;
  };

  const onMessage = (msg) => {
    const from = getBareJid(msg.getAttribute('from'));
    const body = msg.getElementsByTagName('body')[0];
    const messageText = Strophe.getText(body);
    let type = 'received';

    if (!messageText) {
      type = 'seen';
    }

    setMessagesByUser((prevMessagesByUser) => {
      const userMessages = prevMessagesByUser[from] || [];
      return { ...prevMessagesByUser, [from]: [...userMessages, { from, messageText, type }] };
    });
    return true;
  };

  const onConnect = (status) => {
    if (status === Strophe.Status.CONNECTING) {
      console.log('Connecting...');
    } else if (status === Strophe.Status.CONNECTED) {
      console.log('Connected.');
      setLoggedIn(true);
      connection.addHandler(onMessage, null, 'message', null, null, null);
      connection.addHandler(onPresence, null, 'presence', null, null, null);
      connection.send($pres().tree());
      fetchContacts();
    } else if (status === Strophe.Status.CONNFAIL) {
      console.log('Failed to connect.');
    } else if (status === Strophe.Status.DISCONNECTING) {
      console.log('Disconnecting...');
    } else if (status === Strophe.Status.DISCONNECTED) {
      console.log('Disconnected.');
    }
  };

  const handleConnect = () => {
    console.log('jid', jid);
    console.log('password', password);
    connection.connect(jid, password, onConnect);
  };

  const sendMessage = (message, to) => {
    const messageStanza = $msg({ to, type: 'chat' }).c('body').t(message);
    connection.send(messageStanza.tree());

    setMessagesByUser((prevMessagesByUser) => {
      const userMessages = prevMessagesByUser[to] || [];
      return { ...prevMessagesByUser, [to]: [...userMessages, { from: jid, messageText: message, type: 'sent' }] };
    });
  };

  return {
    jid,
    setJid,
    password,
    setPassword,
    sendMessage,
    handleConnect,
  };
};

export default useStropheClient;
