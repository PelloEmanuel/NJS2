/**
 * server.js — Proyecto 5
 * Servidor principal del sitio web.
 * Integra TODAS las funcionalidades de los proyectos 1 a 4:
 * - Módulos propios: cálculo y clima (Proyecto 1)
 * - HTTP + File System: crear/servir HTML dinámico (Proyecto 2)
 * - Módulo URL: parseo de URLs (Proyecto 3)
 * - NPM upper-case/lower-case/title-case (Proyecto 4)
 * Sirve 6 páginas distintas con un menú de navegación modular.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3005;

app.use(express.json());
app.use('/pages',   express.static(path.join(__dirname, 'pages')));
app.use('/style',   express.static(path.join(__dirname, 'style')));
app.use('/modules', express.static(path.join(__dirname, 'modules')));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

/* ════════════════════════════════════════════════════
   RUTAS DE PÁGINAS
   ════════════════════════════════════════════════════ */

app.get('/', (req, res) => res.redirect('/pages/inicio.html'));

/* ════════════════════════════════════════════════════
   PROYECTO 1 — MÓDULO CÁLCULO
   ════════════════════════════════════════════════════ */

/**
 * POST /api/guardar-calculo
 * Persiste un cálculo en /data/calculos.txt
 * Body: { operacion: string, resultado: number }
 */
app.post('/api/guardar-calculo', (req, res) => {
  const { operacion, resultado } = req.body;
  if (!operacion || resultado === undefined) {
    return res.status(400).json({ error: 'Datos incompletos.' });
  }
  const linea = `[${new Date().toLocaleString()}] ${operacion} = ${resultado}\n`;
  fs.appendFile(path.join(dataDir, 'calculos.txt'), linea, err => {
    if (err) return res.status(500).json({ error: 'Error al guardar.' });
    res.json({ ok: true, linea });
  });
});

/**
 * GET /api/leer-calculos
 * Devuelve el contenido de /data/calculos.txt
 */
app.get('/api/leer-calculos', (req, res) => {
  const fp = path.join(dataDir, 'calculos.txt');
  if (!fs.existsSync(fp)) return res.json({ contenido: '' });
  fs.readFile(fp, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ contenido: data });
  });
});

/**
 * DELETE /api/eliminar-calculos
 * Vacía /data/calculos.txt
 */
app.delete('/api/eliminar-calculos', (req, res) => {
  fs.writeFile(path.join(dataDir, 'calculos.txt'), '', err => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ ok: true });
  });
});

/* ════════════════════════════════════════════════════
   PROYECTO 1 — MÓDULO CLIMA
   ════════════════════════════════════════════════════ */

/**
 * POST /api/guardar-clima
 * Persiste una consulta de clima en /data/clima.txt
 * Body: { ciudad: string, temperatura: number, estado: string }
 */
app.post('/api/guardar-clima', (req, res) => {
  const { ciudad, temperatura, estado } = req.body;
  if (!ciudad || temperatura === undefined || !estado) {
    return res.status(400).json({ error: 'Datos incompletos.' });
  }
  const linea = `[${new Date().toLocaleString()}] ${ciudad}: ${temperatura}°C - ${estado}\n`;
  fs.appendFile(path.join(dataDir, 'clima.txt'), linea, err => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ ok: true, linea });
  });
});

/**
 * GET /api/leer-clima
 */
app.get('/api/leer-clima', (req, res) => {
  const fp = path.join(dataDir, 'clima.txt');
  if (!fs.existsSync(fp)) return res.json({ contenido: '' });
  fs.readFile(fp, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ contenido: data });
  });
});

/**
 * DELETE /api/eliminar-clima
 */
app.delete('/api/eliminar-clima', (req, res) => {
  fs.writeFile(path.join(dataDir, 'clima.txt'), '', err => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ ok: true });
  });
});

/* ════════════════════════════════════════════════════
   PROYECTO 2 — HTTP + FILE SYSTEM (crear/servir HTML)
   ════════════════════════════════════════════════════ */

/**
 * POST /api/crear-html
 * Crea un archivo .html en /data usando fs.writeFile
 * Body: { nombre: string, titulo: string, contenido: string }
 */
