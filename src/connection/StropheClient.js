import { useState, useContext, useEffect } from 'react';
import { Strophe, $msg, $pres, $build, $iq } from 'strophe.js';
import SessionContext from '../components/context/SessionContext';

const useStropheClient = () => {
  const {
    connection,
    setLoggedIn,
    setMessagesByUser,
    setContacts,
    setNewMessage,
    setSubRequests,
    setPubSubs,
  } = useContext(SessionContext);
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
      const statusNode = presence.getElementsByTagName('status')[0];
      const status = statusNode ? statusNode.textContent : null;
      console.log(`${from} quiere suscribirse a tu presencia.`);
      setSubRequests((prevSubRequests) => [...prevSubRequests, { from, status }]);
    }

    return true;
  };

  const onMessage = (msg) => {
    const from = getBareJid(msg.getAttribute('from'));
    const body = msg.getElementsByTagName('body')[0];
    const eventNode = msg.getElementsByTagName('event')[0];
    let messageText = '';
    let type = 'received';

    if (body) {
      // Mensaje de chat convencional

      messageText = Strophe.getText(body);

      setNewMessage((prevNewMessage) => {
        return { ...prevNewMessage, [from]: true };
      });
  
      setMessagesByUser((prevMessagesByUser) => {
        const userMessages = prevMessagesByUser[from] || [];
        return { ...prevMessagesByUser, [from]: [...userMessages, { from, messageText, type, newMessage: true }] };
      });

    } else if (eventNode) {

        // Mensaje pubsub - Manejo especial

        const items = eventNode.getElementsByTagName('items')[0];

        if (items) {

            // Identificar el tipo de mensaje pubsub

            const node = items.getAttribute('node');

            if (node === 'http://jabber.org/protocol/nick') { // Mensaje de actualización de nick

                // Extracción del nick publicado en el nodo pubsub

                const item = items.getElementsByTagName('item')[0];
                const nickElement = item ? item.getElementsByTagName('nick')[0] : null;
                const nick = nickElement ? Strophe.getText(nickElement) : '';
                messageText = `Nick actualizado: ${nick}`;
                type = 'pubsub-nick';

                // Actualización del nick en el estado
                setPubSubs((prevPubSubs) => {
                  const userPubSub = prevPubSubs[from] || {}; // Obtén los datos existentes o un objeto vacío
                  return { 
                      ...prevPubSubs, 
                      [from]: { 
                          ...userPubSub, 
                          nick 
                      } 
                  };
              });
            }

            else if (node === 'http://jabber.org/protocol/mood') { // Mensaje de actualización de estado de ánimo
                
                // Extracción del estado de ánimo publicado en el nodo pubsub

                const item = items.getElementsByTagName('item')[0];
                const moodElement = item ? item.getElementsByTagName('mood')[0] : null;
                const mood = moodElement ? Strophe.getText(moodElement) : '';
                messageText = `Estado de ánimo actualizado: ${mood}`;
                type = 'pubsub-mood';

                // Actualización del estado de ánimo en el estado

                setPubSubs((prevPubSubs) => {
                  const userPubSub = prevPubSubs[from] || {}; // Obtén los datos existentes o un objeto vacío
                  return { 
                      ...prevPubSubs, 
                      [from]: { 
                          ...userPubSub, 
                          mood 
                      } 
                  };
                });
                  
            }
        }
    }

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
