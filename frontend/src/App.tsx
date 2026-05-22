import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AdminProvider } from './components/admin'
import { ToastProvider } from './components/Toast'
import Asistentes from './pages/Asistentes'
import BaseDatos from './pages/BaseDatos'
import Salas from './pages/Salas'

export default function App() {
  return (
    <ToastProvider>
      <AdminProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/asistentes" replace />} />
            <Route path="/asistentes" element={<Asistentes />} />
            <Route path="/salas" element={<Salas />} />
            <Route path="/base-datos" element={<BaseDatos />} />
            <Route path="*" element={<Navigate to="/asistentes" replace />} />
          </Route>
        </Routes>
      </AdminProvider>
    </ToastProvider>
  )
}
