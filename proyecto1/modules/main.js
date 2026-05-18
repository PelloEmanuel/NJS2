/**
 * main.js — Proyecto 1
 * Módulo principal: conecta eventos del DOM con los módulos
 * calculo.js, clima.js y dom.js.
 * Maneja la persistencia comunicándose con el servidor Express.
 */

import { calcular }       from './calculo.js';
import { consultarClima } from './clima.js';
import {
  mostrarMensaje,
  agregarItemLista,
  vaciarLista,
  cargarListaDesdeTexto,
  descargarTxt,
  aplicarTema
} from './dom.js';

/* Estado del tema */
let modoOscuro = false;

/* ── Inicialización ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  cargarHistorialCalculos();
  cargarHistorialClima();
  iniciarEventos();
});

/* ── Registro de eventos ──────────────────────────── */
function iniciarEventos() {

  /**
   * Evento change en el selector de operación:
   * Limpia el resultado anterior al cambiar la operación.
   */
  document.getElementById('operacion').addEventListener('change', () => {
    document.getElementById('resultadoCalculo').textContent = '';
  });

  /**
   * Evento click en "Calcular y Guardar".
   */
  document.getElementById('btnCalcular').addEventListener('click', manejarCalculo);

  /**
   * Evento click en "Borrar todo" de cálculos.
   */
  document.getElementById('btnBorrarCalculos').addEventListener('click', borrarTodosCalculos);

  /**
   * Evento click en "Descargar calculos.txt".
   */
  document.getElementById('btnDescargarCalculos').addEventListener('click', descargarCalculos);

  /**
   * Evento input en campo ciudad:
   * Limpia mensajes de error mientras el usuario escribe.
   */
  document.getElementById('ciudad').addEventListener('input', () => {
    mostrarMensaje('msgClima', '', false);
  });

  /**
   * Evento click en "Consultar y Guardar" (clima).
   */
  document.getElementById('btnConsultarClima').addEventListener('click', manejarClima);

  /**
   * Evento click en "Borrar todo" de clima.
   */
  document.getElementById('btnBorrarClima').addEventListener('click', borrarTodoClima);

  /**
   * Evento click en "Descargar clima.txt".
   */
  document.getElementById('btnDescargarClima').addEventListener('click', descargarClima);

  /**
   * Evento click en botón de tema claro/oscuro.
   */
  document.getElementById('btnTema').addEventListener('click', () => {
    modoOscuro = !modoOscuro;
    aplicarTema(modoOscuro);
  });
}

/* ════════════════════════════════════════════════════
   MÓDULO CÁLCULO
   ════════════════════════════════════════════════════ */

/**
 * Maneja la acción de calcular:
 * 1. Valida los campos del formulario.
 * 2. Llama al módulo calculo.js.
 * 3. Muestra el resultado en el DOM.
 * 4. Guarda en el servidor (/data/calculos.txt).
 * 5. Agrega el resultado a la lista dinámica.
 */
async function manejarCalculo() {
  const v1 = document.getElementById('num1').value;
  const v2 = document.getElementById('num2').value;
  const op = document.getElementById('operacion').value;

  if (v1 === '' || v2 === '') {
    mostrarMensaje('msgCalculo', 'Ingresá ambos números.', true);
    return;
  }

  const res = calcular(parseFloat(v1), parseFloat(v2), op);

  if (res.error) {
    mostrarMensaje('msgCalculo', res.error, true);
    return;
  }

  document.getElementById('resultadoCalculo').textContent =
    `Resultado: ${res.expresion} = ${res.resultado}`;

  try {
    const resp = await fetch('/guardar-calculo', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ operacion: res.expresion, resultado: res.resultado })
    });
    const data = await resp.json();

    if (data.ok) {
      agregarItemLista('listaCalculos', data.linea.trim(), () => {});
      mostrarMensaje('msgCalculo', '✓ Guardado correctamente.', false);
    }
  } catch {
    mostrarMensaje('msgCalculo', 'Error al conectar con el servidor.', true);
  }
}

