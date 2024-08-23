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
    setSubRequestsSent,
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

    // Verificar si la estrofa contiene un elemento <status>
    const statusNode = presence.getElementsByTagName('status')[0];
    let status = statusNode ? statusNode.textContent : null;

    console.log('STATUS:', status);

    if (type === 'subscribe') {
      const statusNode = presence.getElementsByTagName('status')[0];
      const status = statusNode ? statusNode.textContent : null;
      console.log(`${from} quiere suscribirse a tu presencia.`);
      setSubRequests((prevSubRequests) => [...prevSubRequests, { from, status }]);

    } else if (type === 'subscribed') {
      console.log(`${from} ha aceptado tu solicitud de suscripción.`);
      setSubRequestsSent((prevSubRequestsSent) => prevSubRequestsSent.filter((jid) => jid !== from));

    } else if (type === 'unsubscribed') {
      console.log(`${from} ha rechazado tu solicitud de suscripción.`);
      setSubRequestsSent((prevSubRequestsSent) => prevSubRequestsSent.filter((jid) => jid !== from));

    } else { 
      // Manejar presencia sin tipo explícito pero con estado (status)
      console.log(`${from} ha actualizado su estado: ${status}`);
  
      const bareJid = getBareJid(from); // Obtener el JID sin el recurso
  
      // Obtener el nodo <show> si existe, o asumir "available" si no existe
      const showNode = presence.getElementsByTagName('show')[0];
      let show = showNode ? showNode.textContent : "available";

      if (status == 'offline') {
        show = 'xa';
        status = null;
      }
  
      // Aquí podrías actualizar el estado del contacto en tu UI
      setPubSubs((prevPubSubs) => {
          const userPubSub = prevPubSubs[bareJid] || {}; // Obtener los datos existentes o un objeto vacío
  
          // Construir el nuevo objeto de actualización
          const updatedPubSub = {
              ...userPubSub,
              status,
              show // `show` siempre tendrá un valor, "available" si no estaba presente
          };
  
          return { 
              ...prevPubSubs, 
              [bareJid]: updatedPubSub
          };
      });

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
    } else if (status === Strophe.Status.CONNFAIL) {
      console.log('Failed to connect.');
    } else if (status === Strophe.Status.DISCONNECTING) {
      console.log('Disconnecting...');
    } else if (status === Strophe.Status.DISCONNECTED) {
      console.log('Disconnected.');
    }
  };

  const handleConnect = (e) => {
    e.preventDefault();
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

  const handleAcceptSubscription = (from) => {
    connection.send($pres({ to: from, type: 'subscribed' }));
    setSubRequests((prevSubRequests) => prevSubRequests.filter((request) => request.from !== from));
  };

  const handleRejectSubscription = (from) => {
    connection.send($pres({ to: from, type: 'unsubscribed' }));
    setSubRequests((prevSubRequests) => prevSubRequests.filter((request) => request.from !== from));
  }

  const sendSubscriptionRequest = (to, message) => {
    // Crear la estrofa de presencia con la solicitud de suscripción y el mensaje
    const presenceStanza = $pres({ to, type: 'subscribe' })
      .c('status').t(message);

    // Enviar la estrofa
    connection.send(presenceStanza.tree());

    // Actualizar el estado para rastrear las solicitudes enviadas
    setSubRequestsSent((prevSubRequestsSent) => [...prevSubRequestsSent, to]);
};

  return {
    jid,
    setJid,
    password,
    setPassword,
    sendMessage,
    handleConnect,
    handleAcceptSubscription,
    handleRejectSubscription,
    fetchContacts,
    sendSubscriptionRequest,
  };
};

export default useStropheClient;
