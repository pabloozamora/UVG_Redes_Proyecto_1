import React, { useContext } from "react";
import SessionContext from "../../components/context/SessionContext";
import LoginPage from "../LoginPage";
import ChatIndexPage from "../ChatIndexPage/ChatIndexPage";

function IndexPage() {
  const { loggedIn } = useContext(SessionContext);

	let page;

	if (!loggedIn) {
		page = <LoginPage />;

	} else {
		page = <ChatIndexPage />;
	}

  return (
    <>
			{page}
		</>
  );
}

export default IndexPage;