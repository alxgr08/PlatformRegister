import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, Pencil, Search, ShieldAlert, UserPlus, Users } from 'lucide-react'
import {
  api,
  type Asistente,
  type BusquedaAsistente,
  type EstadisticasAsistentes,
} from '../api'
import EditarPersonaModal from '../components/EditarPersonaModal'
import PageHeader from '../components/PageHeader'
import RegistroCharlas from '../components/RegistroCharlas'
import { useToast } from '../components/Toast'
import { formatoFechaHora } from '../lib/formato'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

interface NuevoAsistente {
  dni: string
  nombreCompleto: string
  celular: string
  correo: string
  especialidad: string
}

const NUEVO_VACIO: NuevoAsistente = {
  dni: '',
  nombreCompleto: '',
  celular: '',
  correo: '',
  especialidad: '',
}

export default function Asistentes() {
  const { notificar } = useToast()
  const [stats, setStats] = useState<EstadisticasAsistentes | null>(null)
  const [dni, setDni] = useState('')
  const [busqueda, setBusqueda] = useState<BusquedaAsistente | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [accionando, setAccionando] = useState(false)
  const [nuevo, setNuevo] = useState<NuevoAsistente>(NUEVO_VACIO)
  const [editando, setEditando] = useState(false)

  const cargarStats = useCallback(async () => {
    try {
      setStats(await api.estadisticasAsistentes())
    } catch {
      /* silencioso: las estadisticas no son criticas */
    }
  }, [])

  useEffect(() => {
    cargarStats()
  }, [cargarStats])

  async function buscar() {
    const d = dni.trim()
    if (!d) {
      notificar('info', 'Ingresa un DNI para buscar.')
      return
    }
    setBuscando(true)
    setBusqueda(null)
    try {
      const r = await api.buscarAsistente(d)
      setBusqueda(r)
      if (!r.encontrado) {
        setNuevo({ ...NUEVO_VACIO, dni: d })
      }
    } catch (e) {
      notificar('error', e instanceof Error ? e.message : 'Error al buscar')
    } finally {
      setBuscando(false)
    }
  }

  async function registrarIngreso(asistente: Asistente) {
    setAccionando(true)
    try {
      const actualizado = await api.registrarIngreso(asistente.dni)
      setBusqueda({ encontrado: true, asistente: actualizado })
      notificar('exito', `${actualizado.nombreCompleto} registrado al evento.`)
      cargarStats()
    } catch (e) {
      notificar('error', e instanceof Error ? e.message : 'Error al registrar')
    } finally {
      setAccionando(false)
    }
  }

  async function deshacerIngreso(asistente: Asistente) {
    if (!confirm(`¿Deshacer el ingreso al evento de ${asistente.nombreCompleto}?`)) return
    setAccionando(true)
    try {
      const actualizado = await api.deshacerIngreso(asistente.dni)
      setBusqueda({ encontrado: true, asistente: actualizado })
      notificar('info', 'Ingreso al evento deshecho.')
      cargarStats()
    } catch (e) {
      notificar('error', e instanceof Error ? e.message : 'Error')
    } finally {
      setAccionando(false)
    }
  }

  async function crearYRegistrar() {
    if (!nuevo.dni.trim() || !nuevo.nombreCompleto.trim()) {
      notificar('info', 'El DNI y el nombre completo son obligatorios.')
      return
    }
    setAccionando(true)
    try {
      await api.crearAsistente({
        dni: nuevo.dni.trim(),
        nombreCompleto: nuevo.nombreCompleto.trim(),
        celular: nuevo.celular.trim() || undefined,
        correo: nuevo.correo.trim() || undefined,
        especialidad: nuevo.especialidad.trim() || undefined,
      })
      const conIngreso = await api.registrarIngreso(nuevo.dni.trim())
      setBusqueda({ encontrado: true, asistente: conIngreso })
      notificar('exito', `${conIngreso.nombreCompleto} agregado y registrado al evento.`)
      cargarStats()
    } catch (e) {
      notificar('error', e instanceof Error ? e.message : 'Error al registrar')
    } finally {
      setAccionando(false)
    }
  }

  const asistente = busqueda?.encontrado ? busqueda.asistente : null

  return (
    <>
      <PageHeader
        icono={<Users className="h-6 w-6" />}
        titulo="Asistentes"
        subtitulo="Registro general al evento"
      />
      <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TarjetaStat etiqueta="ASISTENTES EN BASE" valor={stats?.totalAsistentes} />
          <TarjetaStat
            etiqueta="REGISTRADOS AL EVENTO"
            valor={stats?.totalIngresadosAlEvento}
            acento
          />
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-3 font-semibold text-blue-700">1. Buscar por DNI</h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <input
              className={inputCls}
              placeholder="Ingrese DNI"
              inputMode="numeric"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscar()}
            />
            <button
              onClick={buscar}
              disabled={buscando}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {asistente && (
            <PersonaEncontrada
              asistente={asistente}
              accionando={accionando}
              onRegistrar={() => registrarIngreso(asistente)}
              onDeshacer={() => deshacerIngreso(asistente)}
              onEditar={() => setEditando(true)}
            />
          )}
        </section>

        {asistente?.ingresadoAlEvento && (
          <RegistroCharlas persona={asistente} titulo="Agregar a las charlas / salas" />
        )}

        {busqueda && !busqueda.encontrado && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="font-semibold text-blue-700">2. No se encontro la persona</h2>
            <p className="mb-4 text-sm text-slate-500">
              Complete los datos para agregar y registrar al evento.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="DNI" obligatorio>
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={nuevo.dni}
                  onChange={(e) => setNuevo({ ...nuevo, dni: e.target.value })}
                />
              </Campo>
              <Campo etiqueta="Nombre completo" obligatorio>
                <input
                  className={inputCls}
                  value={nuevo.nombreCompleto}
                  onChange={(e) => setNuevo({ ...nuevo, nombreCompleto: e.target.value })}
                />
              </Campo>
              <Campo etiqueta="Celular">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={nuevo.celular}
                  onChange={(e) => setNuevo({ ...nuevo, celular: e.target.value })}
                />
              </Campo>
              <Campo etiqueta="Correo">
                <input
                  className={inputCls}
                  type="email"
                  value={nuevo.correo}
                  onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })}
                />
              </Campo>
              <Campo etiqueta="Especialidad">
                <input
                  className={inputCls}
                  value={nuevo.especialidad}
                  onChange={(e) => setNuevo({ ...nuevo, especialidad: e.target.value })}
                />
              </Campo>
              <Campo etiqueta="Tipo de registro">
                <input
                  className={`${inputCls} bg-slate-100 text-slate-500`}
                  value="NUEVO REGISTRADO"
                  disabled
                />
              </Campo>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={crearYRegistrar}
                disabled={accionando}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
              >
                <UserPlus className="h-4 w-4" />
                Agregar asistente y registrar al evento
              </button>
            </div>
          </section>
        )}

        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Importante:</span> Cada DNI solo puede registrarse una
            vez al evento. Se guarda la fecha y hora de ingreso automaticamente.
          </p>
        </div>
      </div>

      {editando && asistente && (
        <EditarPersonaModal
          asistente={asistente}
          onCerrar={() => setEditando(false)}
          onGuardado={(a) => {
            setBusqueda({ encontrado: true, asistente: a })
            setEditando(false)
          }}
        />
      )}
    </>
  )
}

