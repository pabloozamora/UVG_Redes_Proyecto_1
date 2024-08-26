import React, { useState, useContext, useEffect } from 'react';
import useStropheClient from '../../connection/StropheClient';
import Contact from '../../components/Contact/Contact';
import styles from './UsersPage.module.css';
import SessionContext from '../../components/context/SessionContext';

function UsersPage() {
    const { searchUsersAdvanced, fetchContacts } = useStropheClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const { pubSubs, contacts, subRequestsSent, jid } = useContext(SessionContext);

  const handleSearch = async () => {
    try {
      const fetchedUsers = await searchUsersAdvanced(searchTerm);
      console.log(fetchedUsers);
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      setError(err);
      setUsers([]);
    }
  };

  // Función para verificar si un usuario es un contacto
  const isContact = (jid) => {
    return contacts.some(contact => contact.jid === jid);
  };


  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className={styles.usersPageContainer}>
      <h3>Buscar Usuarios</h3>
      <input 
        type="text" 
        placeholder="Buscar por nombre, username o email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Buscar</button>
      {error && <p>{error}</p>}
      <div className={styles.usersList}>
        {users.map((user, index) => {
            const contact = isContact(user.jid);
            if (user.jid === jid) return;
            return (
            <Contact
                key={index}
                jid={user.jid}
                status={contact && pubSubs[user.jid] ? pubSubs[user.jid]['status'] : null}
                show={contact && pubSubs[user.jid] ? pubSubs[user.jid]['show'] : null}
                newMessage={false}
            />
        )})}
      </div>
    </div>
  );
}

export default UsersPage;