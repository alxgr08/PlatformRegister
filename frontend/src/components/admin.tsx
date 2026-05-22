import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { clearAdminKey, getAdminKey, loginAdmin, setAdminKey } from '../api'

interface AdminContextValor {
  /** true si el usuario actual tiene sesión de admin activada */
  esAdmin: boolean
  /** Autentica al usuario como admin. Lanza error si la clave es incorrecta. */
  ingresar: (clave: string) => Promise<void>
  /** Cierra la sesión de admin y limpia localStorage */
  salir: () => void
}

const AdminContext = createContext<AdminContextValor | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin(): AdminContextValor {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin debe usarse dentro de AdminProvider')
  return ctx
}

/**
 * Proveedor de contexto global para la sesión de administrador.
 * 
 * Características:
 * - La sesión se persiste en localStorage por dispositivo
 * - Por defecto, nuevos usuarios comienzan sin privilegios de admin
 * - Una vez autenticado, no se vuelve a pedir la clave en ese dispositivo
 * - El admin puede cerrar sesión manualmente
 */
export function AdminProvider({ children }: { children: ReactNode }) {
  const [esAdmin, setEsAdmin] = useState<boolean>(() => !!getAdminKey())

  const ingresar = useCallback(async (clave: string) => {
    // Valida la clave contra el backend
    await loginAdmin(clave)
    // Si es correcta, la persiste en localStorage
    setAdminKey(clave)
    // Actualiza el estado local
    setEsAdmin(true)
  }, [])

  const salir = useCallback(() => {
    // Limpia la clave del localStorage y resetea el estado
    clearAdminKey()
    setEsAdmin(false)
  }, [])

  return (
    <AdminContext.Provider value={{ esAdmin, ingresar, salir }}>
      {children}
    </AdminContext.Provider>
  )
}

/** Ventana para ingresar la clave de administrador. */
export function AdminLoginModal({ onCerrar }: { onCerrar: () => void }) {
  const { ingresar } = useAdmin()
  const [clave, setClave] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function enviar() {
    if (!clave.trim()) return
    setCargando(true)
    setError(null)
    try {
      await ingresar(clave.trim())
      alert('Acceso de administrador activado en este dispositivo.')
      onCerrar()
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : 'Clave incorrecta'
      setError(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <span className="text-lg">🔒</span>
            Ingresar como administrador
          </div>
          <button 
            onClick={onCerrar} 
            className="text-slate-400 hover:text-slate-600 text-lg" 
            title="Cerrar"
            disabled={cargando}
          >
            ✕
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            enviar()
          }}
          className="p-5"
        >
          <p className="mb-3 text-sm text-slate-500">
            Ingresa la clave para habilitar la edicion de salas/aforos y la base de datos. Solo se
            pide una vez en este dispositivo.
          </p>
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <input
            type="password"
            autoFocus
            disabled={cargando}
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Clave de administrador"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCerrar}
              disabled={cargando}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {cargando ? 'Verificando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