function TarjetaStat({
  etiqueta,
  valor,
  acento,
}: {
  etiqueta: string
  valor?: number
  acento?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold tracking-wide text-slate-500">{etiqueta}</p>
      <p className={`mt-1 text-3xl font-bold ${acento ? 'text-green-600' : 'text-blue-700'}`}>
        {valor === undefined ? '—' : valor.toLocaleString('es-PE')}
      </p>
    </div>
  )
}

function Campo({
  etiqueta,
  obligatorio,
  children,
}: {
  etiqueta: string
  obligatorio?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {etiqueta} {obligatorio && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-28 shrink-0 text-slate-500 sm:w-36">{etiqueta}:</span>
      <span className="break-words font-medium text-slate-800">{valor}</span>
    </div>
  )
}

function PersonaEncontrada({
  asistente,
  accionando,
  onRegistrar,
  onDeshacer,
  onEditar,
}: {
  asistente: Asistente
  accionando: boolean
  onRegistrar: () => void
  onDeshacer: () => void
  onEditar: () => void
}) {
  return (
    <div className="mt-4 rounded-xl border border-green-300 bg-green-50/60 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-green-700">
          <CheckCircle2 className="h-5 w-5" />
          Persona encontrada
        </div>
        <button
          onClick={onEditar}
          title="Editar datos del asistente"
          className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </button>
      </div>
      <div className="space-y-1.5 text-sm">
        <Dato etiqueta="DNI" valor={asistente.dni} />
        <Dato etiqueta="Nombre completo" valor={asistente.nombreCompleto} />
        <Dato etiqueta="Celular" valor={asistente.celular ?? '—'} />
        <Dato etiqueta="Correo" valor={asistente.correo ?? '—'} />
        <Dato etiqueta="Especialidad" valor={asistente.especialidad ?? '—'} />
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-slate-500 sm:w-36">Tipo de registro:</span>
          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-blue-700">
            {asistente.tipoRegistro}
          </span>
        </div>
      </div>
      <div className="mt-4 border-t border-green-200 pt-4">
        {asistente.ingresadoAlEvento ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Ya registrado al evento
              {asistente.fechaIngresoEvento && (
                <span className="font-normal text-slate-500">
                  ({formatoFechaHora(asistente.fechaIngresoEvento)})
                </span>
              )}
            </p>
            <button
              onClick={onDeshacer}
              disabled={accionando}
              className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
            >
              Deshacer ingreso
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm text-blue-700">
              <Info className="h-4 w-4" />
              Esta persona aun no esta registrada al evento.
            </p>
            <button
              onClick={onRegistrar}
              disabled={accionando}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              {accionando ? 'Registrando...' : 'Registrar al evento'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
