import React from "react";
import { Route, Routes } from 'react-router-dom';
import PageContainer from "../PageContainer";
import ChatsList from "../ChatsList/ChatsList";
import ChatPage from "../ChatPage/ChatPage";
import ContactsPage from "../ContactsPage/ContactsPage";
import RoomLists from "../RoomsList";
import GroupChatPage from "../GroupChatPage/GroupChatPage";
import ProfilePage from "../ProfilePage";
import UsersPage from "../UsersPage/UsersPage";

/**
 * Función que renderiza la página principal de la aplicación
 * @returns {JSX.Element} - Página principal de la aplicación
 */
function ChatIndexPage() {
    return(
        <PageContainer>
            <Routes>
                <Route path="/" element={<ChatsList />} />
                <Route path="/chat/:jid" element={<ChatPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/rooms" element={<RoomLists />} />
                <Route path="/groupchat/:jid" element={<GroupChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/users" element={<UsersPage />} />
            </Routes>
        </PageContainer>
    )
}

export default ChatIndexPage;