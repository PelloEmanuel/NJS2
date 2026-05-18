/**
 * dom.js — Proyecto 3
 * Funciones de manipulación del DOM para el analizador de URLs.
 */

/**
 * Muestra u oculta un mensaje de error/éxito.
 * @param {string} id - ID del elemento
 * @param {string} texto - Texto a mostrar
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
 * Renderiza una tabla con los componentes de la URL analizada.
 * Crea filas dinámicas en el DOM para cada componente.
 * @param {object} componentes - Objeto con los campos de la URL
 */
export function renderizarComponentes(componentes) {
  const contenedor = document.getElementById('resultadoUrl');
  contenedor.innerHTML = '';

  // Campos principales a mostrar en la tabla
  const campos = [
    { clave: 'href',     label: 'URL completa' },
    { clave: 'protocol', label: 'Protocolo' },
    { clave: 'origin',   label: 'Origen' },
    { clave: 'host',     label: 'Host' },
    { clave: 'hostname', label: 'Hostname' },
    { clave: 'port',     label: 'Puerto' },
    { clave: 'pathname', label: 'Path' },
    { clave: 'search',   label: 'Query string' },
    { clave: 'hash',     label: 'Hash' },
  ];

  // Crear tabla
  const tabla = document.createElement('table');
  tabla.className = 'tabla-url';

  campos.forEach(({ clave, label }) => {
    const tr = document.createElement('tr');

    const tdLabel = document.createElement('td');
    tdLabel.textContent = label;

    const tdValor = document.createElement('td');
    tdValor.textContent = componentes[clave] || '—';

    tr.appendChild(tdLabel);
    tr.appendChild(tdValor);
    tabla.appendChild(tr);
  });

  contenedor.appendChild(tabla);

  // Parámetros de búsqueda como badges
  const params = componentes.params;
  if (params && Object.keys(params).length > 0) {
    const divParams = document.createElement('div');
    divParams.className = 'mt-3';

    const titulo = document.createElement('p');
    titulo.className = 'fw-semibold mb-1';
    titulo.style.color = 'var(--text-secondary)';
    titulo.textContent = 'Parámetros de búsqueda:';
    divParams.appendChild(titulo);

    Object.entries(params).forEach(([k, v]) => {
      const badge = document.createElement('span');
      badge.className = 'param-badge';
      badge.textContent = `${k} = ${v}`;
      divParams.appendChild(badge);
    });

    contenedor.appendChild(divParams);
  }
}

/**
 * Agrega una línea al historial de URLs.
 * @param {string} linea - Texto de la línea a agregar
 */
export function agregarAlHistorial(linea) {
  const lista = document.getElementById('listaHistorial');
  const li = document.createElement('li');
  li.className = 'list-group-item';
  li.textContent = linea;
  lista.appendChild(li);
  lista.scrollTop = lista.scrollHeight;
}

/**
 * Vacía el historial visual.
 */
export function vaciarHistorial() {
  document.getElementById('listaHistorial').innerHTML = '';
}

/**
 * Carga líneas de texto al historial visual.
 * @param {string} contenido - Texto multilinea
 */
export function cargarHistorial(contenido) {
  vaciarHistorial();
  contenido.split('\n').filter(l => l.trim()).forEach(agregarAlHistorial);
}

/**
 * Descarga contenido como .txt en el navegador.
 * @param {string} contenido
 * @param {string} nombre
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
 * Aplica tema claro u oscuro al documento.
 * @param {boolean} oscuro
 */
export function aplicarTema(oscuro) {
  document.documentElement.setAttribute('data-tema', oscuro ? 'oscuro' : 'claro');
  const btn = document.getElementById('btnTema');
  if (btn) btn.textContent = oscuro ? '☀️ Claro' : '🌙 Oscuro';
}