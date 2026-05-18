/**
 * calculo.js — Proyecto 5
 * Módulo propio de cálculo matemático.
 * Idéntico al del Proyecto 1: realiza operaciones básicas
 * y devuelve el resultado con su expresión descriptiva.
 */

/**
 * Realiza una operación aritmética entre dos números.
 * @param {number} a - Primer operando
 * @param {number} b - Segundo operando
 * @param {string} op - 'suma' | 'resta' | 'multiplicacion' | 'division'
 * @returns {{ resultado: number, expresion: string } | { error: string }}
 */
export function calcular(a, b, op) {
  if (isNaN(a) || isNaN(b)) {
    return { error: 'Ambos valores deben ser números válidos.' };
  }

  let resultado;
  let simbolo;

  switch (op) {
    case 'suma':           resultado = a + b; simbolo = '+';  break;
    case 'resta':          resultado = a - b; simbolo = '-';  break;
    case 'multiplicacion': resultado = a * b; simbolo = '×';  break;
    case 'division':
      if (b === 0) return { error: 'No se puede dividir por cero.' };
      resultado = a / b;
      simbolo = '÷';
      break;
    default:
      return { error: 'Operación no reconocida.' };
  }

  return {
    resultado: parseFloat(resultado.toFixed(4)),
    expresion: `${a} ${simbolo} ${b}`
  };
}