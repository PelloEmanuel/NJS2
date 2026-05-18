/**
 * server.js — Proyecto 3
 * Utiliza el módulo nativo URL de Node.js para parsear URLs.
 * Expone una ruta que recibe una URL, la analiza y devuelve
 * sus componentes (host, pathname, params, etc.) como JSON.
 * También imprime en consola del servidor, demostrando el uso
 * del módulo URL tal como lo pide el enunciado.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3003;

app.use(express.json());
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/style', express.static(path.join(__dirname, 'style')));
app.use('/modules', express.static(path.join(__dirname, 'modules')));

// Asegurar carpeta /data
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

app.get('/', (req, res) => {
  res.redirect('/pages/index.html');
});

/**
 * POST /analizar-url
 * Recibe una URL en el body y la analiza con el módulo URL nativo.
 * Imprime los componentes en consola y los devuelve como JSON.
 * Body: { urlTexto: string }
 */
app.post('/analizar-url', (req, res) => {
  const { urlTexto } = req.body;

  if (!urlTexto || urlTexto.trim() === '') {
    return res.status(400).json({ error: 'La URL no puede estar vacía.' });
  }

  let parsed;

  // Intentar parsear con el módulo URL nativo de Node.js
  try {
    parsed = new URL(urlTexto.trim());
  } catch {
    return res.status(400).json({ error: 'La URL ingresada no es válida.' });
  }

  // Extraer todos los parámetros de búsqueda
  const params = {};
  parsed.searchParams.forEach((valor, clave) => {
    params[clave] = valor;
  });

  // Objeto con los componentes analizados
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

  /**
   * Mostrar por consola del servidor (requerimiento del enunciado):
   * "mostrar por consola: host, path, etc."
   */
  console.log('\n====== ANÁLISIS DE URL (módulo URL nativo) ======');
  console.log(`  href      : ${componentes.href}`);
  console.log(`  protocol  : ${componentes.protocol}`);
  console.log(`  host      : ${componentes.host}`);
  console.log(`  hostname  : ${componentes.hostname}`);
  console.log(`  port      : ${componentes.port}`);
  console.log(`  pathname  : ${componentes.pathname}`);
  console.log(`  search    : ${componentes.search}`);
  console.log(`  hash      : ${componentes.hash}`);
  console.log(`  origin    : ${componentes.origin}`);
  console.log('  params    :', params);
  console.log('=================================================\n');

  // Guardar el análisis en /data/urls.txt
  const linea = `[${new Date().toLocaleString()}] ${componentes.href} | host: ${componentes.host} | path: ${componentes.pathname}\n`;
  fs.appendFile(path.join(dataDir, 'urls.txt'), linea, () => {});

  res.json({ ok: true, componentes });
});

/**
 * GET /historial-urls
 * Devuelve el contenido de /data/urls.txt
 */
app.get('/historial-urls', (req, res) => {
  const filePath = path.join(dataDir, 'urls.txt');
  if (!fs.existsSync(filePath)) return res.json({ contenido: '' });
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error de lectura.' });
    res.json({ contenido: data });
  });
});

/**
 * DELETE /limpiar-historial
 * Vacía el archivo de historial de URLs
 */
app.delete('/limpiar-historial', (req, res) => {
  fs.writeFile(path.join(dataDir, 'urls.txt'), '', err => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Proyecto 3 en http://localhost:${PORT}`);
});