app.post('/api/crear-html', (req, res) => {
  const { nombre, titulo, contenido } = req.body;
  if (!nombre || !titulo || !contenido) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const nombreLimpio = nombre.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
  if (!nombreLimpio) {
    return res.status(400).json({ error: 'Nombre de archivo inválido.' });
  }

  const nombreArchivo = `${nombreLimpio}.html`;
  const filePath = path.join(dataDir, nombreArchivo);

  if (fs.existsSync(filePath)) {
    return res.status(409).json({ error: `El archivo "${nombreArchivo}" ya existe.` });
  }

  const htmlGenerado = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titulo}</title>
  <link rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
  <style>body { background:#f8f9fa; padding:2rem; }</style>
</head>
<body>
  <div class="container">
    <div class="card shadow-sm mt-4">
      <div class="card-header bg-primary text-white">
        <h1 class="h4 mb-0">${titulo}</h1>
      </div>
      <div class="card-body">
        <p>${contenido}</p>
        <p class="text-muted" style="font-size:.85rem">
          Generado con Node.js (módulo fs) el ${new Date().toLocaleString()}
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFile(filePath, htmlGenerado, 'utf8', err => {
    if (err) return res.status(500).json({ error: 'Error al crear el archivo.' });
    res.json({ ok: true, archivo: nombreArchivo });
  });
});

/**
 * GET /api/listar-html
 * Lista los .html generados en /data
 */
app.get('/api/listar-html', (req, res) => {
  fs.readdir(dataDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ archivos: files.filter(f => f.endsWith('.html')) });
  });
});

/**
 * GET /api/ver-html/:nombre
 * Sirve un archivo HTML generado directamente desde /data
 */
app.get('/api/ver-html/:nombre', (req, res) => {
  const nombre = req.params.nombre.replace(/[^a-zA-Z0-9-_.]/g, '');
  const fp = path.join(dataDir, nombre);
  if (!fs.existsSync(fp)) return res.status(404).send('<h2>No encontrado.</h2>');
  fs.readFile(fp, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error.');
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
});

/**
 * DELETE /api/eliminar-html/:nombre
 */
app.delete('/api/eliminar-html/:nombre', (req, res) => {
  const nombre = req.params.nombre.replace(/[^a-zA-Z0-9-_.]/g, '');
  const fp = path.join(dataDir, nombre);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'No encontrado.' });
  fs.unlink(fp, err => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ ok: true });
  });
});

/**
 * GET /api/contenido-html/:nombre
 * Devuelve el contenido crudo de un HTML para descargarlo
 */
app.get('/api/contenido-html/:nombre', (req, res) => {
  const nombre = req.params.nombre.replace(/[^a-zA-Z0-9-_.]/g, '');
  const fp = path.join(dataDir, nombre);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'No encontrado.' });
  fs.readFile(fp, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ contenido: data });
  });
});

/* ════════════════════════════════════════════════════
   PROYECTO 3 — MÓDULO URL
   ════════════════════════════════════════════════════ */

/**
 * POST /api/analizar-url
 * Parsea una URL con el módulo nativo URL de Node.js
 * Imprime los componentes por consola e imprime JSON al cliente.
 * Body: { urlTexto: string }
 */
app.post('/api/analizar-url', (req, res) => {
  const { urlTexto } = req.body;
  if (!urlTexto || !urlTexto.trim()) {
    return res.status(400).json({ error: 'La URL no puede estar vacía.' });
  }

  let parsed;
  try {
    parsed = new URL(urlTexto.trim());
  } catch {
    return res.status(400).json({ error: 'La URL ingresada no es válida.' });
  }

  const params = {};
  parsed.searchParams.forEach((v, k) => { params[k] = v; });

  const componentes = {
    href:     parsed.href,
    protocol: parsed.protocol,
    host:     parsed.host,
    hostname: parsed.hostname,
    port:     parsed.port || '(por defecto)',
    pathname: parsed.pathname,
    search:   parsed.search || '(sin query)',
    hash:     parsed.hash   || '(sin hash)',
    origin:   parsed.origin,
    params
  };

  /* Mostrar por consola del servidor (requerimiento del enunciado) */
  console.log('\n══════ MÓDULO URL — Proyecto 5 ══════');
  console.log('  href     :', componentes.href);
  console.log('  protocol :', componentes.protocol);
  console.log('  host     :', componentes.host);
  console.log('  pathname :', componentes.pathname);
  console.log('  search   :', componentes.search);
  console.log('  params   :', params);
  console.log('═════════════════════════════════════\n');

  const linea = `[${new Date().toLocaleString()}] ${componentes.href} | host: ${componentes.host} | path: ${componentes.pathname}\n`;
  fs.appendFile(path.join(dataDir, 'urls.txt'), linea, () => {});

  res.json({ ok: true, componentes });
});

