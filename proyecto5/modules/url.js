/**
 * url.js — Proyecto 5
 * Módulo de la página Módulo URL.
 * Idéntico al Proyecto 3: envía URLs al servidor donde se
 * analizan con el módulo URL nativo de Node.js y se muestran
 * los componentes en una tabla dinámica.
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
   * Evento click en "Analizar".
   */
  document.getElementById('btnAnalizar').addEventListener('click', manejarAnalisis);

  /**
   * Evento keydown en el input URL:
   * Permite analizar presionando Enter.
   */
  document.getElementById('inputUrl').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); manejarAnalisis(); }
  });

  /**
   * Evento click en botones de ejemplos:
   * Carga la URL de ejemplo y la analiza automáticamente.
   */
  document.querySelectorAll('.btn-ejemplo').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('inputUrl').value = btn.dataset.url;
      manejarAnalisis();
    });
  });

  document.getElementById('btnDescargarHistorial').addEventListener('click', descargarHistorial);
  document.getElementById('btnLimpiarHistorial').addEventListener('click', limpiarHistorial);
}

/**
 * Envía la URL al servidor, recibe los componentes y los renderiza.
 */
async function manejarAnalisis() {
  const urlTexto = document.getElementById('inputUrl').value.trim();
  if (!urlTexto) {
    mostrarMensaje('msgUrl', 'Ingresá una URL antes de analizar.', true);
    return;
  }

  try {
    const resp = await fetch('/api/analizar-url', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ urlTexto })
    });
    const data = await resp.json();

    if (!resp.ok) {
      mostrarMensaje('msgUrl', data.error || 'Error en el análisis.', true);
      return;
    }

    renderizarComponentes(data.componentes);
    mostrarMensaje('msgUrl', '✓ URL analizada. Ver consola del servidor para el log.', false);

    agregarAlHistorialDOM(
      `${data.componentes.host}${data.componentes.pathname}`
    );
  } catch {
    mostrarMensaje('msgUrl', 'Error de conexión.', true);
  }
}

/**
 * Renderiza una tabla con los componentes de la URL analizada.
 * @param {object} c - Componentes de la URL
 */
function renderizarComponentes(c) {
  const contenedor = document.getElementById('resultadoUrl');
  contenedor.innerHTML = '';

  const campos = [
    { label: 'URL completa', val: c.href },
    { label: 'Protocolo',   val: c.protocol },
    { label: 'Origen',      val: c.origin },
    { label: 'Host',        val: c.host },
    { label: 'Hostname',    val: c.hostname },
    { label: 'Puerto',      val: c.port },
    { label: 'Path',        val: c.pathname },
    { label: 'Query',       val: c.search },
    { label: 'Hash',        val: c.hash },
  ];

  const tabla = document.createElement('table');
  tabla.style.cssText = 'width:100%; border-collapse:collapse; font-size:.88rem;';

  campos.forEach(({ label, val }) => {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');

    td1.textContent = label;
    td1.style.cssText = 'padding:.35rem .5rem; border-bottom:1px solid var(--border-color); font-weight:600; color:var(--text-secondary); white-space:nowrap; width:110px;';

    td2.textContent = val || '—';
    td2.style.cssText = 'padding:.35rem .5rem; border-bottom:1px solid var(--border-color); font-family:"Courier New",monospace; color:var(--accent); word-break:break-all;';

    tr.appendChild(td1);
    tr.appendChild(td2);
    tabla.appendChild(tr);
  });

  contenedor.appendChild(tabla);

  /* Badges de parámetros */
  const params = c.params;
  if (params && Object.keys(params).length > 0) {
    const wrap = document.createElement('div');
    wrap.className = 'mt-3';
    const tit = document.createElement('p');
    tit.style.cssText = 'font-weight:600; color:var(--text-secondary); margin-bottom:4px; font-size:.85rem;';
    tit.textContent = 'Parámetros de búsqueda:';
    wrap.appendChild(tit);

    Object.entries(params).forEach(([k, v]) => {
      const badge = document.createElement('span');
      badge.textContent = `${k} = ${v}`;
      badge.style.cssText = `
        display:inline-block; background:var(--item-bg); color:var(--accent);
        border-radius:4px; padding:2px 8px; font-size:.8rem; margin:2px;
        font-family:'Courier New',monospace; border:1px solid var(--border-color);
      `;
      wrap.appendChild(badge);
    });

    contenedor.appendChild(wrap);
  }
}

function agregarAlHistorialDOM(linea) {
  const lista = document.getElementById('listaHistorial');
  const li = document.createElement('li');
  li.className = 'list-group-item';
  li.style.fontSize = '.8rem';
  li.style.fontFamily = "'Courier New', monospace";
  li.textContent = linea;
  lista.appendChild(li);
  lista.scrollTop = lista.scrollHeight;
}

async function cargarHistorial() {
  try {
    const resp = await fetch('/api/historial-urls');
    const data = await resp.json();
    if (data.contenido) {
      data.contenido.split('\n').filter(l => l.trim()).forEach(agregarAlHistorialDOM);
    }
  } catch { /* sin historial */ }
}

async function descargarHistorial() {
  try {
    const resp = await fetch('/api/historial-urls');
    const data = await resp.json();
    if (!data.contenido) {
      mostrarMensaje('msgHistorial', 'No hay datos para descargar.', true);
      return;
    }
    const blob = new Blob([data.contenido], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'historial-urls.txt';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    mostrarMensaje('msgHistorial', 'Error al descargar.', true);
  }
}

async function limpiarHistorial() {
  try {
    await fetch('/api/limpiar-urls', { method: 'DELETE' });
    document.getElementById('listaHistorial').innerHTML = '';
    mostrarMensaje('msgHistorial', 'Historial eliminado.', false);
  } catch {
    mostrarMensaje('msgHistorial', 'Error.', true);
  }
}