/**
 * Borra todos los cálculos del servidor y vacía la lista del DOM.
 */
async function borrarTodosCalculos() {
  try {
    await fetch('/eliminar-calculos', { method: 'DELETE' });
    vaciarLista('listaCalculos');
    document.getElementById('resultadoCalculo').textContent = '';
    mostrarMensaje('msgCalculo', 'Historial eliminado.', false);
  } catch {
    mostrarMensaje('msgCalculo', 'Error al eliminar.', true);
  }
}

/**
 * Descarga el archivo calculos.txt desde el servidor al navegador.
 */
async function descargarCalculos() {
  try {
    const resp = await fetch('/leer-calculos');
    const data = await resp.json();
    if (!data.contenido) {
      mostrarMensaje('msgCalculo', 'No hay datos para descargar.', true);
      return;
    }
    descargarTxt(data.contenido, 'calculos.txt');
  } catch {
    mostrarMensaje('msgCalculo', 'Error al descargar.', true);
  }
}

/**
 * Carga el historial de cálculos al iniciar la página.
 */
async function cargarHistorialCalculos() {
  try {
    const resp = await fetch('/leer-calculos');
    const data = await resp.json();
    if (data.contenido) {
      cargarListaDesdeTexto('listaCalculos', data.contenido, () => {});
    }
  } catch {
    console.warn('No se pudo cargar el historial de cálculos.');
  }
}

/* ════════════════════════════════════════════════════
   MÓDULO CLIMA
   ════════════════════════════════════════════════════ */

/**
 * Maneja la consulta de clima:
 * 1. Valida el campo ciudad.
 * 2. Llama al módulo clima.js para generar datos simulados.
 * 3. Muestra el resultado en el DOM.
 * 4. Guarda en el servidor (/data/clima.txt).
 * 5. Agrega a la lista dinámica.
 */
async function manejarClima() {
  const ciudad = document.getElementById('ciudad').value;
  const res    = consultarClima(ciudad);

  if (res.error) {
    mostrarMensaje('msgClima', res.error, true);
    return;
  }

  document.getElementById('resultadoClima').innerHTML =
    `<strong>${res.ciudad}</strong>: ${res.temperatura}°C — ${res.estado}`;

  try {
    const resp = await fetch('/guardar-clima', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(res)
    });
    const data = await resp.json();

    if (data.ok) {
      agregarItemLista('listaClima', data.linea.trim(), () => {});
      mostrarMensaje('msgClima', '✓ Consulta guardada.', false);
    }
  } catch {
    mostrarMensaje('msgClima', 'Error al guardar.', true);
  }
}

/**
 * Borra todos los registros de clima del servidor y limpia el DOM.
 */
async function borrarTodoClima() {
  try {
    await fetch('/eliminar-clima', { method: 'DELETE' });
    vaciarLista('listaClima');
    document.getElementById('resultadoClima').textContent = '';
    mostrarMensaje('msgClima', 'Historial eliminado.', false);
  } catch {
    mostrarMensaje('msgClima', 'Error al eliminar.', true);
  }
}

/**
 * Descarga el archivo clima.txt desde el servidor al navegador.
 */
async function descargarClima() {
  try {
    const resp = await fetch('/leer-clima');
    const data = await resp.json();
    if (!data.contenido) {
      mostrarMensaje('msgClima', 'No hay datos para descargar.', true);
      return;
    }
    descargarTxt(data.contenido, 'clima.txt');
  } catch {
    mostrarMensaje('msgClima', 'Error al descargar.', true);
  }
}

/**
 * Carga el historial de clima al iniciar la página.
 */
async function cargarHistorialClima() {
  try {
    const resp = await fetch('/leer-clima');
    const data = await resp.json();
    if (data.contenido) {
      cargarListaDesdeTexto('listaClima', data.contenido, () => {});
    }
  } catch {
    console.warn('No se pudo cargar el historial de clima.');
  }
}