import React from "react";
import { Route, Routes } from 'react-router-dom';
import PageContainer from "../PageContainer";
import ChatPage from "../ChatPage";

function ChatIndexPage() {
    return(
        <PageContainer>
            <Routes>
                <Route path="/" element={<ChatPage />} />
            </Routes>
        </PageContainer>
    )
}

export default ChatIndexPage;