import React, { useContext, useEffect, useState } from "react";
import useStropheClient from "../../connection/StropheClient";
import SessionContext from "../../components/context/SessionContext";
import Contact from "../../components/Contact/Contact";
import styles from "./ChatsList.module.css";
import { Link } from "react-router-dom";

function ChatsList() {
	const { messagesByUser, newMessage, setNewMessage } = useContext(SessionContext);
  const [currentChat, setCurrentChat] = useState('');

  const handleSeeMessage = (userJid) => {
    setNewMessage((prevNewMessage) => {
      return { ...prevNewMessage, [userJid]: false };
    });
  }

  const selectChat = (jid) => {
    setCurrentChat(jid);
    handleSeeMessage(jid);
  }

  return (
    <div className={styles.chatPageContainer}>
      {!currentChat && (
        <div className={styles.chatsList}>
          <h3>Chats activos</h3>
          {Object.keys(messagesByUser).map((userJid) => (
              <Contact
              key={userJid}
              jid={userJid}
              newMessage={newMessage[userJid]}
              selectChat={selectChat}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatsList;