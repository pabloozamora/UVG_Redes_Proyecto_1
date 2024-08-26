import './App.css'
import Login from './components/Login/Login'
import { SessionProvider } from './components/context/SessionContext'
import { BrowserRouter as Router } from 'react-router-dom'
import IndexPage from './pages/IndexPage'

function App() {

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  return (
    <SessionProvider>
      <Router>

        <IndexPage />

      </Router>
    </SessionProvider>
  )
}

export default App
