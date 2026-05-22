import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  Lock,
  Upload,
} from 'lucide-react'
import {
  ApiError,
  clearAdminKey,
  exportarExcel,
  getAdminKey,
  importarExcel,
  setAdminKey,
  type ResultadoCarga,
} from '../api'
import AdminKeyModal from '../components/AdminKeyModal'
import PageHeader from '../components/PageHeader'
import { useToast } from '../components/Toast'

export default function BaseDatos() {
  const { notificar } = useToast()
  const [tieneClave, setTieneClave] = useState(() => !!getAdminKey())
  const [mostrarModal, setMostrarModal] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [importando, setImportando] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoCarga | null>(null)

  function manejar401(e: unknown): boolean {
    if (e instanceof ApiError && e.status === 401) {
      clearAdminKey()
      setTieneClave(false)
      notificar('error', 'Clave de administracion incorrecta. Ingresala de nuevo.')
      return true
    }
    return false
  }

  async function importar() {
    if (!archivo) {
      notificar('info', 'Selecciona un archivo Excel (.xlsx).')
      return
    }
    setImportando(true)
    setResultado(null)
    try {
      const r = await importarExcel(archivo)
      setResultado(r)
      notificar('exito', `Importacion completada: ${r.filasProcesadas} registros procesados.`)
    } catch (e) {
      if (!manejar401(e)) notificar('error', e instanceof Error ? e.message : 'Error al importar')
    } finally {
      setImportando(false)
    }
  }

  async function exportar() {
    setExportando(true)
    try {
      await exportarExcel()
      notificar('exito', 'Descarga del Excel iniciada.')
    } catch (e) {
      if (!manejar401(e)) notificar('error', e instanceof Error ? e.message : 'Error al exportar')
    } finally {
      setExportando(false)
    }
  }

  return (
    <>
      <PageHeader
        icono={<Database className="h-6 w-6" />}
        titulo="Base de Datos"
        subtitulo="Importar y exportar la base de asistentes"
      />

      {!tieneClave ? (
        <div className="mx-auto max-w-md p-4 sm:p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center sm:p-8">
            <Lock className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-3 font-semibold text-slate-800">Seccion protegida</h2>
            <p className="mt-1 text-sm text-slate-500">
              Importar y exportar la base de datos requiere la clave de administracion.
            </p>
            <button
              onClick={() => setMostrarModal(true)}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Ingresar clave
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
          {/* Importar */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="mb-1 flex items-center gap-2 font-semibold text-blue-700">
              <Upload className="h-5 w-5" />
              Importar base de datos
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Sube el archivo Excel (.xlsx) con la base de pre-registro. Sin limite de filas; los DNI
              existentes se actualizan, no se duplican.
            </p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-8 text-center hover:border-blue-400 hover:bg-blue-50/40">
              <FileSpreadsheet className="h-8 w-8 text-slate-400" />
              {archivo ? (
                <span className="text-sm font-medium text-slate-700">{archivo.name}</span>
              ) : (
                <span className="text-sm text-slate-500">
                  Haz clic para seleccionar un archivo .xlsx
                </span>
              )}
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => {
                  setArchivo(e.target.files?.[0] ?? null)
                  setResultado(null)
                }}
              />
            </label>
            <div className="mt-4 flex justify-end">
              <button
                onClick={importar}
                disabled={importando || !archivo}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                {importando ? 'Importando...' : 'Importar'}
              </button>
            </div>

            {resultado && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 font-semibold text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Importacion completada
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <Dato etiqueta="Leidas" valor={resultado.filasLeidas} />
                  <Dato etiqueta="Procesadas" valor={resultado.filasProcesadas} />
                  <Dato etiqueta="Omitidas" valor={resultado.filasOmitidas} />
                </div>
                {resultado.errores.length > 0 && (
                  <details className="mt-2 text-sm text-amber-700">
                    <summary className="cursor-pointer font-medium">
                      {resultado.errores.length} aviso(s)
                    </summary>
                    <ul className="mt-1 list-inside list-disc">
                      {resultado.errores.map((er, i) => (
                        <li key={i}>{er}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}
          </section>

          {/* Exportar */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-1 flex items-center gap-2 font-semibold text-blue-700">
              <Download className="h-5 w-5" />
              Descargar base de datos
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Descarga toda la base de asistentes (incluidos los nuevos registrados) en un Excel con
              el mismo formato del archivo de origen.
            </p>
            <button
              onClick={exportar}
              disabled={exportando}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {exportando ? 'Generando...' : 'Descargar Excel'}
            </button>
          </section>

          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              El archivo Excel debe tener las columnas: SubscriberKey, EmailAddress, TIPO_DOCUMENTO,
              NUMERO_DOCUMENTO, CELULAR, TERMINOS_CMR, FECHA_REGISTRO, NOMBRE, APELLIDOS,
              TERMINOS_CONDICIONES.
            </p>
          </div>
        </div>
      )}

      {mostrarModal && (
        <AdminKeyModal
          onCerrar={() => setMostrarModal(false)}
          onConfirmar={(clave) => {
            setAdminKey(clave)
            setTieneClave(true)
            setMostrarModal(false)
          }}
        />
      )}
    </>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="rounded-lg bg-white p-2 text-center">
      <div className="text-lg font-bold text-slate-800">{valor.toLocaleString('es-PE')}</div>
      <div className="text-xs text-slate-500">{etiqueta}</div>
    </div>
  )
}
