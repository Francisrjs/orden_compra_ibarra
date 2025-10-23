import { CurrencyPipe } from "@angular/common";

/**
 * Formatea un valor numérico a formato de moneda
 * @param value - Valor numérico a formatear
 * @param currencyPipe - Instancia de CurrencyPipe
 * @returns String formateado como moneda (ej: $1,234.56)
 */
export function getTotalCurrency(value: number, currencyPipe: CurrencyPipe): string {
  return currencyPipe.transform(value, '$', 'symbol', '1.2-2') || '$0.00';
}

/**
 * Formatea un valor numérico a formato de moneda (alias de getTotalCurrency)
 * @param value - Valor numérico a formatear
 * @param currencyPipe - Instancia de CurrencyPipe
 * @returns String formateado como moneda (ej: $1,234.56)
 */
export function getImporteCurrency(value: number, currencyPipe: CurrencyPipe): string {
  return currencyPipe.transform(value, '$', 'symbol', '1.2-2') || '$0.00';
}

/**
 * Formatea una fecha a formato DD/MM/YYYY
 * @param value - Fecha como Date, string o null/undefined
 * @returns String formateado como DD/MM/YYYY o '-' si no hay fecha
 */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '-';

  // Si es string en formato YYYY-MM-DD, convertir directamente a DD/MM/YYYY
  if (typeof value === 'string') {
    const [year, month, day] = value.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  }

  // Si es un objeto Date
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return '-';
    
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  return '-';
}

// **
//  * Extrae solo la fecha de un timestamp (formato YYYY-MM-DD)
//  * @param value - Timestamp como string ISO o Date
//  * @returns String en formato YYYY-MM-DD o null
//  * @example
//  * extractDateFromTimestamp('2025-10-23T14:30:00.000Z') // '2025-10-23'
//  */
export function extractDateFromTimestamp(value: string | Date | null | undefined): string | null {
  if (!value) return null;

  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) return null;
    
    // Formatear a YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error al extraer fecha:', error);
    return null;
  }
}