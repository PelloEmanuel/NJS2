/**
 * main.js — Proyecto 3
 * Conecta los eventos del formulario de análisis de URLs
 * con el servidor y las funciones de dom.js.
 */

import {
  mostrarMensaje,
  renderizarComponentes,
  agregarAlHistorial,
  vaciarHistorial,
  cargarHistorial,
  descargarTxt,
  aplicarTema
} from './dom.js';

let modoOscuro = false;

document.addEventListener('DOMContentLoaded', () => {
  cargarHistorialInicial();
  iniciarEventos();
});

function iniciarEventos() {

  /**
   * Evento click en "Analizar":
   * Envía la URL al servidor y muestra los componentes.
   */
  document.getElementById('btnAnalizar').addEventListener('click', manejarAnalisis);

  /**
   * Evento keydown en el input de URL:
   * Permite analizar la URL presionando Enter,
   * mejorando la usabilidad del formulario.
   */
  document.getElementById('inputUrl').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      manejarAnalisis();
    }
  });

  /**
   * Evento click en botones de ejemplos:
   * Carga una URL de ejemplo en el input y la analiza automáticamente.
   */
  document.querySelectorAll('.btn-ejemplo').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('inputUrl').value = btn.dataset.url;
      manejarAnalisis();
    });
  });

  /**
   * Evento click en "Descargar historial".
   */
  document.getElementById('btnDescargarHistorial').addEventListener('click', descargarHistorial);

  /**
   * Evento click en "Limpiar historial":
   * Elimina los registros del servidor y vacía la lista visual.
   */
  document.getElementById('btnLimpiarHistorial').addEventListener('click', limpiarHistorial);

  /**
   * Evento click en botón de tema.
   */
  document.getElementById('btnTema').addEventListener('click', () => {
    modoOscuro = !modoOscuro;
    aplicarTema(modoOscuro);
  });
}

/**
 * Envía la URL al servidor para análisis y renderiza los componentes.
 */
async function manejarAnalisis() {
  const urlTexto = document.getElementById('inputUrl').value.trim();

  if (!urlTexto) {
    mostrarMensaje('msgUrl', 'Ingresá una URL antes de analizar.', true);
    return;
  }

  try {
    const resp = await fetch('/analizar-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urlTexto })
    });

    const data = await resp.json();

    if (!resp.ok) {
      mostrarMensaje('msgUrl', data.error || 'Error en el análisis.', true);
      return;
    }

    // Renderizar tabla de componentes
    renderizarComponentes(data.componentes);
    mostrarMensaje('msgUrl', '✓ URL analizada correctamente.', false);

    // Agregar al historial visual
    const resumen = `${data.componentes.host}${data.componentes.pathname}`;
    agregarAlHistorial(`[Analizada] ${resumen}`);

  } catch {
    mostrarMensaje('msgUrl', 'Error de conexión con el servidor.', true);
  }
}

/**
 * Carga el historial de URLs analizadas al iniciar la página.
 */
async function cargarHistorialInicial() {
  try {
    const resp = await fetch('/historial-urls');
    const data = await resp.json();
    if (data.contenido) cargarHistorial(data.contenido);
  } catch {
    console.warn('No se pudo cargar el historial.');
  }
}

/**
 * Descarga el historial de URLs como archivo .txt.
 */
async function descargarHistorial() {
  try {
    const resp = await fetch('/historial-urls');
    const data = await resp.json();
    if (!data.contenido) {
      mostrarMensaje('msgHistorial', 'No hay datos para descargar.', true);
      return;
    }
    descargarTxt(data.contenido, 'historial-urls.txt');
  } catch {
    mostrarMensaje('msgHistorial', 'Error al descargar.', true);
  }
}

/**
 * Limpia el historial de URLs tanto en el servidor como en el DOM.
 */
async function limpiarHistorial() {
  try {
    await fetch('/limpiar-historial', { method: 'DELETE' });
    vaciarHistorial();
    mostrarMensaje('msgHistorial', 'Historial eliminado.', false);
  } catch {
    mostrarMensaje('msgHistorial', 'Error al limpiar.', true);
  }
}