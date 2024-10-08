import React, { useContext, useEffect } from "react";
import SessionContext from "../../components/context/SessionContext";
import Contact from "../../components/Contact/Contact";
import styles from "./ChatsList.module.css";

/**
 * Función que renderiza la lista de chats activos
 * @returns {JSX.Element} - Componente ChatsList
 */
function ChatsList() {
	const { messagesByUser, newMessage, newPrivateChat, setNewPrivateChat } = useContext(SessionContext);

   // Filtrar mensajes para incluir solo los de tipo "chat"
   const filteredMessagesByUser = Object.keys(messagesByUser)
   .filter((userJid) => 
     messagesByUser[userJid].some(message => message.type === "chat" || message.type === "sent")
   )
   .reduce((filtered, userJid) => {
     filtered[userJid] = messagesByUser[userJid];
     return filtered;
   }, {});

  useEffect(() => {
    setNewPrivateChat(false);
  },[newPrivateChat]);

  return (
    <div className={styles.chatPageContainer}>
        <div className={styles.chatsList}>
          <h3>Chats activos</h3>
          {Object.keys(filteredMessagesByUser).map((userJid) => (
              <Contact
              key={userJid}
              jid={userJid}
              newMessage={newMessage[userJid]}
            />
          ))}
        </div>
    </div>
  );
}

export default ChatsList;