/**
 * GET /api/historial-urls
 */
app.get('/api/historial-urls', (req, res) => {
  const fp = path.join(dataDir, 'urls.txt');
  if (!fs.existsSync(fp)) return res.json({ contenido: '' });
  fs.readFile(fp, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ contenido: data });
  });
});

/**
 * DELETE /api/limpiar-urls
 */
app.delete('/api/limpiar-urls', (req, res) => {
  fs.writeFile(path.join(dataDir, 'urls.txt'), '', err => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ ok: true });
  });
});

/* ════════════════════════════════════════════════════
   PROYECTO 4 — NPM (upper-case / lower-case / title-case)
   Nota: los paquetes NPM se aplican en el servidor.
   Si no están instalados, hacer: npm install upper-case lower-case title-case
   ════════════════════════════════════════════════════ */

/**
 * POST /api/transformar
 * Aplica una transformación de texto usando paquetes NPM instalados.
 * Body: { texto: string, transformacion: 'upper'|'lower'|'title' }
 *
 * Importación dinámica para no fallar si el paquete no está instalado.
 */
app.post('/api/transformar', async (req, res) => {
  const { texto, transformacion } = req.body;
  if (!texto || !transformacion) {
    return res.status(400).json({ error: 'Texto y transformación son obligatorios.' });
  }

  let resultado;
  let paqueteUsado;

  try {
    if (transformacion === 'upper') {
      const { upperCase } = await import('upper-case');
      resultado = upperCase(texto);
      paqueteUsado = 'upper-case';
    } else if (transformacion === 'lower') {
      const { lowerCase } = await import('lower-case');
      resultado = lowerCase(texto);
      paqueteUsado = 'lower-case';
    } else if (transformacion === 'title') {
      const { titleCase } = await import('title-case');
      resultado = titleCase(texto);
      paqueteUsado = 'title-case';
    } else {
      return res.status(400).json({ error: 'Transformación no válida.' });
    }
  } catch {
    return res.status(500).json({
      error: 'Paquete NPM no instalado. Ejecutá: npm install upper-case lower-case title-case'
    });
  }

  const id = Date.now().toString();
  const linea = `[${id}] [${paqueteUsado}] "${texto}" → "${resultado}"\n`;
  fs.appendFile(path.join(dataDir, 'transformaciones.txt'), linea, () => {});

  res.json({ ok: true, resultado, paqueteUsado, id, linea: linea.trim() });
});

/**
 * GET /api/leer-transformaciones
 */
app.get('/api/leer-transformaciones', (req, res) => {
  const fp = path.join(dataDir, 'transformaciones.txt');
  if (!fs.existsSync(fp)) return res.json({ contenido: '' });
  fs.readFile(fp, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ contenido: data });
  });
});

/**
 * DELETE /api/eliminar-transformacion/:id
 */
app.delete('/api/eliminar-transformacion/:id', (req, res) => {
  const { id } = req.params;
  const fp = path.join(dataDir, 'transformaciones.txt');
  if (!fs.existsSync(fp)) return res.json({ ok: true });
  fs.readFile(fp, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error.' });
    const lineas = data.split('\n').filter(l => !l.startsWith(`[${id}]`));
    fs.writeFile(fp, lineas.join('\n'), writeErr => {
      if (writeErr) return res.status(500).json({ error: 'Error.' });
      res.json({ ok: true });
    });
  });
});

/**
 * DELETE /api/limpiar-transformaciones
 */
app.delete('/api/limpiar-transformaciones', (req, res) => {
  fs.writeFile(path.join(dataDir, 'transformaciones.txt'), '', err => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`\nProyecto 5 corriendo en http://localhost:${PORT}`);
  console.log('Páginas disponibles:');
  console.log('  /pages/inicio.html       → Portada');
  console.log('  /pages/calculadora.html  → Proyecto 1: Cálculo');
  console.log('  /pages/clima.html        → Proyecto 1: Clima');
  console.log('  /pages/archivos.html     → Proyecto 2: HTTP + FS');
  console.log('  /pages/url.html          → Proyecto 3: Módulo URL');
  console.log('  /pages/transformar.html  → Proyecto 4: NPM\n');
});