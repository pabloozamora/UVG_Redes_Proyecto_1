import React, { useContext, useState } from "react";
import SessionContext from "../../components/context/SessionContext";
import LoginPage from "../LoginPage";
import ChatIndexPage from "../ChatIndexPage/ChatIndexPage";
import SignUpPage from "../SignUpPage/SignUpPage";

/**
 * Función que renderiza la página principal de la aplicación fuera de sesión
 * @returns {JSX.Element} - Página principal de la aplicación fuera de sesión
 */
function IndexPage() {
  const { loggedIn } = useContext(SessionContext);
  const [signUp, setSignUp] = useState(false);

	let page;

	if (!loggedIn) {
		if (signUp) {
			page = <SignUpPage setSignUp={setSignUp} />;
		} else {
			page = <LoginPage setSignUp={setSignUp} />;
		}

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