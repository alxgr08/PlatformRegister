import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  Lock,
  Pencil,
  Presentation,
  Search,
} from 'lucide-react'
import { api, getAdminKey, setAdminKey, type Asistente } from '../api'
import AdminKeyModal from '../components/AdminKeyModal'
import EditarPersonaModal from '../components/EditarPersonaModal'
import EditarSalasModal from '../components/EditarSalasModal'
import PageHeader from '../components/PageHeader'
import RegistroCharlas from '../components/RegistroCharlas'
import { useToast } from '../components/Toast'

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

interface MensajePersona {
  tipo: 'error' | 'warn'
  texto: string
}

export default function Salas() {
  const { notificar } = useToast()
  const [dni, setDni] = useState('')
  const [persona, setPersona] = useState<Asistente | null>(null)
  const [mensajePersona, setMensajePersona] = useState<MensajePersona | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [mostrarAdminKey, setMostrarAdminKey] = useState(false)
  const [mostrarEditar, setMostrarEditar] = useState(false)
  const [editandoPersona, setEditandoPersona] = useState(false)

  async function buscar() {
    const d = dni.trim()
    if (!d) {
      notificar('info', 'Ingresa un DNI.')
      return
    }
    setBuscando(true)
    setPersona(null)
    setMensajePersona(null)
    try {
      const r = await api.buscarAsistente(d)
      if (!r.encontrado || !r.asistente) {
        setMensajePersona({ tipo: 'error', texto: `No se encontro el DNI ${d}.` })
      } else if (!r.asistente.ingresadoAlEvento) {
        setMensajePersona({
          tipo: 'warn',
          texto:
            'Esta persona no esta registrada al evento. Registrala primero en la pantalla de Asistentes.',
        })
      } else {
        setPersona(r.asistente)
      }
    } catch (e) {
      notificar('error', e instanceof Error ? e.message : 'Error al buscar')
    } finally {
      setBuscando(false)
    }
  }

  function abrirEditar() {
    if (getAdminKey()) setMostrarEditar(true)
    else setMostrarAdminKey(true)
  }

  return (
    <>
      <PageHeader
        icono={<Presentation className="h-6 w-6" />}
        titulo="Salas / Charlas"
        subtitulo="Registra asistentes en cada charla"
        accion={
          <button
            onClick={abrirEditar}
            className="flex items-center gap-2 rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            <Lock className="h-4 w-4" />
            Editar salas y aforos
          </button>
        }
      />

      <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-3 font-semibold text-blue-700">1. Ingresar DNI del asistente</h2>
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

          <p className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
            <Info className="h-4 w-4 shrink-0" />
            El asistente debe estar registrado al evento para poder registrarlo en las salas.
          </p>

          {persona && (
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-green-300 bg-green-50/60 p-4">
              <div className="flex items-center gap-2 font-semibold text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Persona encontrada - Registrada al evento
              </div>
              <span className="text-sm text-slate-600">
                DNI: <b className="text-slate-800">{persona.dni}</b>
              </span>
              <span className="text-sm text-slate-600">
                Nombre: <b className="text-slate-800">{persona.nombreCompleto}</b>
              </span>
              <span className="text-sm text-slate-600">
                Especialidad: <b className="text-slate-800">{persona.especialidad ?? '—'}</b>
              </span>
              <button
                onClick={() => setEditandoPersona(true)}
                title="Editar datos del asistente"
                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 sm:ml-auto"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
            </div>
          )}

          {mensajePersona && (
            <div
              className={`mt-4 flex items-start gap-2 rounded-xl border p-4 text-sm ${
                mensajePersona.tipo === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{mensajePersona.texto}</span>
            </div>
          )}
        </section>

        <RegistroCharlas persona={persona} titulo="2. Registrar en las charlas" />

        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Lightbulb className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Consejo:</span> Busca el DNI del asistente y haz clic en
            "Agregar" en cada charla. Puedes registrarlo en una o varias charlas; el contador se
            actualiza solo.
          </p>
        </div>
      </div>

      {mostrarAdminKey && (
        <AdminKeyModal
          onCerrar={() => setMostrarAdminKey(false)}
          onConfirmar={(clave) => {
            setAdminKey(clave)
            setMostrarAdminKey(false)
            setMostrarEditar(true)
          }}
        />
      )}
      {mostrarEditar && (
        <EditarSalasModal
          onCerrar={() => setMostrarEditar(false)}
          onClaveInvalida={() => {
            setMostrarEditar(false)
            setMostrarAdminKey(true)
          }}
        />
      )}
      {editandoPersona && persona && (
        <EditarPersonaModal
          asistente={persona}
          onCerrar={() => setEditandoPersona(false)}
          onGuardado={(a) => {
            setPersona(a)
            setEditandoPersona(false)
          }}
        />
      )}
    </>
  )
}
