import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'

type ToastTipo = 'exito' | 'error' | 'info'

interface ToastItem {
  id: number
  tipo: ToastTipo
  mensaje: string
}

interface ToastContextValor {
  notificar: (tipo: ToastTipo, mensaje: string) => void
}

const ToastContext = createContext<ToastContextValor | null>(null)

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValor {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}

const estilos: Record<ToastTipo, string> = {
  exito: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
}

function Icono({ tipo }: { tipo: ToastTipo }) {
  if (tipo === 'exito') return <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
  if (tipo === 'error') return <XCircle className="h-5 w-5 shrink-0 text-red-600" />
  return <Info className="h-5 w-5 shrink-0 text-blue-600" />
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const notificar = useCallback((tipo: ToastTipo, mensaje: string) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, tipo, mensaje }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  return (
    <ToastContext.Provider value={{ notificar }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex w-80 max-w-[90vw] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2 rounded-lg border px-4 py-3 shadow-lg ${estilos[t.tipo]}`}
          >
            <Icono tipo={t.tipo} />
            <span className="text-sm font-medium">{t.mensaje}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
