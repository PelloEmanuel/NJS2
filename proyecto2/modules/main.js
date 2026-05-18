/**
 * main.js — Proyecto 2
 * Punto de entrada: conecta eventos del DOM con las
 * funciones de dom.js y las rutas del servidor.
 */

import {
  mostrarMensaje,
  aplicarTema,
  renderizarListaArchivos,
  previsualizarArchivo,
  descargarArchivo
} from './dom.js';

let modoOscuro = false;

/* ─── Inicialización ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  cargarListaArchivos();
  iniciarEventos();
});

function iniciarEventos() {

  /**
   * Evento input en campo "nombre del archivo":
   * Convierte automáticamente a minúsculas mientras el usuario escribe,
   * evitando errores de mayúsculas en el nombre del archivo.
   */
  document.getElementById('nombreArchivo').addEventListener('input', function () {
    this.value = this.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
  });

  /**
   * Evento click en "Crear y guardar HTML":
   * Valida el formulario y envía los datos al servidor.
   */
  document.getElementById('btnCrear').addEventListener('click', manejarCrearHTML);

  /**
   * Evento click en "Refrescar":
   * Recarga la lista de archivos generados desde el servidor.
   */
  document.getElementById('btnRefrescar').addEventListener('click', cargarListaArchivos);

  /**
   * Evento click en botón de tema.
   */
  document.getElementById('btnTema').addEventListener('click', () => {
    modoOscuro = !modoOscuro;
    aplicarTema(modoOscuro);
  });

  /**
   * Evento focus en el campo "título":
   * Limpia mensajes de error anteriores cuando el usuario
   * empieza a editar el título.
   */
  document.getElementById('tituloArchivo').addEventListener('focus', () => {
    mostrarMensaje('msgCrear', '', false);
  });
}

/* ─── Crear HTML ─────────────────────────────────────────── */

/**
 * Maneja la creación de un nuevo archivo HTML:
 * 1. Valida los campos del formulario.
 * 2. Envía los datos al servidor vía POST.
 * 3. Actualiza la lista dinámica de archivos.
 */
async function manejarCrearHTML() {
  const nombre = document.getElementById('nombreArchivo').value.trim();
  const titulo = document.getElementById('tituloArchivo').value.trim();
  const contenido = document.getElementById('contenidoArchivo').value.trim();

  // Validaciones del formulario
  if (!nombre) {
    mostrarMensaje('msgCrear', 'El nombre del archivo es obligatorio.', true);
    return;
  }
  if (!titulo) {
    mostrarMensaje('msgCrear', 'El título de la página es obligatorio.', true);
    return;
  }
  if (!contenido) {
    mostrarMensaje('msgCrear', 'El contenido no puede estar vacío.', true);
    return;
  }

  try {
    const resp = await fetch('/crear-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, titulo, contenido })
    });

    const data = await resp.json();

    if (!resp.ok) {
      mostrarMensaje('msgCrear', data.error || 'Error al crear.', true);
      return;
    }

    mostrarMensaje('msgCrear', `✓ Archivo "${data.archivo}" creado exitosamente.`, false);

    // Limpiar formulario
    document.getElementById('nombreArchivo').value = '';
    document.getElementById('tituloArchivo').value = '';
    document.getElementById('contenidoArchivo').value = '';

    // Actualizar lista
    cargarListaArchivos();

  } catch {
    mostrarMensaje('msgCrear', 'Error de conexión con el servidor.', true);
  }
}

/* ─── Listar archivos ────────────────────────────────────── */

/**
 * Obtiene la lista de archivos .html desde el servidor
 * y la renderiza en el panel de la derecha.
 */
async function cargarListaArchivos() {
  try {
    const resp = await fetch('/listar-html');
    const data = await resp.json();
    renderizarListaArchivos(
      data.archivos,
      previsualizarArchivo,
      eliminarArchivo,
      manejarDescargar
    );
  } catch {
    document.getElementById('listaArchivos').innerHTML =
      '<p class="text-danger">Error al cargar archivos.</p>';
  }
}

/* ─── Eliminar archivo ───────────────────────────────────── */

/**
 * Elimina un archivo HTML del servidor y lo quita del DOM.
 * @param {string} nombre - Nombre del archivo a eliminar
 * @param {HTMLElement} elemento - Tarjeta del DOM a remover visualmente
 */
async function eliminarArchivo(nombre, elemento) {
  try {
    const resp = await fetch(`/eliminar-html/${nombre}`, { method: 'DELETE' });
    const data = await resp.json();

    if (data.ok) {
      // Remover la tarjeta del DOM con animación suave
      elemento.style.opacity = '0';
      elemento.style.transition = 'opacity 0.3s';
      setTimeout(() => elemento.remove(), 300);

      // Ocultar iframe si estaba mostrando el archivo eliminado
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

/* ─── Descargar archivo ──────────────────────────────────── */

/**
 * Obtiene el contenido de un archivo HTML del servidor
 * y lo descarga en el navegador del usuario.
 * @param {string} nombre - Nombre del archivo a descargar
 */
async function manejarDescargar(nombre) {
  try {
    const resp = await fetch(`/contenido-html/${nombre}`);
    const data = await resp.json();
    if (data.contenido) {
      descargarArchivo(data.contenido, nombre);
    }
  } catch {
    mostrarMensaje('msgLista', 'Error al descargar.', true);
  }
}