import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, Database, Menu, Presentation, Users, X } from 'lucide-react'

function claseNav({ isActive }: { isActive: boolean }): string {
  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-600 text-white'
      : 'text-slate-300 hover:bg-white/10 hover:text-white'
  }`
}

export default function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const cerrar = () => setMenuAbierto(false)

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Fondo oscuro al abrir el menu en movil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={cerrar} />
      )}

      {/* Menu lateral (cajon deslizable en movil, fijo en escritorio) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col bg-[#0b1c3f] text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          menuAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-blue-600 p-1.5">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="text-lg font-bold leading-tight">EVENTO 2026</div>
          </div>
          <button onClick={cerrar} className="text-slate-300 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          <NavLink to="/asistentes" className={claseNav} onClick={cerrar}>
            <Users className="h-5 w-5" />
            Asistentes
          </NavLink>
          <NavLink to="/salas" className={claseNav} onClick={cerrar}>
            <Presentation className="h-5 w-5" />
            Salas / Charlas
          </NavLink>
          <NavLink to="/base-datos" className={claseNav} onClick={cerrar}>
            <Database className="h-5 w-5" />
            Base de Datos
          </NavLink>
        </nav>
      </aside>

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior solo en movil/tablet */}
        <div className="flex items-center gap-3 bg-[#0b1c3f] px-4 py-3 text-white lg:hidden">
          <button onClick={() => setMenuAbierto(true)} aria-label="Abrir menu">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold">EVENTO 2026</span>
        </div>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
