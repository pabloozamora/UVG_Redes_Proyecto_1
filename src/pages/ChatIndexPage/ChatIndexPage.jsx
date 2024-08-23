import React from "react";
import { Route, Routes } from 'react-router-dom';
import PageContainer from "../PageContainer";
import ChatsList from "../ChatsList/ChatsList";
import ChatPage from "../ChatPage/ChatPage";
import ContactsPage from "../ContactsPage/ContactsPage";

function ChatIndexPage() {
    return(
        <PageContainer>
            <Routes>
                <Route path="/" element={<ChatsList />} />
                <Route path="/chat/:jid" element={<ChatPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
            </Routes>
        </PageContainer>
    )
}

export default ChatIndexPage;