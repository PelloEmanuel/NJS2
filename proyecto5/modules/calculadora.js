/**
 * calculadora.js — Proyecto 5
 * Módulo de la página Calculadora.
 * Usa el módulo propio calculo.js (igual que Proyecto 1)
 * y persiste resultados en el servidor vía /api/guardar-calculo.
 */

import { generarMenu, iniciarTema } from './menu.js';
import { calcular }                  from './calculo.js';
import {
  mostrarMensaje,
  agregarItemLista,
  vaciarLista,
  cargarListaDesdeTexto,
  descargarTxt
} from './dom.js';

document.addEventListener('DOMContentLoaded', () => {
  generarMenu();
  iniciarTema();
  cargarHistorial();
  iniciarEventos();
});

function iniciarEventos() {

  /**
   * Evento change en el selector de operación:
   * Limpia el resultado anterior al cambiar la operación.
   */
  document.getElementById('operacion').addEventListener('change', () => {
    document.getElementById('resultadoCalculo').textContent = '';
  });

  /**
   * Evento click en "Calcular y Guardar".
   */
  document.getElementById('btnCalcular').addEventListener('click', manejarCalculo);

  /**
   * Evento click en "Borrar todo".
   */
  document.getElementById('btnBorrarCalculos').addEventListener('click', borrarTodo);

  /**
   * Evento click en "Descargar calculos.txt".
   */
  document.getElementById('btnDescargarCalculos').addEventListener('click', descargar);
}

/**
 * Valida entradas, llama al módulo calculo.js, guarda en servidor
 * y actualiza la lista dinámica.
 */
async function manejarCalculo() {
  const v1 = document.getElementById('num1').value;
  const v2 = document.getElementById('num2').value;
  const op = document.getElementById('operacion').value;

  if (v1 === '' || v2 === '') {
    mostrarMensaje('msgCalculo', 'Ingresá ambos números.', true);
    return;
  }

  const res = calcular(parseFloat(v1), parseFloat(v2), op);

  if (res.error) {
    mostrarMensaje('msgCalculo', res.error, true);
    return;
  }

  document.getElementById('resultadoCalculo').textContent =
    `Resultado: ${res.expresion} = ${res.resultado}`;

  try {
    const resp = await fetch('/api/guardar-calculo', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ operacion: res.expresion, resultado: res.resultado })
    });
    const data = await resp.json();

    if (data.ok) {
      agregarItemLista('listaCalculos', data.linea.trim(), () => {});
      mostrarMensaje('msgCalculo', '✓ Guardado correctamente.', false);
    }
  } catch {
    mostrarMensaje('msgCalculo', 'Error al conectar con el servidor.', true);
  }
}

async function borrarTodo() {
  try {
    await fetch('/api/eliminar-calculos', { method: 'DELETE' });
    vaciarLista('listaCalculos');
    document.getElementById('resultadoCalculo').textContent = '';
    mostrarMensaje('msgCalculo', 'Historial eliminado.', false);
  } catch {
    mostrarMensaje('msgCalculo', 'Error al eliminar.', true);
  }
}

async function descargar() {
  try {
    const resp = await fetch('/api/leer-calculos');
    const data = await resp.json();
    if (!data.contenido) {
      mostrarMensaje('msgCalculo', 'No hay datos para descargar.', true);
      return;
    }
    descargarTxt(data.contenido, 'calculos.txt');
  } catch {
    mostrarMensaje('msgCalculo', 'Error al descargar.', true);
  }
}

async function cargarHistorial() {
  try {
    const resp = await fetch('/api/leer-calculos');
    const data = await resp.json();
    if (data.contenido) cargarListaDesdeTexto('listaCalculos', data.contenido, () => {});
  } catch {
    console.warn('No se pudo cargar el historial de cálculos.');
  }
}