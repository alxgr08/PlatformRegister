import { useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { api, type Asistente } from '../api'
import { useToast } from './Toast'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

interface Props {
  asistente: Asistente
  onCerrar: () => void
  onGuardado: (a: Asistente) => void
}

export default function EditarPersonaModal({ asistente, onCerrar, onGuardado }: Props) {
  const { notificar } = useToast()
  const [nombreCompleto, setNombreCompleto] = useState(asistente.nombreCompleto)
  const [celular, setCelular] = useState(asistente.celular ?? '')
  const [correo, setCorreo] = useState(asistente.correo ?? '')
  const [especialidad, setEspecialidad] = useState(asistente.especialidad ?? '')
  const [guardando, setGuardando] = useState(false)

  async function guardar() {
    if (!nombreCompleto.trim()) {
      notificar('info', 'El nombre completo es obligatorio.')
      return
    }
    setGuardando(true)
    try {
      const actualizado = await api.actualizarAsistente(asistente.dni, {
        nombreCompleto: nombreCompleto.trim(),
        celular: celular.trim() || undefined,
        correo: correo.trim() || undefined,
        especialidad: especialidad.trim() || undefined,
      })
      notificar('exito', 'Datos del asistente actualizados.')
      onGuardado(actualizado)
    } catch (e) {
      notificar('error', e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Pencil className="h-5 w-5 text-blue-600" />
            Editar asistente
          </div>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">DNI</span>
            <input className={`${inputCls} bg-slate-100 text-slate-500`} value={asistente.dni} disabled />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Nombre completo</span>
            <input
              className={inputCls}
              autoFocus
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Celular</span>
            <input
              className={inputCls}
              inputMode="numeric"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Correo</span>
            <input
              className={inputCls}
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Especialidad</span>
            <input
              className={inputCls}
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onCerrar}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
