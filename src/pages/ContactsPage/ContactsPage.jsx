import React, { useContext, useEffect } from "react";
import styles from "./ContactsPage.module.css";
import SessionContext from "../../components/context/SessionContext";
import Contact from "../../components/Contact/Contact";

function ContactsPage() {
    const { contacts, subRequests, pubSubs } = useContext(SessionContext);

    return (
        <div className={styles.contactsPageContainer}>
            <div className={styles.requestsList}>
                <h3>Solicitudes de suscripción</h3>
                {subRequests.map((request, index) => (
                    <div key={index} className={styles.request}>
                        <p>{request.from}</p>
                        <p>{request.status}</p>
                        <button>Aceptar</button>
                        <button>Rechazar</button>
                    </div>
                ))}
            </div>
            <div className={styles.contactsList}>
                <h3>Contactos</h3>
                {contacts.map((contact, index) => (
                    <Contact
                        key={index}
                        jid={contact.jid}
                        nick={pubSubs[contact.jid] ? pubSubs[contact.jid]['nick'] : null}
												status={pubSubs[contact.jid] ? pubSubs[contact.jid]['status'] : null}
                        newMessage={false} />
                ))}
            </div>
        </div>
    );
}

export default ContactsPage;