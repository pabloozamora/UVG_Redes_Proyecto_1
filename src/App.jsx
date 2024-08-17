import './App.css'
import Login from './components/Login/Login'
import { SessionProvider } from './components/context/SessionContext'
import { BrowserRouter as Router } from 'react-router-dom'
import IndexPage from './pages/IndexPage'

function App() {

  return (
    <SessionProvider>
      <Router>

        <IndexPage />

      </Router>
    </SessionProvider>
  )
}

export default App
