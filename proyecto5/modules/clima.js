/**
 * clima.js — Proyecto 5
 * Módulo de la página Clima.
 * Usa el módulo propio clima-modulo.js (igual que Proyecto 1).
 * Persiste consultas en el servidor vía /api/guardar-clima.
 */

import { generarMenu, iniciarTema }   from './menu.js';
import { consultarClima }             from './clima-modulo.js';
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
   * Evento input en campo ciudad:
   * Limpia mensajes de error mientras el usuario escribe.
   */
  document.getElementById('ciudad').addEventListener('input', () => {
    mostrarMensaje('msgClima', '', false);
  });

  /**
   * Evento click en "Consultar y Guardar".
   */
  document.getElementById('btnConsultarClima').addEventListener('click', manejarClima);

  /**
   * Evento click en "Borrar todo".
   */
  document.getElementById('btnBorrarClima').addEventListener('click', borrarTodo);

  /**
   * Evento click en "Descargar clima.txt".
   */
  document.getElementById('btnDescargarClima').addEventListener('click', descargar);
}

/**
 * Genera datos simulados con el módulo clima-modulo.js,
 * los muestra en el DOM y los persiste en el servidor.
 */
async function manejarClima() {
  const ciudad = document.getElementById('ciudad').value;
  const res    = consultarClima(ciudad);

  if (res.error) {
    mostrarMensaje('msgClima', res.error, true);
    return;
  }

  document.getElementById('resultadoClima').innerHTML =
    `<strong>${res.ciudad}</strong>: ${res.temperatura}°C — ${res.estado}`;

  try {
    const resp = await fetch('/api/guardar-clima', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(res)
    });
    const data = await resp.json();

    if (data.ok) {
      agregarItemLista('listaClima', data.linea.trim(), () => {});
      mostrarMensaje('msgClima', '✓ Consulta guardada.', false);
    }
  } catch {
    mostrarMensaje('msgClima', 'Error al guardar.', true);
  }
}

async function borrarTodo() {
  try {
    await fetch('/api/eliminar-clima', { method: 'DELETE' });
    vaciarLista('listaClima');
    document.getElementById('resultadoClima').textContent = '';
    mostrarMensaje('msgClima', 'Historial eliminado.', false);
  } catch {
    mostrarMensaje('msgClima', 'Error.', true);
  }
}

async function descargar() {
  try {
    const resp = await fetch('/api/leer-clima');
    const data = await resp.json();
    if (!data.contenido) {
      mostrarMensaje('msgClima', 'No hay datos para descargar.', true);
      return;
    }
    descargarTxt(data.contenido, 'clima.txt');
  } catch {
    mostrarMensaje('msgClima', 'Error al descargar.', true);
  }
}

async function cargarHistorial() {
  try {
    const resp = await fetch('/api/leer-clima');
    const data = await resp.json();
    if (data.contenido) cargarListaDesdeTexto('listaClima', data.contenido, () => {});
  } catch {
    console.warn('No se pudo cargar el historial de clima.');
  }
}