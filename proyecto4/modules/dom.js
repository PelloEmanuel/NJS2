/**
 * dom.js — Proyecto 4
 * Funciones reutilizables para manipular el DOM
 * en el módulo de transformaciones NPM.
 */

/**
 * Muestra un mensaje de validación o confirmación.
 * @param {string} id - ID del elemento
 * @param {string} texto
 * @param {boolean} esError
 */
export function mostrarMensaje(id, texto, esError = true) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = texto;
  el.className = esError
    ? 'form-text text-danger mb-2'
    : 'form-text text-success mb-2';
  if (texto) setTimeout(() => { el.textContent = ''; }, 4000);
}

/**
 * Muestra el resultado de una transformación en el panel de resultado.
 * @param {string} texto - Texto transformado
 * @param {string} paquete - Nombre del paquete NPM usado
 */
export function mostrarResultado(texto, paquete) {
  const caja = document.getElementById('resultadoTransf');
  const textoEl = document.getElementById('textoResultado');
  const paqueteEl = document.getElementById('paqueteUsado');

  textoEl.textContent = texto;
  paqueteEl.textContent = `Paquete usado: ${paquete}`;
  caja.style.display = 'block';
}

/**
 * Agrega un ítem al historial de transformaciones.
 * Incluye un botón de eliminación individual por ID.
 * @param {string} listaId - ID del <ul>
 * @param {string} linea - Texto descriptivo de la transformación
 * @param {string} itemId - ID único del ítem para eliminar del servidor
 * @param {function} onEliminar - Callback con el ID a eliminar
 */
export function agregarItemHistorial(listaId, linea, itemId, onEliminar) {
  const lista = document.getElementById(listaId);
  if (!lista) return;

  const li = document.createElement('li');
  li.className = 'list-group-item';
  li.id = `item-${itemId}`;

  const span = document.createElement('span');
  span.className = 'item-texto-transf';
  span.textContent = linea;

  const btn = document.createElement('button');
  btn.textContent = '✕';
  btn.className = 'btn btn-sm btn-outline-danger';
  btn.title = 'Eliminar este registro';

  /**
   * Evento click en botón eliminar individual:
   * Remueve el ítem del DOM y llama al callback para
   * actualizar el archivo .txt en el servidor.
   */
  btn.addEventListener('click', () => {
    li.remove();
    actualizarContador(listaId);
    if (typeof onEliminar === 'function') onEliminar(itemId);
  });

  li.appendChild(span);
  li.appendChild(btn);
  lista.appendChild(li);
  lista.scrollTop = lista.scrollHeight;

  actualizarContador(listaId);
}

/**
 * Actualiza el contador de ítems en la lista.
 * @param {string} listaId
 */
export function actualizarContador(listaId) {
  const lista = document.getElementById(listaId);
  const contador = document.getElementById('contadorItems');
  if (!lista || !contador) return;
  const cantidad = lista.querySelectorAll('li').length;
  contador.textContent = `Total: ${cantidad} transformación${cantidad !== 1 ? 'es' : ''}`;
}

/**
 * Vacía la lista de historial visual.
 * @param {string} listaId
 */
export function vaciarLista(listaId) {
  const lista = document.getElementById(listaId);
  if (lista) lista.innerHTML = '';
  actualizarContador(listaId);
}

/**
 * Carga el historial de transformaciones desde texto plano.
 * Extrae el ID de cada línea para habilitar eliminación individual.
 * @param {string} listaId
 * @param {string} contenido
 * @param {function} onEliminar
 */
export function cargarHistorialDesdeTexto(listaId, contenido, onEliminar) {
  vaciarLista(listaId);
  const lineas = contenido.split('\n').filter(l => l.trim());

  lineas.forEach(linea => {
    // El ID está al inicio de la línea: [1234567890]
    const match = linea.match(/^\[(\d+)\]/);
    const itemId = match ? match[1] : Date.now().toString();
    agregarItemHistorial(listaId, linea, itemId, onEliminar);
  });
}

/**
 * Descarga contenido como .txt en el navegador.
 */
export function descargarTxt(contenido, nombre) {
  const blob = new Blob([contenido], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Aplica el tema al documento.
 * @param {boolean} oscuro
 */
export function aplicarTema(oscuro) {
  document.documentElement.setAttribute('data-tema', oscuro ? 'oscuro' : 'claro');
  const btn = document.getElementById('btnTema');
  if (btn) btn.textContent = oscuro ? '☀️ Claro' : '🌙 Oscuro';
}