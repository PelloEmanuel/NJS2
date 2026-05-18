/**
 * archivos.js — Proyecto 5
 * Módulo de la página Archivos HTML.
 * Idéntico al Proyecto 2: crea archivos HTML con Node.js (fs),
 * los lista, los previsualiza en un iframe y permite descargarlos.
 */

import { generarMenu, iniciarTema } from './menu.js';
import { mostrarMensaje }           from './dom.js';

document.addEventListener('DOMContentLoaded', () => {
  generarMenu();
  iniciarTema();
  cargarListaArchivos();
  iniciarEventos();
});

function iniciarEventos() {

  /**
   * Evento input en campo nombre del archivo:
   * Fuerza minúsculas y solo caracteres válidos mientras el usuario escribe.
   */
  document.getElementById('nombreArchivo').addEventListener('input', function () {
    this.value = this.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
  });

  /**
   * Evento click en "Crear y guardar HTML".
   */
  document.getElementById('btnCrear').addEventListener('click', manejarCrear);

  /**
   * Evento click en "Refrescar lista".
   */
  document.getElementById('btnRefrescar').addEventListener('click', cargarListaArchivos);

  /**
   * Evento focus en campo título:
   * Limpia mensajes de error al enfocar el campo.
   */
  document.getElementById('tituloArchivo').addEventListener('focus', () => {
    mostrarMensaje('msgCrear', '', false);
  });
}

/**
 * Valida el formulario y envía los datos al servidor
 * para crear el archivo HTML con fs.writeFile.
 */
async function manejarCrear() {
  const nombre   = document.getElementById('nombreArchivo').value.trim();
  const titulo   = document.getElementById('tituloArchivo').value.trim();
  const contenido = document.getElementById('contenidoArchivo').value.trim();

  if (!nombre)   { mostrarMensaje('msgCrear', 'El nombre del archivo es obligatorio.', true); return; }
  if (!titulo)   { mostrarMensaje('msgCrear', 'El título es obligatorio.', true); return; }
  if (!contenido){ mostrarMensaje('msgCrear', 'El contenido no puede estar vacío.', true); return; }

  try {
    const resp = await fetch('/api/crear-html', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nombre, titulo, contenido })
    });
    const data = await resp.json();

    if (!resp.ok) {
      mostrarMensaje('msgCrear', data.error || 'Error al crear.', true);
      return;
    }

    mostrarMensaje('msgCrear', `✓ Archivo "${data.archivo}" creado.`, false);
    document.getElementById('nombreArchivo').value   = '';
    document.getElementById('tituloArchivo').value   = '';
    document.getElementById('contenidoArchivo').value = '';
    cargarListaArchivos();
  } catch {
    mostrarMensaje('msgCrear', 'Error de conexión.', true);
  }
}

/**
 * Carga la lista de archivos HTML generados en /data.
 */
async function cargarListaArchivos() {
  try {
    const resp = await fetch('/api/listar-html');
    const data = await resp.json();
    renderizarArchivos(data.archivos || []);
  } catch {
    document.getElementById('listaArchivos').innerHTML =
      '<p class="text-danger">Error al cargar.</p>';
  }
}

/**
 * Renderiza las tarjetas de archivos con botones Ver, Descargar y Eliminar.
 * @param {string[]} archivos
 */
function renderizarArchivos(archivos) {
  const contenedor = document.getElementById('listaArchivos');
  contenedor.innerHTML = '';

  if (archivos.length === 0) {
    contenedor.innerHTML = '<p class="text-muted text-center">No hay archivos generados aún.</p>';
    return;
  }

  archivos.forEach(nombre => {
    const div = document.createElement('div');
    div.id = `archivo-${nombre}`;
    div.style.cssText = `
      background:var(--item-bg); border:1px solid var(--border-color);
      border-left:4px solid var(--accent); border-radius:6px;
      padding:.6rem 1rem; margin-bottom:.6rem;
      display:flex; justify-content:space-between; align-items:center; gap:8px;
    `;

    const span = document.createElement('span');
    span.textContent = `📄 ${nombre}`;
    span.style.fontWeight = '600';

    const acciones = document.createElement('div');
    acciones.style.display = 'flex';
    acciones.style.gap = '6px';

    const btnVer = document.createElement('button');
    btnVer.textContent = '👁 Ver';
    btnVer.className = 'btn btn-sm btn-outline-primary';
    btnVer.addEventListener('click', () => previsualizarArchivo(nombre));

    const btnDesc = document.createElement('button');
    btnDesc.textContent = '⬇';
    btnDesc.className = 'btn btn-sm btn-outline-success';
    btnDesc.addEventListener('click', () => descargarArchivo(nombre));

    const btnDel = document.createElement('button');
    btnDel.textContent = '✕';
    btnDel.className = 'btn btn-sm btn-outline-danger';
    btnDel.addEventListener('click', () => eliminarArchivo(nombre, div));

    acciones.appendChild(btnVer);
    acciones.appendChild(btnDesc);
    acciones.appendChild(btnDel);
    div.appendChild(span);
    div.appendChild(acciones);
    contenedor.appendChild(div);
  });
}

/**
 * Muestra el archivo HTML en el iframe de previsualización.
 * @param {string} nombre
 */
function previsualizarArchivo(nombre) {
  const iframe = document.getElementById('iframePreview');
  const msg    = document.getElementById('msgPreview');
  iframe.style.display = 'block';
  iframe.src = `/api/ver-html/${nombre}`;
  msg.textContent = `Mostrando: ${nombre}`;
  msg.className = 'p-3 form-text text-info';
  iframe.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Descarga el archivo HTML en el navegador usando Blob.
 * @param {string} nombre
 */
async function descargarArchivo(nombre) {
  try {
    const resp = await fetch(`/api/contenido-html/${nombre}`);
    const data = await resp.json();
    if (data.contenido) {
      const blob = new Blob([data.contenido], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = nombre;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch {
    mostrarMensaje('msgLista', 'Error al descargar.', true);
  }
}

/**
 * Elimina un archivo del servidor y lo quita del DOM.
 * @param {string} nombre
 * @param {HTMLElement} elemento
 */
async function eliminarArchivo(nombre, elemento) {
  try {
    const resp = await fetch(`/api/eliminar-html/${nombre}`, { method: 'DELETE' });
    const data = await resp.json();
    if (data.ok) {
      elemento.style.opacity = '0';
      elemento.style.transition = 'opacity .3s';
      setTimeout(() => elemento.remove(), 300);
      const iframe = document.getElementById('iframePreview');
      if (iframe.src.includes(nombre)) {
        iframe.style.display = 'none';
        iframe.src = '';
        document.getElementById('msgPreview').textContent = '';
      }
      mostrarMensaje('msgLista', `"${nombre}" eliminado.`, false);
    }
  } catch {
    mostrarMensaje('msgLista', 'Error al eliminar.', true);
  }
}