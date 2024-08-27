import React, { createContext, useEffect, useState } from 'react';
import { WEBSOCKET_SERVICE } from '../../connection/xmppConfig';
import { Strophe } from 'strophe.js';
import PropTypes from 'prop-types';

const SessionContext = createContext();

function SessionProvider({ children }) {
    // El token undefined significa que aún no se ha intentado obtener,
    // null es que la sesión no existe
    const [connection, setConnection] = useState(null);
    const [jid, setJid] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [messagesByUser, setMessagesByUser] = useState({});
    const [messagesByGroup, setMessagesByGroup] = useState({});
    const [newMessage, setNewMessage] = useState({});
    const [newGroupMessage, setNewGroupMessage] = useState({});
    const [subRequests, setSubRequests] = useState([]);
    const [pubSubs, setPubSubs] = useState({});
    const [subRequestsSent, setSubRequestsSent] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [userRooms, setUserRooms] = useState([]);
    const [userPresence, setUserPresence] = useState({});
    const [newPrivateChat, setNewPrivateChat] = useState(false);
    const [newGroupChat, setNewGroupChat] = useState(true);

    useEffect(() => {
      console.log(messagesByUser);
    }, [messagesByUser]);

    const data = {
        connection,
        jid,
        setJid,
        setConnection,
        loggedIn,
        setLoggedIn,
        messagesByUser,
        setMessagesByUser,
        contacts,
        setContacts,
        newMessage,
        setNewMessage,
        subRequests,
        setSubRequests,
        pubSubs,
        setPubSubs,
        subRequestsSent,
        setSubRequestsSent,
        rooms,
        setRooms,
        messagesByGroup,
        setMessagesByGroup,
        newGroupMessage,
        setNewGroupMessage,
        userRooms,
        setUserRooms,
        userPresence,
        setUserPresence,
        newPrivateChat,
        setNewPrivateChat,
        newGroupChat,
        setNewGroupChat,
    };
  
    useEffect(() => {
        const conn = new Strophe.Connection(WEBSOCKET_SERVICE);
        setConnection(conn);
    
        conn.rawInput = (data) => console.log('RECV: ', data);
        conn.rawOutput = (data) => console.log('SENT: ', data);
    
        return () => {
          if (connection) {
            connection.disconnect();
          }
        };
      }, []);
  
    return <SessionContext.Provider value={data}>{children}</SessionContext.Provider>;
  }
  
  export { SessionProvider };
  export default SessionContext;
  
  SessionProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };