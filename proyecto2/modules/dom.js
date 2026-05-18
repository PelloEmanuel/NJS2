/**
 * dom.js — Proyecto 2
 * Funciones reutilizables para manipular el DOM.
 */

/**
 * Muestra un mensaje en un elemento, con clase de éxito o error.
 * @param {string} id - ID del elemento donde mostrar el mensaje
 * @param {string} texto - Texto del mensaje
 * @param {boolean} esError - true para error, false para éxito
 */
export function mostrarMensaje(id, texto, esError = true) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = texto;
  el.className = esError ? 'form-text text-danger mb-2' : 'form-text text-success mb-2';
  if (texto) setTimeout(() => { el.textContent = ''; }, 4000);
}

/**
 * Aplica el tema claro u oscuro al elemento raíz <html>.
 * @param {boolean} oscuro
 */
export function aplicarTema(oscuro) {
  document.documentElement.setAttribute('data-tema', oscuro ? 'oscuro' : 'claro');
  const btn = document.getElementById('btnTema');
  if (btn) btn.textContent = oscuro ? '☀️ Claro' : '🌙 Oscuro';
}

/**
 * Renderiza la lista de archivos HTML en el panel derecho.
 * Crea una "tarjeta" por archivo con botones: Ver, Descargar, Eliminar.
 * @param {string[]} archivos - Array con los nombres de los archivos
 * @param {function} onVer - Callback al hacer click en "Ver"
 * @param {function} onEliminar - Callback al hacer click en "Eliminar"
 * @param {function} onDescargar - Callback al hacer click en "Descargar"
 */
export function renderizarListaArchivos(archivos, onVer, onEliminar, onDescargar) {
  const contenedor = document.getElementById('listaArchivos');
  contenedor.innerHTML = '';

  if (archivos.length === 0) {
    contenedor.innerHTML = '<p class="text-muted text-center">No hay archivos generados aún.</p>';
    return;
  }

  archivos.forEach(nombre => {
    // Contenedor de tarjeta del archivo
    const div = document.createElement('div');
    div.className = 'archivo-card';
    div.id = `archivo-${nombre}`;

    // Nombre del archivo
    const span = document.createElement('span');
    span.className = 'archivo-nombre';
    span.textContent = `📄 ${nombre}`;

    // Contenedor de acciones
    const acciones = document.createElement('div');
    acciones.className = 'archivo-acciones';

    // Botón Ver: abre en iframe
    const btnVer = document.createElement('button');
    btnVer.textContent = '👁 Ver';
    btnVer.className = 'btn btn-sm btn-outline-primary';
    btnVer.addEventListener('click', () => onVer(nombre));

    // Botón Descargar
    const btnDesc = document.createElement('button');
    btnDesc.textContent = '⬇';
    btnDesc.className = 'btn btn-sm btn-outline-success';
    btnDesc.title = 'Descargar archivo HTML';
    btnDesc.addEventListener('click', () => onDescargar(nombre));

    // Botón Eliminar
    const btnDel = document.createElement('button');
    btnDel.textContent = '✕';
    btnDel.className = 'btn btn-sm btn-outline-danger';
    btnDel.title = 'Eliminar archivo';
    btnDel.addEventListener('click', () => onEliminar(nombre, div));

    acciones.appendChild(btnVer);
    acciones.appendChild(btnDesc);
    acciones.appendChild(btnDel);

    div.appendChild(span);
    div.appendChild(acciones);
    contenedor.appendChild(div);
  });
}

/**
 * Muestra un archivo HTML en el iframe de previsualización.
 * @param {string} nombre - Nombre del archivo a previsualizar
 */
export function previsualizarArchivo(nombre) {
  const iframe = document.getElementById('iframePreview');
  const msg = document.getElementById('msgPreview');

  iframe.style.display = 'block';
  iframe.src = `/ver-html/${nombre}`;
  msg.textContent = `Mostrando: ${nombre}`;
  msg.className = 'p-3 form-text text-info';

  // Scroll al panel de previsualización
  iframe.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Genera y dispara la descarga de texto como archivo en el navegador.
 * Usa Blob + URL.createObjectURL + <a> dinámico.
 * @param {string} contenido - Texto del archivo
 * @param {string} nombreArchivo - Nombre sugerido para descarga
 */
export function descargarArchivo(contenido, nombreArchivo) {
  const blob = new Blob([contenido], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}