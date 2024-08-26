import { useState, useContext, useEffect } from 'react';
import { Strophe, $msg, $pres, $build, $iq } from 'strophe.js';
import SessionContext from '../components/context/SessionContext';
import { useNavigate } from 'react-router-dom';
import { XMPP_DOMAIN } from './xmppConfig';

const useStropheClient = () => {
  const {
    connection,
    jid,
    setJid,
    messagesByGroup,
    setLoggedIn,
    setMessagesByUser,
    setContacts,
    setNewMessage,
    setSubRequests,
    setPubSubs,
    setSubRequestsSent,
    setRooms,
    setNewGroupMessage,
    setMessagesByGroup,
    setUserRooms,
    setUserPresence,
  } = useContext(SessionContext);
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  // Función para obtener el JID sin el recurso
  const getBareJid = (jid) => {
    return jid.split('/')[0];
  };

  // Función para obtener la presencia del usuario conectado
  const getMyPresence = () => {
    const myJid = jid; // Usar el JID del usuario conectado
    const iq = $iq({ type: 'get', to: myJid })
      .c('query', { xmlns: 'jabber:iq:last' });
  
    connection.sendIQ(iq, (response) => {
      const presence = response.getElementsByTagName('presence')[0];
      const statusNode = presence ? presence.getElementsByTagName('status')[0] : null;
      const status = statusNode ? statusNode.textContent : "Available";
      const showNode = presence ? presence.getElementsByTagName('show')[0] : null;
      const show = showNode ? showNode.textContent : "available";
  
      console.log(`My status is: ${status}, and show is: ${show}`);
  
      setUserPresence({ status, show });
    }, (error) => {
      console.error('Failed to retrieve presence:', error);
    });
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
    let from = msg.getAttribute('from');
    const body = msg.getElementsByTagName('body')[0];
    const eventNode = msg.getElementsByTagName('event')[0];
    let messageText = '';
    let type = msg.getAttribute('type');

    const isImageUrl = (url) => {
        return /\.(jpeg|jpg|gif|png)$/.test(url);
    };

    if (body) {
      // Mensaje de chat convencional

      messageText = Strophe.getText(body);
      const isImage = isImageUrl(messageText);

    if (type === 'groupchat') {

      console.log(`Group message from ${from}: ${messageText}`);

      const groupChat = from.split('/')[0];
      const username = from.split('/')[1];

      setMessagesByGroup((prevMessagesByGroup) => {
        const groupMessages = prevMessagesByGroup[groupChat] || [];
        return { ...prevMessagesByGroup, [groupChat]: [...groupMessages, { username, messageText, type: 'groupchat', isImage }] };
      });

      setNewGroupMessage((prevNewGroupMessage) => {
        return { ...prevNewGroupMessage, [groupChat]: true };
      });

    } else if (type === 'chat') {

      from = getBareJid(from);
      console.log(`Private message from ${from}: ${messageText}`);

      setMessagesByUser((prevMessagesByUser) => {
        const userMessages = prevMessagesByUser[from] || [];
        return { ...prevMessagesByUser, [from]: [...userMessages, { from, messageText, type: 'chat', isImage }] };
      });

      setNewMessage((prevNewMessage) => {
        return { ...prevNewMessage, [from]: true };
      });

    }

    } else if (eventNode) {

        // Mensaje pubsub - Manejo especial

        const items = eventNode.getElementsByTagName('items')[0];

        if (items) {

          from = getBareJid(from);

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
      getMyPresence();
    } else if (status === Strophe.Status.CONNFAIL) {
      console.log('Failed to connect.');
    } else if (status === Strophe.Status.DISCONNECTING) {
      console.log('Disconnecting...');
    } else if (status === Strophe.Status.DISCONNECTED) {
      console.log('Disconnected.');
      navigate('/');
    }
  };

  const handleConnect = (e) => {
    e.preventDefault();
    console.log('jid', jid);
    console.log('password', password);
    connection.connect(jid, password, onConnect);
  };

  const handleDisconnect = () => {

    if (connection) {
      // Enviar una estrofa de presencia 'unavailable' antes de desconectarse
      connection.send($pres({ type: 'unavailable' }).tree());
  
      // Desconectar la conexión
      connection.disconnect();
  
      // Actualizar el estado de la aplicación
      setLoggedIn(false);
      setJid('');
      setPassword('');
      setMessagesByUser({});
      setContacts([]);
      setNewMessage({});
      setSubRequests([]);
      setPubSubs({});
      setSubRequestsSent([]);
    }

    connection.disconnect();
  };

  const sendMessage = (message, to) => {

    const isImageUrl = (url) => {
      return /\.(jpeg|jpg|gif|png)$/.test(url);
    };

    const isImage = isImageUrl(message);

    const messageStanza = $msg({ to, type: 'chat' }).c('body').t(message);
    connection.send(messageStanza.tree());

    setMessagesByUser((prevMessagesByUser) => {
      const userMessages = prevMessagesByUser[to] || [];
      return { ...prevMessagesByUser, [to]: [...userMessages, { from: jid, messageText: message, type: 'sent', isImage }] };
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

  const fetchGroupChats = () => {
    const serviceJid = `conference.${XMPP_DOMAIN}`;
  
    const iq = $iq({ to: serviceJid, type: 'get' })
      .c('query', { xmlns: 'http://jabber.org/protocol/disco#items' });
  
    connection.sendIQ(iq, (iqResponse) => {
      const items = iqResponse.getElementsByTagName('item');
      const rooms = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        rooms.push({
          jid: item.getAttribute('jid'),
          name: item.getAttribute('name'),
        });
      }
      console.log('Group chats:', rooms);
      setRooms(() => rooms);
    }, (error) => {
      console.error('Failed to fetch group chats:', error);
    });
  };

  const joinGroupChat = (roomJid, nickname, password = null) => {
    // Crear la estrofa de presencia para unirse a la sala
    let presenceStanza = $pres({ to: `${roomJid}/${nickname}` })
      .c('x', { xmlns: 'http://jabber.org/protocol/muc' });
    
    // Si se proporciona una contraseña, agregarla a la estrofa
    if (password) {
      presenceStanza.c('password').t(password);
    }
    
    // Enviar la estrofa de presencia
    connection.send(presenceStanza.tree());
  };

  const sendGroupMessage = (roomJid, message) => {
    const isImageUrl = (url) => {
      return /\.(jpeg|jpg|gif|png)$/.test(url);
    };

    const isImage = isImageUrl(message);

    const messageStanza = $msg({ to: roomJid, type: 'groupchat', })
      .c('body').t(message);
    
    connection.send(messageStanza.tree());
  };

  const checkRoomPassword = async (roomJid) => {
    return new Promise((resolve, reject) => {
      const iq = $iq({ to: roomJid, type: 'get' })
        .c('query', { xmlns: 'http://jabber.org/protocol/disco#info' });
  
      connection.sendIQ(iq, (response) => {
        const features = response.getElementsByTagName('feature');
        let hasPassword = false;
  
        for (let i = 0; i < features.length; i++) {
          const feature = features[i];
          if (feature.getAttribute('var') === 'muc_passwordprotected') {
            hasPassword = true;
            break;
          }
        }
  
        resolve(hasPassword); // Resolución con `true` o `false`
      }, (error) => {
        reject('Failed to retrieve room info: ' + error);
      });
    });
  };

  const leaveGroupChat = (roomJid, nickname) => {
    // Crear la estrofa de presencia con type="unavailable" para salir de la sala
    const presenceStanza = $pres({ to: `${roomJid}/${nickname}`, type: 'unavailable' });
  
    // Enviar la estrofa de presencia
    connection.send(presenceStanza.tree());
  };

  const createGroupChat = async (roomName, nickname, options = {}) => {
    const roomJid = `${roomName}@conference.${XMPP_DOMAIN}`;
  
    // Unirse a la sala para crearla (XMPP crea la sala automáticamente si no existe)
    let presenceStanza = $pres({ to: `${roomJid}/${nickname}` })
      .c('x', { xmlns: 'http://jabber.org/protocol/muc' });
  
    connection.send(presenceStanza.tree());
  
    // Configurar la sala (si es necesario) enviando un IQ "set"
    return new Promise((resolve, reject) => {
      const iq = $iq({ to: roomJid, type: 'set' })
        .c('query', { xmlns: 'http://jabber.org/protocol/muc#owner' })
        .c('x', { xmlns: 'jabber:x:data', type: 'submit' });
  
      // Ejemplo: Configurar la sala como persistente y protegida por contraseña
      iq.c('field', { var: 'muc#roomconfig_persistentroom' })
        .c('value').t(options.persistent ? '1' : '0').up()
        .up();
  
      if (options.password) {
        iq.c('field', { var: 'muc#roomconfig_passwordprotectedroom' })
          .c('value').t('1').up()
          .up()
          .c('field', { var: 'muc#roomconfig_roomsecret' })
          .c('value').t(options.password).up()
          .up();
      }
  
      connection.sendIQ(iq, (response) => {
        console.log('Room created and configured:', roomJid);
        resolve(roomJid);
      }, (error) => {
        console.error('Failed to create room:', error);
        reject(error);
      });
    });
  };

  const requestUploadSlot = async (fileName, fileSize) => {
    return new Promise((resolve, reject) => {
      const iq = $iq({ type: 'get', to: 'httpfileupload.alumchat.lol' })
        .c('request', { xmlns: 'urn:xmpp:http:upload:0', filename: fileName, size: fileSize });
  
      connection.sendIQ(iq, (response) => {
        const slot = response.getElementsByTagName('slot')[0];
        const putUrl = slot.getElementsByTagName('put')[0].getAttribute('url');  // Obtener la URL del atributo 'url'
        const getUrl = slot.getElementsByTagName('get')[0].getAttribute('url');

        console.log('PUT URL:', putUrl);
        resolve({ putUrl, getUrl });
      }, (error) => {
        reject('Failed to get upload slot: ' + error);
      });
    });
  };

  const updateMyPresence = (show, status) => {
    const presenceStanza = $pres()
      .c('show').t(show).up()
      .c('status').t(status);
    connection.send(presenceStanza.tree());
  };

  const fetchMyNickname = () => {
    return new Promise((resolve, reject) => {
      const iq = $iq({ type: 'get' })  // Eliminar el "to: jid" ya que no es necesario para obtener el propio nickname
        .c('query', { xmlns: 'jabber:iq:private' })
        .c('nick', { xmlns: 'http://jabber.org/protocol/nick' });
      
      connection.sendIQ(iq, (response) => {
        const nicknameElement = response.getElementsByTagName('nick')[0];
        const nickname = nicknameElement ? nicknameElement.textContent : null;
  
        if (nickname) {
          resolve(nickname);
        } else {
          reject('Nickname not found');
        }
      }, (error) => {
        reject('Failed to fetch nickname: ' + error);
      });
    });
  };

  const updateMyNickname = (newNickname) => {
    return new Promise((resolve, reject) => {
      const iq = $iq({ type: 'set' })  // Eliminamos 'to: jid'
        .c('query', { xmlns: 'jabber:iq:private' })
        .c('nick', { xmlns: 'http://jabber.org/protocol/nick' })
        .t(newNickname);
      
      connection.sendIQ(iq, (response) => {
        resolve('Nickname updated successfully');
      }, (error) => {
        reject('Failed to update nickname: ' + error);
      });
    });
  };


  return {
    jid,
    setJid,
    password,
    setPassword,
    sendMessage,
    handleConnect,
    handleDisconnect,
    handleAcceptSubscription,
    handleRejectSubscription,
    fetchContacts,
    fetchGroupChats,
    sendSubscriptionRequest,
    joinGroupChat,
    sendGroupMessage,
    checkRoomPassword,
    leaveGroupChat,
    createGroupChat,
    requestUploadSlot,
    updateMyPresence,
    fetchMyNickname,
    updateMyNickname,
  };
};

export default useStropheClient;
