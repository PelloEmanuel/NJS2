/**
 * dom.js — Proyecto 1
 * Funciones reutilizables para manipulación del DOM.
 * Responsabilidad: crear, actualizar y eliminar elementos visuales.
 */

/**
 * Muestra un mensaje de validación en un elemento del DOM.
 * @param {string} elementoId - ID del elemento
 * @param {string} mensaje - Texto del mensaje
 * @param {boolean} esError - true para error, false para éxito
 */
export function mostrarMensaje(elementoId, mensaje, esError = true) {
  const el = document.getElementById(elementoId);
  if (!el) return;
  el.textContent = mensaje;
  el.className = esError
    ? 'form-text text-danger mb-2'
    : 'form-text text-success mb-2';
  if (mensaje) setTimeout(() => { el.textContent = ''; }, 4000);
}

/**
 * Agrega un ítem a una lista <ul> dinámica con botón de eliminación.
 * @param {string} listaId - ID del <ul> destino
 * @param {string} texto - Texto del ítem
 * @param {function} onEliminar - Callback al hacer clic en eliminar
 * @returns {HTMLElement} El <li> creado
 */
export function agregarItemLista(listaId, texto, onEliminar) {
  const lista = document.getElementById(listaId);
  if (!lista) return null;

  const li = document.createElement('li');
  li.className = 'list-group-item';

  const span = document.createElement('span');
  span.style.flex = '1';
  span.style.wordBreak = 'break-word';
  span.textContent = texto;

  const btn = document.createElement('button');
  btn.textContent = '✕';
  btn.className = 'btn btn-sm btn-outline-danger ms-2';
  btn.style.flexShrink = '0';

  /**
   * Evento click: elimina el ítem del DOM y llama al callback.
   */
  btn.addEventListener('click', () => {
    li.remove();
    if (typeof onEliminar === 'function') onEliminar(texto);
  });

  li.appendChild(span);
  li.appendChild(btn);
  lista.appendChild(li);

  lista.scrollTop = lista.scrollHeight;

  return li;
}

/**
 * Vacía completamente una lista <ul> dinámica.
 * @param {string} listaId - ID del <ul> a vaciar
 */
export function vaciarLista(listaId) {
  const lista = document.getElementById(listaId);
  if (lista) lista.innerHTML = '';
}

/**
 * Carga líneas de texto en una lista dinámica desde un string multilinea.
 * @param {string} listaId - ID del <ul>
 * @param {string} contenido - Texto con saltos de línea
 * @param {function} onEliminar - Callback al eliminar cada ítem
 */
export function cargarListaDesdeTexto(listaId, contenido, onEliminar) {
  vaciarLista(listaId);
  contenido
    .split('\n')
    .filter(l => l.trim() !== '')
    .forEach(linea => agregarItemLista(listaId, linea, onEliminar));
}

/**
 * Genera y dispara la descarga de un archivo .txt en el navegador.
 * Usa Blob + URL.createObjectURL + elemento <a> dinámico.
 * @param {string} contenido - Texto a guardar
 * @param {string} nombreArchivo - Nombre sugerido del archivo
 */
export function descargarTxt(contenido, nombreArchivo) {
  const blob = new Blob([contenido], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Aplica o quita el tema oscuro modificando data-tema en <html>.
 * @param {boolean} oscuro - true activa modo oscuro
 */
export function aplicarTema(oscuro) {
  document.documentElement.setAttribute(
    'data-tema',
    oscuro ? 'oscuro' : 'claro'
  );
  const btn = document.getElementById('btnTema');
  if (btn) btn.textContent = oscuro ? '☀️ Claro' : '🌙 Oscuro';
}