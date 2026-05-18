/**
 * contacto.js — Proyecto 5
 * Módulo del formulario de contacto.
 * CRUD de mensajes: crear, listar y eliminar.
 * Los mensajes se persisten en /data/contacto.txt vía el servidor.
 */

import { generarMenu, iniciarTema } from './menu.js';

document.addEventListener('DOMContentLoaded', () => {
  generarMenu();
  iniciarTema();
  cargarMensajes();
  iniciarEventos();
});

function iniciarEventos() {

  /**
   * Evento input en el textarea de mensaje:
   * Actualiza el contador de caracteres en tiempo real.
   */
  document.getElementById('contMensaje').addEventListener('input', function () {
    document.getElementById('contadorCont').textContent = this.value.length;
  });

  /**
   * Evento click en "Enviar mensaje":
   * Valida y envía el formulario al servidor.
   */
  document.getElementById('btnEnviarContacto').addEventListener('click', enviarMensaje);

  /**
   * Evento blur en campo email:
   * Valida el formato del email al salir del campo,
   * dando retroalimentación anticipada al usuario.
   */
  document.getElementById('contEmail').addEventListener('blur', function () {
    const val = this.value.trim();
    if (val && !val.includes('@')) {
      mostrarMsg('msgContacto', 'El email no tiene un formato válido.', true);
    } else {
      mostrarMsg('msgContacto', '', false);
    }
  });
}

/**
 * Valida y envía el formulario de contacto al servidor.
 */
async function enviarMensaje() {
  const nombre  = document.getElementById('contNombre').value.trim();
  const email   = document.getElementById('contEmail').value.trim();
  const mensaje = document.getElementById('contMensaje').value.trim();

  if (!nombre) { mostrarMsg('msgContacto', 'El nombre es obligatorio.', true); return; }
  if (!email)  { mostrarMsg('msgContacto', 'El email es obligatorio.', true);  return; }
  if (!email.includes('@')) { mostrarMsg('msgContacto', 'Email inválido.', true); return; }
  if (!mensaje) { mostrarMsg('msgContacto', 'El mensaje no puede estar vacío.', true); return; }

  try {
    const resp = await fetch('/api/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, mensaje })
    });
    const data = await resp.json();

    if (!resp.ok) {
      mostrarMsg('msgContacto', data.error || 'Error.', true);
      return;
    }

    // Limpiar formulario
    document.getElementById('contNombre').value = '';
    document.getElementById('contEmail').value = '';
    document.getElementById('contMensaje').value = '';
    document.getElementById('contadorCont').textContent = '0';

    mostrarMsg('msgContacto', '✓ Mensaje enviado correctamente.', false);
    cargarMensajes();

  } catch {
    mostrarMsg('msgContacto', 'Error de conexión.', true);
  }
}

/**
 * Carga todos los mensajes del servidor y los renderiza.
 */
async function cargarMensajes() {
  try {
    const resp = await fetch('/api/contacto');
    const data = await resp.json();
    renderizarMensajes(data.mensajes || []);
  } catch {
    document.getElementById('listaMensajes').innerHTML =
      '<p class="text-danger">Error al cargar mensajes.</p>';
  }
}

/**
 * Renderiza los mensajes en el DOM.
 * @param {Array} mensajes
 */
function renderizarMensajes(mensajes) {
  const contenedor = document.getElementById('listaMensajes');
  const contador   = document.getElementById('contadorMensajes');

  contador.textContent = mensajes.length;

  if (mensajes.length === 0) {
    contenedor.innerHTML = '<p class="text-muted text-center">No hay mensajes aún.</p>';
    return;
  }

  contenedor.innerHTML = '';
  // Más recientes primero
  [...mensajes].reverse().forEach(msg => {
    const div = document.createElement('div');
    div.className = 'card mb-3';
    div.id = `msg-${msg.id}`;
    div.style.borderLeft = '4px solid var(--accent)';

    div.innerHTML = `
      <div class="card-body py-2 px-3">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <strong>${escapeHtml(msg.nombre)}</strong>
            <span class="text-muted ms-2" style="font-size:0.8rem">${escapeHtml(msg.email)}</span>
          </div>
          <button class="btn btn-sm btn-outline-danger"
            onclick="eliminarMensaje('${msg.id}')">✕</button>
        </div>
        <p class="mb-0 mt-1" style="font-size:0.9rem">${escapeHtml(msg.mensaje)}</p>
        <div class="text-muted mt-1" style="font-size:0.75rem">${msg.fecha}</div>
      </div>
    `;

    contenedor.appendChild(div);
  });
}

/**
 * Elimina un mensaje por ID.
 * @param {string} id
 */
window.eliminarMensaje = async function (id) {
  try {
    const resp = await fetch(`/api/contacto/${id}`, { method: 'DELETE' });
    const data = await resp.json();
    if (data.ok) {
      document.getElementById(`msg-${id}`)?.remove();
      cargarMensajes();
      mostrarMsg('msgListaContacto', 'Mensaje eliminado.', false);
    }
  } catch {
    mostrarMsg('msgListaContacto', 'Error al eliminar.', true);
  }
};

function mostrarMsg(id, texto, esError) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = texto;
  el.className = esError ? 'form-text text-danger mb-2' : 'form-text text-success mb-2';
  if (texto) setTimeout(() => { el.textContent = ''; }, 4000);
}

function escapeHtml(texto) {
  if (!texto) return '';
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}