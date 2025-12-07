import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/loginPage.tsx'
import Register from './pages/registerPage.tsx'

function App() {
  return (
    <Routes>
      <Route path ="/" element={<Login/>}/>
      <Route path='/Register' element={<Register/>}/>
    </Routes>
  )
}

export default App
