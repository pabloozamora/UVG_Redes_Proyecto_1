import React, { useState, useContext, useEffect, useRef } from "react";
import styles from "./GroupChatPage.module.css";
import useStropheClient from "../../connection/StropheClient";
import { useParams } from "react-router-dom";
import SessionContext from "../../components/context/SessionContext";
import uploadFile from "../../hooks/uploadFile";

/**
 * Función que renderiza la página de Chat de grupo
 * @returns {JSX.Element} - Componente GroupChatPage
 */
function GroupChatPage() {
    const { jid } = useParams();
    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);  // Crear una referencia para el input de tipo 'file'
    const { sendGroupMessage, requestUploadSlot } = useStropheClient();
    const { messagesByGroup, setNewGroupMessage, userRooms } = useContext(SessionContext);

    const room = userRooms.find(room => room.jid === jid);
    const usernickname = room?.nickname;
    
    const handleSendMessage = async (e) => {
        e.preventDefault();

        // Si hay un archivo seleccionado, primero súbelo
        if (selectedFile) {
            try {
                const { putUrl, getUrl } = await requestUploadSlot(selectedFile.name, selectedFile.size);
                console.log("Uploading file to:", putUrl);
                await uploadFile(selectedFile, putUrl);

                // Después de subir el archivo, envía el enlace en el mensaje
                sendGroupMessage(jid, getUrl);
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        } else if (message) {
            // Enviar mensaje de texto normal
            sendGroupMessage(jid, message);
        }

        setMessage("");
        setSelectedFile(null);  // Limpiar el archivo seleccionado después de enviarlo
        fileInputRef.current.value = "";  // Limpiar el input de tipo 'file'
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
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
                    style={{ textAlign: msg.username === usernickname ? "right" : "left", marginTop: "10px" }}
                    className={ msg.username === usernickname ? styles.sentMessage : styles.receivedMessage}
                >
                    <strong>{msg.username === usernickname ? "Yo" : msg.username}</strong>:{" "}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: msg.username === usernickname ?'flex-end' : 'flex-start' }}>
                        {msg.isImage && <img src={msg.messageText} alt="Image" style={{ maxWidth: '200px' }} />}
                        <span>{msg.messageText}</span>
                    </div>
                </div>
                ))}
            </div>
            <form className={styles.chatInput}>
                <input 
                    type="file" 
                    onChange={handleFileChange}  // Manejar la selección del archivo
                    style={{ marginTop: '10px' }}
                    ref={fileInputRef}  // Asignar la referencia al input de tipo 'file'
                />
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