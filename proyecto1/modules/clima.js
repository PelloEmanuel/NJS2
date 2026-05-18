/**
 * clima.js — Proyecto 1
 * Módulo propio de clima simulado.
 * Responsabilidad: generar datos de clima aleatorios
 * para una ciudad dada, sin consumir APIs externas.
 */

/** Estados climáticos posibles */
const ESTADOS = [
  'Soleado ☀️',
  'Nublado ☁️',
  'Lluvioso 🌧',
  'Tormenta ⛈',
  'Ventoso 🌬',
  'Niebla 🌫',
  'Parcialmente nublado 🌤'
];

/**
 * Genera un número entero aleatorio entre min y max inclusive.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Simula una consulta de clima para la ciudad indicada.
 * Retorna temperatura y estado generados aleatoriamente.
 * @param {string} ciudad - Nombre de la ciudad
 * @returns {{ ciudad: string, temperatura: number, estado: string } | { error: string }}
 */
export function consultarClima(ciudad) {
  const nombreLimpio = ciudad.trim();

  if (!nombreLimpio || nombreLimpio.length < 2) {
    return { error: 'El nombre de la ciudad debe tener al menos 2 caracteres.' };
  }

  return {
    ciudad:      nombreLimpio,
    temperatura: aleatorio(-5, 40),
    estado:      ESTADOS[aleatorio(0, ESTADOS.length - 1)]
  };
}