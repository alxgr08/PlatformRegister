import { useState } from 'react'

interface Props {
  onConfirmar: (clave: string) => Promise<void>
  onCerrar: () => void
}

/**
 * Modal para autenticar como administrador.
 * 
 * Características:
 * - Valida la clave "13082010" contra el backend
 * - Muestra errores claros si la clave es incorrecta
 * - Desactiva el botón durante la validación
 * - Usa estado local para manejar errores
 */
export default function AdminKeyModal({ onConfirmar, onCerrar }: Props) {
  const [clave, setClave] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  async function manejarEnvio(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const claveTrimed = clave.trim()
    
    if (!claveTrimed) {
      setError('Ingresa la clave de administración.')
      return
    }

    setCargando(true)
    setError(null)

    try {
      await onConfirmar(claveTrimed)
      alert('Sesión de administrador iniciada correctamente.')
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al validar la clave'
      setError(mensaje)
      setCargando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <span className="text-lg">🔒</span>
            Acceso de administración
          </div>
          <button 
            onClick={onCerrar} 
            className="text-slate-400 hover:text-slate-600 disabled:opacity-50 text-lg"
            disabled={cargando}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={manejarEnvio} className="p-5">
          <p className="mb-4 text-sm text-slate-600">
            Ingresa la clave de administración para acceder a funciones restringidas como edición de salas, aforos e importación/exportación de datos.
          </p>

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <span className="text-lg shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Input */}
          <input
            type="password"
            autoFocus
            disabled={cargando}
            value={clave}
            onChange={(e) => {
              setClave(e.target.value)
              setError(null)
            }}
            placeholder="Contraseña de administración"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
          />

          {/* Botones */}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCerrar}
              disabled={cargando}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              {cargando ? '⏳ Validando...' : 'Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
