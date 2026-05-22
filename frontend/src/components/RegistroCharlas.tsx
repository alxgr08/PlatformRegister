import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, Eye, EyeOff, Plus, UserMinus } from 'lucide-react'
import { api, type Asistente, type Charla, type NivelOcupacion } from '../api'
import { formatoHora } from '../lib/formato'
import { useToast } from './Toast'

const colorBarra: Record<NivelOcupacion, string> = {
  VERDE: 'bg-green-500',
  NARANJA: 'bg-amber-500',
  ROJO: 'bg-red-500',
}
const colorTexto: Record<NivelOcupacion, string> = {
  VERDE: 'text-green-600',
  NARANJA: 'text-amber-600',
  ROJO: 'text-red-600',
}

interface Props {
  persona: Asistente | null
  titulo?: string
}

/**
 * Lista de charlas con registro rapido. Reutilizable: se usa en la pantalla
 * de Salas y en la de Asistentes. Actualiza los contadores en vivo (cada 8 s).
 */
export default function RegistroCharlas({ persona, titulo = 'Registrar en las charlas' }: Props) {
  const { notificar } = useToast()
  const [charlas, setCharlas] = useState<Charla[]>([])
  const [inscripciones, setInscripciones] = useState<Set<number>>(new Set())
  const [accionId, setAccionId] = useState<number | null>(null)
  const [mostrarOcultos, setMostrarOcultos] = useState(false)
  const [finalizadasAbierta, setFinalizadasAbierta] = useState(false)

  const cargarCharlas = useCallback(async () => {
    try {
      setCharlas(await api.listarCharlas(true, true))
    } catch (e) {
      notificar('error', e instanceof Error ? e.message : 'Error al cargar charlas')
    }
  }, [notificar])

  useEffect(() => {
    cargarCharlas()
    const id = setInterval(cargarCharlas, 8000)
    return () => clearInterval(id)
  }, [cargarCharlas])

  useEffect(() => {
    if (!persona) {
      setInscripciones(new Set())
      return
    }
    let activo = true
    api
      .charlasDelAsistente(persona.dni)
      .then((chs) => {
        if (activo) setInscripciones(new Set(chs.map((c) => c.id)))
      })
      .catch(() => {
        /* silencioso */
      })
    return () => {
      activo = false
    }
  }, [persona])

  async function agregar(charla: Charla) {
    if (!persona) return
    setAccionId(charla.id)
    try {
      const act = await api.registrarEnCharla(charla.id, persona.dni)
      setCharlas((prev) => prev.map((c) => (c.id === act.id ? act : c)))
      setInscripciones((prev) => new Set(prev).add(charla.id))
      notificar('exito', `${persona.nombreCompleto} agregado a "${charla.nombre}".`)
    } catch (e) {
      notificar('error', e instanceof Error ? e.message : 'Error al registrar')
    } finally {
      setAccionId(null)
    }
  }

  async function quitar(charla: Charla) {
    if (!persona) return
    setAccionId(charla.id)
    try {
      const act = await api.deshacerRegistroCharla(charla.id, persona.dni)
      setCharlas((prev) => prev.map((c) => (c.id === act.id ? act : c)))
      setInscripciones((prev) => {
        const s = new Set(prev)
        s.delete(charla.id)
        return s
      })
      notificar('info', `${persona.nombreCompleto} quitado de "${charla.nombre}".`)
    } catch (e) {
      notificar('error', e instanceof Error ? e.message : 'Error')
    } finally {
      setAccionId(null)
    }
  }

  const activas = charlas.filter((c) => !c.finalizada && (mostrarOcultos || !c.oculta))
  const finalizadas = charlas.filter((c) => c.finalizada)

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
        <h2 className="font-semibold text-blue-700">{titulo}</h2>
        <button
          onClick={() => setMostrarOcultos((v) => !v)}
          className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          {mostrarOcultos ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="hidden sm:inline">
            {mostrarOcultos ? 'No mostrar ocultos' : 'Mostrar ocultos'}
          </span>
        </button>
      </div>

      {!persona && (
        <p className="px-4 pt-3 text-sm text-slate-500 sm:px-5">
          Busca un asistente para poder agregarlo a las charlas.
        </p>
      )}

      <div className="space-y-2 p-3 sm:p-4">
        {activas.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">No hay charlas activas.</p>
        )}
        {activas.map((c) => (
          <CharlaCard
            key={c.id}
            charla={c}
            inscrito={inscripciones.has(c.id)}
            cargando={accionId === c.id}
            habilitado={!!persona}
            onAgregar={() => agregar(c)}
            onQuitar={() => quitar(c)}
          />
        ))}
      </div>

      {finalizadas.length > 0 && (
        <div className="border-t border-slate-200">
          <button
            onClick={() => setFinalizadasAbierta((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:px-5"
          >
            <span>Horarios finalizados ({finalizadas.length})</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${finalizadasAbierta ? 'rotate-180' : ''}`}
            />
          </button>
          {finalizadasAbierta && (
            <div className="divide-y divide-slate-100 border-t border-slate-200">
              {finalizadas.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm text-slate-500 sm:px-5"
                >
                  <span className="whitespace-nowrap">
                    {formatoHora(c.horaInicio)} - {formatoHora(c.horaFin)}
                  </span>
                  <span className="font-medium text-slate-700">{c.nombre}</span>
                  <span className="rounded bg-slate-200 px-2 py-0.5 text-xs">{c.sala}</span>
                  <span>
                    {c.registrados}/{c.aforo}
                  </span>
                  <span className="ml-auto rounded bg-slate-200 px-2 py-0.5 text-xs font-medium">
                    Finalizada
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function CharlaCard({
  charla,
  inscrito,
  cargando,
  habilitado,
  onAgregar,
  onQuitar,
}: {
  charla: Charla
  inscrito: boolean
  cargando: boolean
  habilitado: boolean
  onAgregar: () => void
  onQuitar: () => void
}) {
  const lleno = charla.registrados >= charla.aforo
  const pct = Math.min(charla.porcentajeOcupacion, 100)

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      <div className="shrink-0 sm:w-24">
        <div className="font-semibold text-slate-800">{formatoHora(charla.horaInicio)}</div>
        <div className="text-xs text-slate-500">{formatoHora(charla.horaFin)}</div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-medium text-slate-800">{charla.nombre}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <span className="rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
            {charla.sala}
          </span>
          {charla.oculta && (
            <span className="rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-600">Oculta</span>
          )}
        </div>
      </div>

      <div className="shrink-0 sm:w-44">
        <div className="text-sm text-slate-600">
          <span className="font-bold text-slate-800">{charla.registrados}</span>
          <span className="text-slate-400"> / {charla.aforo}</span>
          <span className={`ml-1 text-xs font-semibold ${colorTexto[charla.nivelOcupacion]}`}>
            {charla.porcentajeOcupacion}%
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${colorBarra[charla.nivelOcupacion]}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="shrink-0">
        {inscrito ? (
          <button
            onClick={onQuitar}
            disabled={cargando}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 sm:w-auto"
          >
            <UserMinus className="h-4 w-4" />
            {cargando ? '...' : 'Quitar'}
          </button>
        ) : (
          <button
            onClick={onAgregar}
            disabled={!habilitado || lleno || cargando}
            title={!habilitado ? 'Busca primero un asistente' : lleno ? 'Aforo completo' : ''}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-green-400 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-transparent sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {lleno ? 'Llena' : cargando ? '...' : 'Agregar'}
          </button>
        )}
      </div>
    </div>
  )
}
