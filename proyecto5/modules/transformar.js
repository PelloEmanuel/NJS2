/**
 * transformar.js — Proyecto 5
 * Módulo de la página NPM / Transformar texto.
 * Idéntico al Proyecto 4: usa paquetes NPM instalados en el servidor
 * (upper-case, lower-case, title-case) para transformar texto.
 */

import { generarMenu, iniciarTema } from './menu.js';
import { mostrarMensaje }           from './dom.js';

document.addEventListener('DOMContentLoaded', () => {
  generarMenu();
  iniciarTema();
  cargarHistorial();
  iniciarEventos();
});

function iniciarEventos() {

  /**
   * Evento input en textarea:
   * Actualiza el contador de caracteres en tiempo real.
   */
  document.getElementById('textoInput').addEventListener('input', function () {
    document.getElementById('contadorChars').textContent = this.value.length;
  });

  /**
   * Evento change en los radio buttons:
   * Oculta el resultado previo al cambiar de transformación.
   */
  document.querySelectorAll('input[name="tipoTransf"]').forEach(r => {
    r.addEventListener('change', () => {
      document.getElementById('resultadoTransf').style.display = 'none';
    });
  });

  /**
   * Evento click en "Transformar y guardar".
   */
  document.getElementById('btnTransformar').addEventListener('click', manejarTransformacion);

  document.getElementById('btnLimpiarTodo').addEventListener('click', limpiarTodo);
  document.getElementById('btnDescargar').addEventListener('click', descargar);
}

/**
 * Valida el textarea, envía al servidor y muestra el resultado.
 */
async function manejarTransformacion() {
  const texto          = document.getElementById('textoInput').value.trim();
  const transformacion = document.querySelector('input[name="tipoTransf"]:checked').value;

  if (!texto) {
    mostrarMensaje('msgTransf', 'Escribí algún texto para transformar.', true);
    return;
  }

  try {
    const resp = await fetch('/api/transformar', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ texto, transformacion })
    });
    const data = await resp.json();

    if (!resp.ok) {
      mostrarMensaje('msgTransf', data.error || 'Error.', true);
      return;
    }

    /* Mostrar resultado */
    document.getElementById('textoResultado').textContent = data.resultado;
    document.getElementById('paqueteUsado').textContent   = `Paquete usado: ${data.paqueteUsado}`;
    document.getElementById('resultadoTransf').style.display = 'block';

    /* Agregar al historial */
    agregarItemHistorial('listaTransformaciones', data.linea, data.id);

    mostrarMensaje('msgTransf', '✓ Transformación guardada.', false);

  } catch {
    mostrarMensaje('msgTransf', 'Error de conexión.', true);
  }
}

/**
 * Agrega una línea al historial visual con botón de eliminación individual.
 * @param {string} listaId
 * @param {string} linea
 * @param {string} itemId
 */
function agregarItemHistorial(listaId, linea, itemId) {
  const lista = document.getElementById(listaId);
  if (!lista) return;

  const li = document.createElement('li');
  li.className = 'list-group-item';
  li.id = `item-${itemId}`;
  li.style.cssText = 'display:flex; justify-content:space-between; align-items:flex-start; gap:8px; font-size:.83rem; font-family:"Courier New",monospace;';

  const span = document.createElement('span');
  span.textContent = linea;
  span.style.flex = '1';
  span.style.wordBreak = 'break-all';

  const btn = document.createElement('button');
  btn.textContent = '✕';
  btn.className = 'btn btn-sm btn-outline-danger';
  btn.style.flexShrink = '0';

  btn.addEventListener('click', () => {
    li.remove();
    actualizarContador();
    eliminarDelServidor(itemId);
  });

  li.appendChild(span);
  li.appendChild(btn);
  lista.appendChild(li);
  lista.scrollTop = lista.scrollHeight;

  actualizarContador();
}

function actualizarContador() {
  const lista    = document.getElementById('listaTransformaciones');
  const contador = document.getElementById('contadorItems');
  if (!lista || !contador) return;
  const n = lista.querySelectorAll('li').length;
  contador.textContent = `Total: ${n} transformación${n !== 1 ? 'es' : ''}`;
}

async function eliminarDelServidor(id) {
  try {
    await fetch(`/api/eliminar-transformacion/${id}`, { method: 'DELETE' });
  } catch { /* continuar */ }
}

async function limpiarTodo() {
  try {
    await fetch('/api/limpiar-transformaciones', { method: 'DELETE' });
    document.getElementById('listaTransformaciones').innerHTML = '';
    document.getElementById('resultadoTransf').style.display = 'none';
    actualizarContador();
    mostrarMensaje('msgLista', 'Historial limpiado.', false);
  } catch {
    mostrarMensaje('msgLista', 'Error.', true);
  }
}

async function descargar() {
  try {
    const resp = await fetch('/api/leer-transformaciones');
    const data = await resp.json();
    if (!data.contenido) {
      mostrarMensaje('msgLista', 'No hay datos para descargar.', true);
      return;
    }
    const blob = new Blob([data.contenido], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'transformaciones.txt';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    mostrarMensaje('msgLista', 'Error al descargar.', true);
  }
}

/**
 * Carga el historial de transformaciones al iniciar.
 */
async function cargarHistorial() {
  try {
    const resp = await fetch('/api/leer-transformaciones');
    const data = await resp.json();
    if (!data.contenido) return;
    data.contenido.split('\n').filter(l => l.trim()).forEach(linea => {
      const match = linea.match(/^\[(\d+)\]/);
      const id    = match ? match[1] : Date.now().toString();
      agregarItemHistorial('listaTransformaciones', linea, id);
    });
  } catch { /* sin historial */ }
}