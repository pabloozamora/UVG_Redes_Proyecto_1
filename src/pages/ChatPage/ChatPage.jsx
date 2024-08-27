import React, { useState, useContext, useEffect, useRef } from "react";
import styles from "./ChatPage.module.css";
import useStropheClient from "../../connection/StropheClient";
import { useParams } from "react-router-dom";
import SessionContext from "../../components/context/SessionContext";
import uploadFile from "../../hooks/uploadFile";

/**
 * Función que renderiza la página de Chat privado
 * @returns {JSX.Element} - Componente ChatPage
 */
function ChatPage() {
    const { jid } = useParams();
    const [message, setMessage] = useState("");
    const { sendMessage, requestUploadSlot } = useStropheClient();
    const [selectedFile, setSelectedFile] = useState(null);
    const { messagesByUser, setNewMessage } = useContext(SessionContext);
    const fileInputRef = useRef(null);  // Crear una referencia para el input de tipo 'file'
    
    const handleSendMessage = async (e) => {
        e.preventDefault();

        // Si hay un archivo seleccionado, primero súbelo
        if (selectedFile) {
            try {
                const { putUrl, getUrl } = await requestUploadSlot(selectedFile.name, selectedFile.size);
                console.log("Uploading file to:", putUrl);
                await uploadFile(selectedFile, putUrl);

                // Después de subir el archivo, envía el enlace en el mensaje
                sendMessage(getUrl, jid);
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        } else if (message) {
            // Enviar mensaje de texto normal
            sendMessage(message, jid);
        }

        setMessage("");
        setSelectedFile(null);  // Limpiar el archivo seleccionado después de enviarlo
        fileInputRef.current.value = "";  // Limpiar el input de tipo 'file'
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
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
                    style={{ textAlign: msg.type === "sent" ? "right" : "left", marginTop: "10px" }}
                    className={msg.type === "sent" ? styles.sentMessage : styles.receivedMessage}
                >
                    <strong>{msg.type === "sent" ? "Yo" : msg.from}</strong>:{" "}
                    <div
                    style={{ display: "flex", flexDirection: "column", alignItems: msg.type === "sent" ? "flex-end" : "flex-start"}}>
                        {msg.isImage && <img src={msg.messageText} alt="Image" style={{ maxWidth: '200px' }} />}
                        {msg.messageText}
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

export default ChatPage;