/**
 * Formatea una fecha ISO a un formato legible por humanos.
 * @param dateString Fecha en formato ISO o string reconocible
 * @returns String formateado (ej: '18 de junio de 2026')
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
