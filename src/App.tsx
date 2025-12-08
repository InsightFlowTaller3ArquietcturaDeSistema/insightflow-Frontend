import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/loginPage.tsx'
import Register from './pages/registerPage.tsx'
import CrudUsuarios from './auth/pages/crudUsuarios.tsx'
import PrivateRoute from './components/PrivateRoute.tsx'

function App() {
  return (
    <Routes>
      <Route path ="/" element={<Login/>}/>
      <Route path='/Register' element={<Register/>}/>
      <Route path='/Usuarios' element={
        <PrivateRoute>
          <CrudUsuarios/>
        </PrivateRoute>
      }/>
    </Routes>
  )
}

export default App
