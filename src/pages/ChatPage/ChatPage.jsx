import React, { useState, useContext, useEffect } from "react";
import styles from "./ChatPage.module.css";
import useStropheClient from "../../connection/StropheClient";
import { useParams } from "react-router-dom";
import SessionContext from "../../components/context/SessionContext";

function ChatPage() {
    const { jid } = useParams();
    const [message, setMessage] = useState("");
    const { sendMessage } = useStropheClient();
    const { messagesByUser, setNewMessage } = useContext(SessionContext);
    
    const handleSendMessage = (e) => {
        e.preventDefault();
        sendMessage(message, jid);
        setMessage("");
    };

    const handleNewMessage = () => {
        setNewMessage((prevNewMessage) => {
            return { ...prevNewMessage, [jid]: false };
        });
    }

    const selectedMessages = messagesByUser[jid];
    useEffect(() => {
        handleNewMessage();
    }, [selectedMessages]);
    
    return (
        <div className={styles.chatContainer}>
            <h3 className={styles.chatName}>{jid}</h3>
            <div className={styles.chatMessages}>
                {messagesByUser[jid]?.map((msg, index) => (
                <div
                    key={index}
                    style={{ textAlign: msg.type === "sent" ? "right" : "left" }}
                >
                    <strong>{msg.type === "sent" ? "Yo" : msg.from}</strong>:{" "}
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

export default ChatPage;