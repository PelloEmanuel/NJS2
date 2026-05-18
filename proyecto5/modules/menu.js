/**
 * menu.js — Proyecto 5
 * Módulo del menú de navegación.
 * Genera el navbar dinámicamente usando createElement (no innerHTML)
 * para evitar que el texto se muestre como código en pantalla.
 * Se importa en cada página del sitio.
 */

/** Definición de los ítems del menú de navegación */
const MENU_ITEMS = [
  { texto: 'Inicio',      url: '/pages/inicio.html',      icono: '🏠' },
  { texto: 'Calculadora', url: '/pages/calculadora.html',  icono: '🧮' },
  { texto: 'Clima',       url: '/pages/clima.html',        icono: '🌤' },
  { texto: 'Archivos',    url: '/pages/archivos.html',     icono: '📄' },
  { texto: 'Módulo URL',  url: '/pages/url.html',          icono: '🔗' },
  { texto: 'NPM / Texto', url: '/pages/transformar.html',  icono: '📦' },
];

/**
 * Genera e inyecta el navbar Bootstrap en el elemento #menu-container.
 * Usa createElement para cada nodo, evitando inyección de HTML crudo
 * que genera texto visible en pantalla.
 * Detecta la página activa comparando la URL actual con cada enlace.
 */
export function generarMenu() {
  const contenedor = document.getElementById('menu-container');
  if (!contenedor) return;

  const paginaActual = window.location.pathname;

  /* ── <nav> raíz ─────────────────────────────────── */
  const nav = document.createElement('nav');
  nav.className = 'navbar navbar-expand-lg';
  nav.id = 'navbar';

  /* ── Brand ──────────────────────────────────────── */
  const brand = document.createElement('a');
  brand.className = 'navbar-brand fw-bold';
  brand.href = '/pages/inicio.html';
  brand.textContent = '🌐 MiSitio';

  /* ── Botón hamburguesa (mobile) ─────────────────── */
  const toggler = document.createElement('button');
  toggler.className = 'navbar-toggler';
  toggler.type = 'button';
  toggler.setAttribute('data-bs-toggle', 'collapse');
  toggler.setAttribute('data-bs-target', '#menuNav');
  toggler.setAttribute('aria-controls', 'menuNav');
  toggler.setAttribute('aria-expanded', 'false');
  toggler.setAttribute('aria-label', 'Abrir menú');

  const togglerIcon = document.createElement('span');
  togglerIcon.className = 'navbar-toggler-icon';
  toggler.appendChild(togglerIcon);

  /* ── Contenedor colapsable ──────────────────────── */
  const collapseDiv = document.createElement('div');
  collapseDiv.className = 'collapse navbar-collapse';
  collapseDiv.id = 'menuNav';

  /* ── Lista de links ─────────────────────────────── */
  const ul = document.createElement('ul');
  ul.className = 'navbar-nav me-auto mb-2 mb-lg-0';

  MENU_ITEMS.forEach(item => {
    const li = document.createElement('li');
    li.className = 'nav-item';

    const a = document.createElement('a');

    /* Determinar si este ítem es la página activa */
    const esActivo =
      paginaActual === item.url ||
      paginaActual.endsWith(item.url.split('/').pop());

    a.className = 'nav-link' + (esActivo ? ' active fw-semibold' : '');
    a.href = item.url;
    a.textContent = item.icono + ' ' + item.texto;

    li.appendChild(a);
    ul.appendChild(li);
  });

  /* ── Botón tema ─────────────────────────────────── */
  const btnTema = document.createElement('button');
  btnTema.className = 'btn btn-sm ms-2';
  btnTema.id = 'btnTema';
  btnTema.textContent = '🌙 Oscuro';

  /* ── Armado final ───────────────────────────────── */
  const containerFluid = document.createElement('div');
  containerFluid.className = 'container-fluid';

  collapseDiv.appendChild(ul);
  collapseDiv.appendChild(btnTema);

  containerFluid.appendChild(brand);
  containerFluid.appendChild(toggler);
  containerFluid.appendChild(collapseDiv);

  nav.appendChild(containerFluid);
  contenedor.appendChild(nav);
}

/**
 * Inicializa el toggle de tema claro/oscuro.
 * Mantiene el estado en una variable de módulo (sin localStorage).
 * @param {function} [callback] - Función opcional ejecutada al cambiar tema
 */
export function iniciarTema(callback) {
  let modoOscuro = false;

  /**
   * Aplica el tema actual al <html> y actualiza el texto del botón.
   */
  function aplicar() {
    document.documentElement.setAttribute(
      'data-tema',
      modoOscuro ? 'oscuro' : 'claro'
    );
    const btn = document.getElementById('btnTema');
    if (btn) btn.textContent = modoOscuro ? '☀️ Claro' : '🌙 Oscuro';
    if (typeof callback === 'function') callback(modoOscuro);
  }

  /**
   * El botón se crea dinámicamente por generarMenu().
   * Usamos un pequeño timeout para asegurar que el DOM
   * ya tiene el botón antes de agregar el listener.
   */
  setTimeout(() => {
    const btn = document.getElementById('btnTema');
    if (btn) {
      /**
       * Evento click en el botón de tema:
       * Alterna entre modo claro y oscuro sin recargar la página.
       */
      btn.addEventListener('click', () => {
        modoOscuro = !modoOscuro;
        aplicar();
      });
    }
    aplicar();
  }, 0);
}