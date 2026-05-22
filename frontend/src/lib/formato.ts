/** Formatea un ISO (2026-05-21T09:00:00) como "09:00 a. m.". */
export function formatoHora(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/** Formatea un ISO como fecha y hora completas. */
export function formatoFechaHora(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/** Convierte un ISO del backend al value de un <input type="datetime-local">. */
export function isoAInputLocal(iso: string): string {
  return iso.slice(0, 16)
}
