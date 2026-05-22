import { useState } from 'react'
import { Lock, X } from 'lucide-react'

interface Props {
  onConfirmar: (clave: string) => void
  onCerrar: () => void
}

export default function AdminKeyModal({ onConfirmar, onCerrar }: Props) {
  const [clave, setClave] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Lock className="h-5 w-5 text-blue-600" />
            Acceso de administracion
          </div>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (clave.trim()) onConfirmar(clave.trim())
          }}
          className="p-5"
        >
          <p className="mb-3 text-sm text-slate-500">
            Ingresa la clave de administracion para editar las salas y los aforos.
          </p>
          <input
            type="password"
            autoFocus
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Clave de administracion"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
