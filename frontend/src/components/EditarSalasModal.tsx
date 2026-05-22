import { useCallback, useEffect, useState } from 'react'
import { Plus, Save, Trash2, X } from 'lucide-react'
import { api, ApiError, clearAdminKey, type Charla, type CharlaInput } from '../api'
import { isoAInputLocal } from '../lib/formato'
import { useToast } from './Toast'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
const labelCls = 'mb-1 block text-xs font-medium text-slate-500'

const NUEVA_VACIA: CharlaInput = {
  nombre: '',
  sala: '',
  horaInicio: '',
  horaFin: '',
  aforo: 50,
  oculta: false,
}

interface Props {
  onCerrar: () => void
  onClaveInvalida: () => void
}

export default function EditarSalasModal({ onCerrar, onClaveInvalida }: Props) {
  const { notificar } = useToast()
  const [charlas, setCharlas] = useState<Charla[]>([])
  const [cargando, setCargando] = useState(true)

  const recargar = useCallback(async () => {
    try {
      setCharlas(await api.listarCharlas(true, true))
    } catch (e) {
      notificar('error', e instanceof Error ? e.message : 'Error al cargar charlas')
    } finally {
      setCargando(false)
    }
  }, [notificar])

  useEffect(() => {
    recargar()
  }, [recargar])

  function manejarError(e: unknown) {
    if (e instanceof ApiError && e.status === 401) {
      clearAdminKey()
      notificar('error', 'Clave de administracion incorrecta.')
      onClaveInvalida()
      return
    }
    notificar('error', e instanceof Error ? e.message : 'Error inesperado')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="my-8 w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="text-lg font-bold text-slate-800">Editar salas y aforos</h2>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <NuevaCharla onCreada={recargar} onError={manejarError} />
          {cargando ? (
            <p className="text-sm text-slate-500">Cargando charlas...</p>
          ) : charlas.length === 0 ? (
            <p className="text-sm text-slate-500">No hay charlas registradas.</p>
          ) : (
            charlas.map((c) => (
              <FilaCharla key={c.id} charla={c} onCambios={recargar} onError={manejarError} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function CamposCharla({
  form,
  setForm,
}: {
  form: CharlaInput
  setForm: (f: CharlaInput) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-6">
      <div className="sm:col-span-4">
        <label className={labelCls}>Charla</label>
        <input
          className={inputCls}
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Sala</label>
        <input
          className={inputCls}
          value={form.sala}
          onChange={(e) => setForm({ ...form, sala: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Hora inicio</label>
        <input
          type="datetime-local"
          className={inputCls}
          value={form.horaInicio}
          onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Hora fin</label>
        <input
          type="datetime-local"
          className={inputCls}
          value={form.horaFin}
          onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
        />
      </div>
      <div className="sm:col-span-2">
        <label className={labelCls}>Aforo</label>
        <input
          type="number"
          min={0}
          className={inputCls}
          value={form.aforo}
          onChange={(e) => setForm({ ...form, aforo: Number(e.target.value) })}
        />
      </div>
    </div>
  )
}

function FilaCharla({
  charla,
  onCambios,
  onError,
}: {
  charla: Charla
  onCambios: () => void
  onError: (e: unknown) => void
}) {
  const { notificar } = useToast()
  const [form, setForm] = useState<CharlaInput>({
    nombre: charla.nombre,
    sala: charla.sala,
    horaInicio: isoAInputLocal(charla.horaInicio),
    horaFin: isoAInputLocal(charla.horaFin),
    aforo: charla.aforo,
    oculta: charla.oculta,
  })
  const [ocupado, setOcupado] = useState(false)

  async function guardar() {
    setOcupado(true)
    try {
      await api.actualizarCharla(charla.id, form)
      notificar('exito', `Charla "${form.nombre}" actualizada.`)
      onCambios()
    } catch (e) {
      onError(e)
    } finally {
      setOcupado(false)
    }
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar la charla "${charla.nombre}"? Se borraran tambien sus inscripciones.`)) {
      return
    }
    setOcupado(true)
    try {
      await api.eliminarCharla(charla.id)
      notificar('exito', 'Charla eliminada.')
      onCambios()
    } catch (e) {
      onError(e)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <CamposCharla form={form} setForm={setForm} />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.oculta ?? false}
            onChange={(e) => setForm({ ...form, oculta: e.target.checked })}
          />
          Ocultar esta charla
        </label>
        <div className="flex gap-2">
          <button
            onClick={eliminar}
            disabled={ocupado}
            className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" /> Eliminar
          </button>
          <button
            onClick={guardar}
            disabled={ocupado}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

function NuevaCharla({
  onCreada,
  onError,
}: {
  onCreada: () => void
  onError: (e: unknown) => void
}) {
  const { notificar } = useToast()
  const [form, setForm] = useState<CharlaInput>(NUEVA_VACIA)
  const [ocupado, setOcupado] = useState(false)

  async function crear() {
    if (!form.nombre.trim() || !form.sala.trim() || !form.horaInicio || !form.horaFin) {
      notificar('info', 'Completa el nombre, la sala y el horario de la nueva charla.')
      return
    }
    setOcupado(true)
    try {
      await api.crearCharla(form)
      notificar('exito', `Charla "${form.nombre}" creada.`)
      setForm(NUEVA_VACIA)
      onCreada()
    } catch (e) {
      onError(e)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-blue-300 bg-blue-50/50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-blue-700">Nueva charla</h3>
      <CamposCharla form={form} setForm={setForm} />
      <div className="mt-3 flex justify-end">
        <button
          onClick={crear}
          disabled={ocupado}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> Agregar charla
        </button>
      </div>
    </div>
  )
}
