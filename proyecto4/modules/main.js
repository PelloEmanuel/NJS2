/**
 * main.js — Proyecto 4
 * Conecta los eventos del formulario con el servidor Express
 * y los módulos NPM (upper-case, lower-case, title-case).
 */

import {
  mostrarMensaje,
  mostrarResultado,
  agregarItemHistorial,
  vaciarLista,
  cargarHistorialDesdeTexto,
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
   * Evento input en el textarea de texto:
   * Actualiza el contador de caracteres en tiempo real,
   * informando al usuario cuántos caracteres ha escrito.
   */
  document.getElementById('textoInput').addEventListener('input', function () {
    document.getElementById('contadorChars').textContent = this.value.length;
  });

  /**
   * Evento change en los radio buttons de transformación:
   * Oculta el resultado anterior cuando el usuario cambia
   * el tipo de transformación, evitando confusión.
   */
  document.querySelectorAll('input[name="tipoTransf"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.getElementById('resultadoTransf').style.display = 'none';
    });
  });

  /**
   * Evento click en "Transformar y guardar":
   * Valida, envía al servidor y actualiza la lista.
   */
  document.getElementById('btnTransformar').addEventListener('click', manejarTransformacion);

  /**
   * Evento click en "Limpiar todo".
   */
  document.getElementById('btnLimpiarTodo').addEventListener('click', limpiarTodo);

  /**
   * Evento click en "Descargar".
   */
  document.getElementById('btnDescargar').addEventListener('click', descargar);

  /**
   * Evento click en botón de tema.
   */
  document.getElementById('btnTema').addEventListener('click', () => {
    modoOscuro = !modoOscuro;
    aplicarTema(modoOscuro);
  });
}

/**
 * Maneja la transformación de texto:
 * 1. Valida el textarea.
 * 2. Obtiene el tipo de transformación seleccionado.
 * 3. Envía al servidor.
 * 4. Muestra resultado y actualiza historial.
 */
async function manejarTransformacion() {
  const texto = document.getElementById('textoInput').value.trim();

  if (!texto) {
    mostrarMensaje('msgTransf', 'Escribí algún texto para transformar.', true);
    return;
  }

  const transformacion = document.querySelector('input[name="tipoTransf"]:checked').value;

  try {
    const resp = await fetch('/transformar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, transformacion })
    });

    const data = await resp.json();

    if (!resp.ok) {
      mostrarMensaje('msgTransf', data.error || 'Error.', true);
      return;
    }

    // Mostrar resultado en el DOM
    mostrarResultado(data.resultado, data.paqueteUsado);

    // Agregar al historial dinámico
    agregarItemHistorial(
      'listaTransformaciones',
      data.linea,
      data.id,
      eliminarTransformacion
    );

    mostrarMensaje('msgTransf', '✓ Transformación guardada.', false);

  } catch {
    mostrarMensaje('msgTransf', 'Error de conexión.', true);
  }
}

/**
 * Elimina una transformación individual del servidor por su ID.
 * @param {string} id - Timestamp ID de la transformación
 */
async function eliminarTransformacion(id) {
  try {
    await fetch(`/eliminar-transformacion/${id}`, { method: 'DELETE' });
  } catch {
    console.warn('Error al eliminar del servidor:', id);
  }
}

/**
 * Limpia todo el historial en el servidor y en el DOM.
 */
async function limpiarTodo() {
  try {
    await fetch('/limpiar-transformaciones', { method: 'DELETE' });
    vaciarLista('listaTransformaciones');
    document.getElementById('resultadoTransf').style.display = 'none';
    mostrarMensaje('msgLista', 'Historial limpiado.', false);
  } catch {
    mostrarMensaje('msgLista', 'Error al limpiar.', true);
  }
}

/**
 * Descarga el historial de transformaciones como .txt.
 */
async function descargar() {
  try {
    const resp = await fetch('/leer-transformaciones');
    const data = await resp.json();
    if (!data.contenido) {
      mostrarMensaje('msgLista', 'No hay datos para descargar.', true);
      return;
    }
    descargarTxt(data.contenido, 'transformaciones.txt');
  } catch {
    mostrarMensaje('msgLista', 'Error al descargar.', true);
  }
}

/**
 * Carga el historial de transformaciones al iniciar la página.
 */
async function cargarHistorialInicial() {
  try {
    const resp = await fetch('/leer-transformaciones');
    const data = await resp.json();
    if (data.contenido) {
      cargarHistorialDesdeTexto(
        'listaTransformaciones',
        data.contenido,
        eliminarTransformacion
      );
    }
  } catch {
    console.warn('No se pudo cargar el historial.');
  }
}