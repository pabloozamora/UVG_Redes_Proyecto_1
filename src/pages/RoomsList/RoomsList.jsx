import React, { useEffect, useContext, useState } from "react";
import styles from './RoomsList.module.css';
import useStropheClient from "../../connection/StropheClient";
import SessionContext from "../../components/context/SessionContext";
import { Link } from "react-router-dom";
import usePopUp from "../../hooks/usePopUp";
import JoinGroupPopUp from "../../components/JoinGroupPopUp/JoinGroupPopUp";

function RoomLists() {
  const { rooms, userRooms, setUserRooms, newGroupMessage } = useContext(SessionContext);
  const { fetchGroupChats, checkRoomPassword, leaveGroupChat } = useStropheClient();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [isJoinOpen, openJoin, closeJoin] = usePopUp();

  const handleJoinGroupChat = async (room) => {
    const hasPassword = await checkRoomPassword(room.jid);
    setHasPassword(hasPassword);
    setCurrentRoom(room);
  };

  const closePopUp = () => {
    setCurrentRoom(null);
    setHasPassword(false);
    closeJoin();
  }

  const callBackJoin = (nick) => {
    setUserRooms((prevUserRooms) => [...prevUserRooms, { jid: currentRoom.jid, name: currentRoom.name, nickname: nick }]);
  }

  const handleLeaveGroupChat = (roomJid) => {
    const room = userRooms.find(room => room.jid === roomJid);
    const usernickname = room?.nickname;
    leaveGroupChat(roomJid, usernickname);
    setUserRooms((prevUserRooms) => prevUserRooms.filter(room => room.jid !== roomJid));
  }

  // Filtrar rooms para excluir userRooms
  const availableRooms = rooms.filter(
    (room) => !userRooms.some((userRoom) => userRoom.jid === room.jid)
  );

  useEffect(() => {
    if (!currentRoom) return;
    openJoin();
  }, [currentRoom]);

  useEffect(() => {
    fetchGroupChats();
  }, []);

  return (
    <div className={styles.roomsListPageContainer}>
      <JoinGroupPopUp
        isOpen={isJoinOpen}
        close={closePopUp}
        jid={currentRoom?.jid}
        passRequired={hasPassword}
        callback={callBackJoin}
      />
      <div className={styles.userChatRoomsContainer}>
        <h3>Tus chatrooms</h3>
        {userRooms.map((room, index) => (
          <div key={index} className={styles.roomContainer}>
            <div className={styles.roomData}>
              <div className={styles.roomName}>
                <p style={{ margin: '0' }}><strong>{room.name}</strong></p>
                <p>{room.jid}</p>
              </div>
              {newGroupMessage[room.jid] && <div className={styles.newMessageIndicator}/>}
            </div>
            <div className={styles.roomActions}>
                <Link to={`/groupchat/${room.jid}`} className={styles.chatLink}>
                  <button>Chatear</button>
              </Link>
              <button onClick={() => handleLeaveGroupChat(room.jid)}>Salirse</button>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.userChatRoomsContainer}>
        <h3>Chatrooms disponibles</h3>
        {availableRooms.map((room, index) => (
          <div key={index} className={styles.roomContainer}>
            <div className={styles.roomName}>
              <p style={{ margin: '0' }}><strong>{room.name}</strong></p>
              <p>{room.jid}</p>
            </div>
            <div className={styles.roomActions}>
              <button onClick={() => handleJoinGroupChat(room)}>Unirse</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomLists;