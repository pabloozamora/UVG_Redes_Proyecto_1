import React, { useContext, useState, useEffect } from "react";
import styles from './ProfilePage.module.css';
import SessionContext from "../../components/context/SessionContext";
import useStropheClient from "../../connection/StropheClient";

/**
 * Función que renderiza la página de perfil
 * @returns {JSX.Element} - Página de perfil
 */
function ProfilePage() {
    const { jid, userPresence, setLoggedIn } = useContext(SessionContext);
    const { updateMyPresence, fetchMyNickname, updateMyNickname, deleteAccount } = useStropheClient();
    
    const [nickname, setNickname] = useState('');  // Estado para el nickname
    const [status, setStatus] = useState(userPresence.status);  // Estado para el mensaje de estado
    const [show, setShow] = useState(userPresence.show);  // Estado para el show

    const showClasses = {
        available: { className: styles.greenIndicator, description: 'Disponible' },
        chat: { className: styles.blueIndicator, description: 'Disponible para chatear' },
        away: { className: styles.yellowIndicator, description: 'Ausente' },
        xa: { className: styles.grayIndicator, description: 'No disponible' },
        dnd: { className: styles.redIndicator, description: 'Ocupado' }
      };
      
      const indicator = showClasses[show] || { className: 'defaultIndicator', description: 'Desconocido' };

    const handleUpdateNickname = () => {
        updateMyNickname(nickname)
          .then((message) => {
            console.log(message);
          })
          .catch((error) => {
            console.error(error);
          });
    };

    const handleUpdatePresence = () => {
        updateMyPresence(show, status);  // Actualizar la presencia con el show y el estado

        if (nickname) {
            handleUpdateNickname();  // Actualizar el nickname si no está vacío
        }
    };

    const handleDeleteAccount = async () => {
        try {
          const confirmation = window.confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.");
          if (confirmation) {
            await deleteAccount();
            alert("Cuenta eliminada con éxito");
            setLoggedIn(false);
          }
        } catch (error) {
          console.error(error);
          alert("Ocurrió un error al intentar eliminar la cuenta.");
        }
      };

    useEffect(() => {
        setStatus(userPresence.status);
        setShow(userPresence.show);
      }, [userPresence]);

    useEffect(() => {
    fetchMyNickname()
        .then((nickname) => {
        setNickname(nickname);
        })
        .catch((error) => {
        console.error(error);
        });
    }, []);

    return (
        <div className={styles.profilePageContainer}>
            <h3>Mi perfil</h3>
            <div className={styles.profileInfo}>
                <p style={{ margin: '0' }}>
                    <strong>{jid}</strong>
                </p>
                {nickname && <span> ({nickname})</span>}
                <div className={styles.showContainer}>
                    <div className={indicator.className} />
                    <span>{indicator.description}</span>
                </div>
            </div>
            <div className={styles.profileForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="nickname" style={{ fontWeight: 'bold' }}>Nickname</label>
                    <input
                        type="text"
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Ingresa tu nickname"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="status" style={{ fontWeight: 'bold' }}>Mensaje de estado</label>
                    <input
                        type="text"
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        placeholder="Ingresa tu mensaje de estado"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="show" style={{ fontWeight: 'bold' }}>Mostrar como:</label>
                    <select
                        id="show"
                        value={show}
                        onChange={(e) => setShow(e.target.value)}
                    >
                        <option value="available">Disponible</option>
                        <option value="away">Ausente</option>
                        <option value="xa">No disponible</option>
                        <option value="dnd">Ocupado</option>
                    </select>
                </div>

                <button onClick={handleUpdatePresence} className={styles.updateButton}>
                    Actualizar Presencia
                </button>
            </div>
            <button className={styles.deleteAccountButton} onClick={handleDeleteAccount}>Eliminar cuenta</button>
        </div>
    );
}

export default ProfilePage;
