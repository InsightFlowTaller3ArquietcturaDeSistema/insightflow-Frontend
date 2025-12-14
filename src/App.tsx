import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/loginPage.tsx'
import Register from './pages/registerPage.tsx'
import Tasks from './tasks/pages/taskview.tsx'
import CrudUsuarios from './auth/pages/crudUsuarios.tsx'
import DocumentsView from './documents/pages/documentsView.tsx'
import WorkspaceView from './workspaces/pages/workspaceView.tsx'
import PrivateRoute from './components/PrivateRoute.tsx'
import LandingPage from './pages/landingPage.tsx'

/**
 * Componente principal que define las rutas de la aplicación.
 */
function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Login/>}/>
      <Route path='/Register' element={<Register/>}/>

      {/* Rutas privadas */}
      <Route path='/Dashboard' element={
        <PrivateRoute><LandingPage/></PrivateRoute>
      }>
        <Route index element={<Navigate to="Tasks" replace />} />
        <Route path='Tasks' element={<Tasks />} />
        <Route path='Usuarios' element={<CrudUsuarios />} />
        <Route path='Documents' element={<DocumentsView />} />
        <Route path='Workspaces' element={<WorkspaceView />} />
      </Route>
    </Routes>
  )
}

export default App