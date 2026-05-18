/**
 * clima-modulo.js — Proyecto 5
 * Módulo propio de clima simulado.
 * Idéntico al del Proyecto 1: genera datos climáticos aleatorios
 * sin consumir APIs externas.
 */

const ESTADOS = [
  'Soleado ☀️', 'Nublado ☁️', 'Lluvioso 🌧',
  'Tormenta ⛈', 'Ventoso 🌬', 'Niebla 🌫', 'Parcialmente nublado 🌤'
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
 * @param {string} ciudad
 * @returns {{ ciudad: string, temperatura: number, estado: string } | { error: string }}
 */
export function consultarClima(ciudad) {
  const nombreLimpio = ciudad.trim();
  if (!nombreLimpio || nombreLimpio.length < 2) {
    return { error: 'El nombre debe tener al menos 2 caracteres.' };
  }
  return {
    ciudad:      nombreLimpio,
    temperatura: aleatorio(-5, 40),
    estado:      ESTADOS[aleatorio(0, ESTADOS.length - 1)]
  };
}