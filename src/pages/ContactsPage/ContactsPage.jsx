import React, { useContext, useEffect, useState } from "react";
import styles from "./ContactsPage.module.css";
import SessionContext from "../../components/context/SessionContext";
import Contact from "../../components/Contact/Contact";
import useStropheClient from "../../connection/StropheClient";
import usePopUp from "../../hooks/usePopUp";
import SubscribePopUp from "../../components/SuscribePopUp";

function ContactsPage() {
    const { contacts, subRequests, pubSubs, subRequestsSent } = useContext(SessionContext);
    const [subscribeToJid, setSubscribeToJid] = useState('');
    const {
        handleAcceptSubscription,
        handleRejectSubscription,
        fetchContacts,
        sendSubscriptionRequest,
    } = useStropheClient();
    const [isSuscribeOpen, openSuscribe, closeSuscribe] = usePopUp();

    useEffect(() => {
        if (!subscribeToJid) return;
        openSuscribe();
    }, [subscribeToJid]);


    useEffect(() => {
        fetchContacts();
        console.log(pubSubs);
    }, [subRequests, pubSubs, subRequestsSent]);

     // Clasificación de contactos por tipo de suscripción
     const subscribedContacts = contacts.filter(contact => contact.subscription === "both"); // contactos mutuos
     const pendingInContacts = contacts.filter(contact => contact.subscription === "from"); // contactos donde la suscripción al contacto está pendiente
     const pendingOutContacts = contacts.filter(contact => contact.subscription === "to"); // contactos donde la suscripción a la parte actual está pendiente

    return (
        <div className={styles.contactsPageContainer}>
            <SubscribePopUp isOpen={isSuscribeOpen} close={closeSuscribe} jid={subscribeToJid} callback={() => setSubscribeToJid('')}/>
            <div className={styles.requestsList}>
                <h3>Solicitudes de suscripción</h3>
                <p>Estos usuarios están solicitando suscribirse a tu presencia</p>
                {subRequests.map((request, index) => (
                    <div key={index} className={styles.request}>
                        <p style={{ margin: '0'}}><strong>{request.from}</strong></p>
                        <p>{request.status}</p>
                        <div className={styles.requestActions}>
                            <button onClick={() => handleAcceptSubscription(request.from)}>Aceptar</button>
                            <button onClick={() => handleRejectSubscription(request.from)}>Rechazar</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.contactsList}>
                <h3>Siguiendo</h3>
                <button onClick={openSuscribe}>Agregar</button>
                <p>Estas suscrito a la presencia de estos usuarios</p>
                {pendingOutContacts.map((contact, index) => (
                    <Contact
                        key={index}
                        jid={contact.jid}
                        nick={pubSubs[contact.jid] ? pubSubs[contact.jid]['nick'] : null}
                        status={pubSubs[contact.jid] ? pubSubs[contact.jid]['status'] : null}
                        show={pubSubs[contact.jid] ? pubSubs[contact.jid]['show'] : null}
                        newMessage={false} />
                ))}
            </div>
            <div className={styles.contactsList}>
                <h3>Seguidores</h3>
                <p>Estos usuarios están suscritos a tu presencia</p>
                {pendingInContacts.map((contact, index) => (
                    <Contact
                        key={index}
                        jid={contact.jid}
                        nick={pubSubs[contact.jid] ? pubSubs[contact.jid]['nick'] : null}
                                                status={pubSubs[contact.jid] ? pubSubs[contact.jid]['status'] : null}
                        newMessage={false}
                        subRequestSent={subRequestsSent.includes(contact.jid)} 
                        requestFollow={subRequestsSent.includes(contact.jid) ? null : () => setSubscribeToJid(contact.jid)}/>
                        
                ))}
            </div>
            <div className={styles.contactsList}>
                <h3>Contactos</h3>
                <p>Tú y estos contactos están suscritos a la presencia del otro</p>
                {subscribedContacts.map((contact, index) => (
                    <Contact
                        key={index}
                        jid={contact.jid}
                        nick={pubSubs[contact.jid] ? pubSubs[contact.jid]['nick'] : null}
						status={pubSubs[contact.jid] ? pubSubs[contact.jid]['status'] : null}
                        show={pubSubs[contact.jid] ? pubSubs[contact.jid]['show'] : null}
                        newMessage={false} />
                ))}
            </div>
        </div>
    );
}

export default ContactsPage;