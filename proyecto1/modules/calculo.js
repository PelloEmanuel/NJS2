/**
 * calculo.js
 * Módulo propio de cálculo matemático.
 * Responsabilidad: realizar operaciones aritméticas básicas
 * y generar la cadena descriptiva de la operación.
 */

/**
 * Realiza una operación aritmética entre dos números.
 * @param {number} a - Primer operando
 * @param {number} b - Segundo operando
 * @param {string} op - Tipo de operación: suma | resta | multiplicacion | division
 * @returns {{ resultado: number, expresion: string } | { error: string }}
 */
export function calcular(a, b, op) {
  // Validar que los valores sean números reales
  if (isNaN(a) || isNaN(b)) {
    return { error: 'Ambos valores deben ser números válidos.' };
  }

  let resultado;
  let simbolo;

  switch (op) {
    case 'suma':
      resultado = a + b;
      simbolo = '+';
      break;
    case 'resta':
      resultado = a - b;
      simbolo = '-';
      break;
    case 'multiplicacion':
      resultado = a * b;
      simbolo = '×';
      break;
    case 'division':
      if (b === 0) return { error: 'No se puede dividir por cero.' };
      resultado = a / b;
      simbolo = '÷';
      break;
    default:
      return { error: 'Operación no reconocida.' };
  }

  // Limitar decimales a 4 cifras para legibilidad
  resultado = parseFloat(resultado.toFixed(4));

  return {
    resultado,
    expresion: `${a} ${simbolo} ${b}`
  };
}