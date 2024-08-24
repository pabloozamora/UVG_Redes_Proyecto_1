import React, { useState, useContext, useEffect } from "react";
import styles from "./GroupChatPage.module.css";
import useStropheClient from "../../connection/StropheClient";
import { useParams } from "react-router-dom";
import SessionContext from "../../components/context/SessionContext";

function GroupChatPage() {
    const { jid } = useParams();
    const [message, setMessage] = useState("");
    const { sendGroupMessage } = useStropheClient();
    const { messagesByGroup, setNewGroupMessage, userRooms } = useContext(SessionContext);

    const room = userRooms.find(room => room.jid === jid);
    const usernickname = room?.nickname;
    
    const handleSendMessage = (e) => {
        e.preventDefault();
        sendGroupMessage(jid, message);
        setMessage("");
    };

    const handleNewMessage = () => {
        setNewGroupMessage((prevNewGroupMessage) => {
            return { ...prevNewGroupMessage, [jid]: false };
          });
    }

    const selectedMessages = messagesByGroup[jid];
    useEffect(() => {
        handleNewMessage();
    }, [selectedMessages]);
    
    return (
        <div className={styles.chatContainer}>
            <h3 className={styles.chatName}>{room.name ? room.name : jid}</h3>
            <div className={styles.chatMessages}>
                {messagesByGroup[jid]?.map((msg, index) => (
                <div
                    key={index}
                    style={{ textAlign: msg.username === usernickname ? "right" : "left" }}
                >
                    <strong>{msg.username === usernickname ? "Yo" : msg.username}</strong>:{" "}
                    {msg.messageText}
                </div>
                ))}
            </div>
            <form className={styles.chatInput}>
                <input
                type="text"
                placeholder="Message"
                style={{ width: "100%", height: "30px" }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={handleSendMessage} type="submit">Enviar</button>
            </form>
        </div>
    );
}

export default GroupChatPage;