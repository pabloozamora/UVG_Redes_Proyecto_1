import { useState, useContext, useEffect } from 'react';
import { Strophe, $msg, $pres, $build, $iq } from 'strophe.js';
import SessionContext from '../components/context/SessionContext';
import { useNavigate } from 'react-router-dom';
import { XMPP_DOMAIN } from './xmppConfig';

/**
 * Hook para manejar la conexión con el servidor XMPP.
 * @returns {Object} - Funciones para manejar la conexión con el servidor XMPP.
 */
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
    setNewPrivateChat,
    setNewGroupChat,
  } = useContext(SessionContext);
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  /**
    * Función para obtener el JID sin recurso.
    * @param {string} jid - JID completo con recurso.
    * @returns {string} - JID sin recurso.
   */
  const getBareJid = (jid) => {
    return jid.split('/')[0];
  };

  /** 
   * Función que obtiene el JID del usuario conectado
   * @returns {string} - JID del usuario conectado.
   */
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

  /**
   * Función para obtener los contactos del usuario conectado.
   * @returns {void}
   */
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

  /**
   * Handler para manejar las stanzas de presencia y actualizar el estado de los contactos.
   * @param {Element} presence - Estrofa de presencia recibida. 
   */
  const onPresence = (presence) => {
    const type = presence.getAttribute('type');
    const from = presence.getAttribute('from');

    // Verificar si la estrofa contiene un elemento <status>
    const statusNode = presence.getElementsByTagName('status')[0];
    let status = statusNode ? statusNode.textContent : null;

    console.log('STATUS:', status);

    if (type === 'subscribe') {
      // Manejar solicitud de suscripción

      const statusNode = presence.getElementsByTagName('status')[0];
      const status = statusNode ? statusNode.textContent : null;
      console.log(`${from} quiere suscribirse a tu presencia.`);
      setSubRequests((prevSubRequests) => [...prevSubRequests, { from, status }]);

    } else if (type === 'subscribed') {
      // Manejar aceptación de solicitud de suscripción
      console.log(`${from} ha aceptado tu solicitud de suscripción.`);
      setSubRequestsSent((prevSubRequestsSent) => prevSubRequestsSent.filter((jid) => jid !== from));

    } else if (type === 'unsubscribed') {
      // Manejar rechazo de solicitud de suscripción
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
  
      // Actualizar el estado de presencia en el estado de la aplicación
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

  /**
   * Handler para mensajes entrantes.
   * @param {Element} msg - Estrofa de mensaje recibida.
   */
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

      // Actualizar los mensajes de grupo en el estado
      setMessagesByGroup((prevMessagesByGroup) => {
        const groupMessages = prevMessagesByGroup[groupChat] || [];
        return { ...prevMessagesByGroup, [groupChat]: [...groupMessages, { username, messageText, type: 'groupchat', isImage }] };
      });

      setNewGroupChat(true);

      setNewGroupMessage((prevNewGroupMessage) => {
        return { ...prevNewGroupMessage, [groupChat]: true };
      });

    } else if (type === 'chat') {

      from = getBareJid(from);
      console.log(`Private message from ${from}: ${messageText}`);

      // Actualizar los mensajes privados en el estado
      setMessagesByUser((prevMessagesByUser) => {
        const userMessages = prevMessagesByUser[from] || [];
        return { ...prevMessagesByUser, [from]: [...userMessages, { from, messageText, type: 'chat', isImage }] };
      });

      setNewPrivateChat(true);

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

  /**
   * Handler para manejar los estados de conexión.
   * @param {Element} status 
   */
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

  /**
   * Función para manejar la conexión al servidor XMPP.
   */
  const handleConnect = (e) => {
    e.preventDefault();
    console.log('jid', jid);
    console.log('password', password);
    connection.connect(jid, password, onConnect);
  };

  /**
   * Función para manejar la desconexión del servidor XMPP.
   */
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

  /**
   * Función para enviar un mensaje a un usuario.
   * @param {string} message: Mensaje a enviar
   * @param {string} to: JID del destinatario
   */
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

  /**
   * Función para aceptar una solicitud de suscripción.
   * @param {string} from: JID del remitente de la solicitud.
   */
  const handleAcceptSubscription = (from) => {
    connection.send($pres({ to: from, type: 'subscribed' }));
    setSubRequests((prevSubRequests) => prevSubRequests.filter((request) => request.from !== from));
  };

  /**
   * Función para rechazar una solicitud de suscripción.
   * @param {string} from: JID del remitente de la solicitud.
   */
  const handleRejectSubscription = (from) => {
    connection.send($pres({ to: from, type: 'unsubscribed' }));
    setSubRequests((prevSubRequests) => prevSubRequests.filter((request) => request.from !== from));
  }

  /**
   * Función para enviar una solicitud de suscripción a un usuario.
   * @param {string} to: JID del destinatario.
   * @param {string} message: Mensaje personalizado. 
   */
  const sendSubscriptionRequest = (to, message) => {
    // Crear la estrofa de presencia con la solicitud de suscripción y el mensaje
    const presenceStanza = $pres({ to, type: 'subscribe' })
      .c('status').t(message);

    // Enviar la estrofa
    connection.send(presenceStanza.tree());

    // Actualizar el estado para rastrear las solicitudes enviadas
    setSubRequestsSent((prevSubRequestsSent) => [...prevSubRequestsSent, to]);
  };

  /**
   * Función para obtener los chats grupales.
   */
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

  /**
   * Función para unirse a un chat grupal.
   * @param {string} roomJid: JID de la sala.
   * @param {string} nickname: Nickname que el usuario desea usar en la sala.
   * @param {string} password: Contraseña de la sala (opcional).
   */
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

  /**
   * Función para enviar un mensaje a un chat grupal.
   * @param {string} roomJid: JID de la sala.
   * @param {string} message: Mensaje a enviar.
   */
  const sendGroupMessage = (roomJid, message) => {
    const isImageUrl = (url) => {
      return /\.(jpeg|jpg|gif|png)$/.test(url);
    };

    const isImage = isImageUrl(message);

    const messageStanza = $msg({ to: roomJid, type: 'groupchat', })
      .c('body').t(message);
    
    connection.send(messageStanza.tree());
  };

  /**
   * Función para verificar si una sala de chat está protegida por contraseña.
   * @param {string} roomJid: JID de la sala.
   */
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

  /**
   * Función para salir de un chat grupal.
   * @param {string} roomJid: JID de la sala.
   * @param {string} nickname: Nickname del usuario en la sala.
   */
  const leaveGroupChat = (roomJid, nickname) => {
    // Crear la estrofa de presencia con type="unavailable" para salir de la sala
    const presenceStanza = $pres({ to: `${roomJid}/${nickname}`, type: 'unavailable' });
  
    // Enviar la estrofa de presencia
    connection.send(presenceStanza.tree());
  };


  /**
   * Función para crear un chat grupal.
   * @param {string} roomName: Nombre de la sala.
   * @param {string} nickname: Nickname del usuario en la sala.
   * @param {object} options: Opciones de configuración de la sala.
   * @returns 
   */
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
  
      // Configurar la sala como persistente
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

  /**
   * Función para solicitar un slot de carga al servidor para subir un archivo.
   * @param {string} fileName: Nombre del archivo.
   * @param {number} fileSize: Tamaño del archivo en bytes.
   * @returns 
   */
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

  /**
   * Función para actualizar la presencia del usuario.
   * @param {string} show: Nuevo estado de presencia.
   * @param {string} status: Nuevo mensaje de estado.
   */
  const updateMyPresence = (show, status) => {
    const presenceStanza = $pres()
      .c('show').t(show).up()
      .c('status').t(status);
    connection.send(presenceStanza.tree());
  };

  /**
   * Función para obtener el nickname del usuario.
   */
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

  /**
   * Función para actualizar el nickname del usuario.
   * @param {string} newNickname: Nuevo nickname.
   */
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

  /**
   * Función para eliminar la cuenta del usuario.
   */
  const deleteAccount = () => {
    return new Promise((resolve, reject) => {
      const iq = $iq({ type: 'set', to: XMPP_DOMAIN })
        .c('query', { xmlns: 'jabber:iq:register' })
        .c('remove'); // Indica que deseas eliminar la cuenta
  
      connection.sendIQ(iq, (response) => {
        if (response.getAttribute('type') === 'result') {
          console.log('Account deleted successfully');
          resolve('Account deleted successfully');
          handleDisconnect(); // Desconecta al usuario tras eliminar la cuenta
        } else {
          reject('Failed to delete account');
        }
      }, (error) => {
        reject('Failed to delete account: ' + error);
      });
    });
  };

  /**
   * Función para buscar usuarios por nombre de usuario o email.
   * @param {string} searchTerm: Término de búsqueda.
   * @returns 
   */
  const fetchAllUsers = (searchTerm = '') => {
    return new Promise((resolve, reject) => {
      const iq = $iq({ type: 'set', to: 'search.alumchat.lol' })
        .c('query', { xmlns: 'jabber:iq:search' })
        .c('username').t(searchTerm).up()
        .c('email').t(searchTerm).up(); // Puedes buscar por nombre de usuario, email, etc.
    
      connection.sendIQ(iq, (response) => {
        const items = response.getElementsByTagName('item');
        const users = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const jid = item.getAttribute('jid');
          const username = item.getElementsByTagName('username')[0]?.textContent;
          const email = item.getElementsByTagName('email')[0]?.textContent;
          users.push({ jid, username, email });
        }
    
        if (users.length > 0) {
          resolve(users);
        } else {
          reject('No users found');
        }
      }, (error) => {
        reject('Failed to search users: ' + error);
      });
    });
  };
  
  /**
   * Función para obtener los campos de búsqueda disponibles.
   * @returns {Promise} - Promesa con los campos de búsqueda.
   */
  const fetchSearchFields = () => {
    return new Promise((resolve, reject) => {
      const iq = $iq({ type: 'get', to: 'search.alumchat.lol' })
        .c('query', { xmlns: 'jabber:iq:search' });
  
      connection.sendIQ(iq, (response) => {
        const fields = [];
        const query = response.getElementsByTagName('query')[0];
        const children = query ? query.childNodes : [];
  
        for (let i = 0; i < children.length; i++) {
          if (children[i].nodeName !== '#text') {
            fields.push(children[i].nodeName);
          }
        }
  
        resolve(fields);
      }, (error) => {
        reject('Failed to fetch search fields: ' + error);
      });
    });
  };

  /**
   * Función para búsqueda avanzada de usuarios.
   * @param {string} searchTerm: Término de búsqueda.
   * @returns {Promise} - Promesa con los usuarios encontrados.
   */
  const searchUsersAdvanced = (searchTerm) => {
    return new Promise((resolve, reject) => {
      const iq = $iq({ type: 'set', to: 'search.alumchat.lol' })
        .c('query', { xmlns: 'jabber:iq:search' })
        .c('x', { xmlns: 'jabber:x:data', type: 'submit' })
        .c('field', { var: 'FORM_TYPE' }).c('value').t('jabber:iq:search').up().up()
        .c('field', { var: 'search' }).c('value').t(searchTerm).up().up()
        .c('field', { var: 'Username' }).c('value').t('1').up().up()
        .c('field', { var: 'Name' }).c('value').t('1').up().up()
        .c('field', { var: 'Email' }).c('value').t('1').up().up();
  
      connection.sendIQ(iq, (response) => {
        const items = response.getElementsByTagName('item');
        const users = [];
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const fields = item.getElementsByTagName('field');
          const user = {};
  
          for (let j = 0; j < fields.length; j++) {
            const field = fields[j];
            const varAttribute = field.getAttribute('var');
            const value = field.getElementsByTagName('value')[0]?.textContent || '';
  
            if (varAttribute === 'jid') {
              user.jid = value;
            } else if (varAttribute === 'Username') {
              user.username = value;
            } else if (varAttribute === 'Name') {
              user.name = value;
            } else if (varAttribute === 'Email') {
              user.email = value;
            }
          }
  
          users.push(user);
        }
  
        if (users.length > 0) {
          resolve(users);
        } else {
          reject('No se encontraron usuarios');
        }
      }, (error) => {
        reject('Failed to search users: ' + error);
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
    deleteAccount,
    fetchAllUsers,
    fetchSearchFields,
    searchUsersAdvanced,
  };
};

export default useStropheClient;
