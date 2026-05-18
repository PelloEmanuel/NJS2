/**
 * server.js — Proyecto 2
 * Demuestra el uso del módulo HTTP nativo de Node.js
 * y el módulo File System (fs) para:
 * - Crear archivos HTML dinámicamente en /data
 * - Servir esos archivos en el navegador
 * - Listar, leer y eliminar archivos .html creados
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;

app.use(express.json());

// Rutas estáticas para servir assets del proyecto
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/style', express.static(path.join(__dirname, 'style')));
app.use('/modules', express.static(path.join(__dirname, 'modules')));

// Carpeta donde se guardan los archivos HTML generados dinámicamente
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

/**
 * GET /
 * Página principal del proyecto
 */
app.get('/', (req, res) => {
  res.redirect('/pages/index.html');
});

/**
 * POST /crear-html
 * Crea un archivo .html en /data con el contenido generado dinámicamente.
 * Body: { nombre: string, titulo: string, contenido: string }
 * - nombre: nombre del archivo (sin extensión)
 * - titulo: <title> y <h1> del HTML generado
 * - contenido: texto que aparecerá en el cuerpo del HTML
 */
app.post('/crear-html', (req, res) => {
  const { nombre, titulo, contenido } = req.body;

  // Validar campos obligatorios
  if (!nombre || !titulo || !contenido) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  // Sanitizar el nombre: solo letras, números y guiones
  const nombreLimpio = nombre.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
  if (!nombreLimpio) {
    return res.status(400).json({ error: 'Nombre de archivo inválido.' });
  }

  const nombreArchivo = `${nombreLimpio}.html`;
  const filePath = path.join(dataDir, nombreArchivo);

  // No sobreescribir si ya existe
  if (fs.existsSync(filePath)) {
    return res.status(409).json({ error: `El archivo "${nombreArchivo}" ya existe.` });
  }

  /**
   * Plantilla HTML generada dinámicamente con fs.writeFile.
   * Incluye Bootstrap CDN para que se vea bien al abrirse.
   */
  const htmlGenerado = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titulo}</title>
  <link rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />
  <style>
    body { background: #f8f9fa; padding: 2rem; }
    .generado-info { color: #6c757d; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card shadow-sm mt-4">
      <div class="card-header bg-primary text-white">
        <h1 class="h4 mb-0">${titulo}</h1>
      </div>
      <div class="card-body">
        <p>${contenido}</p>
        <p class="generado-info">
          Archivo generado con Node.js (módulo fs) el ${new Date().toLocaleString()}
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  // Escribir el archivo HTML en /data usando fs
  fs.writeFile(filePath, htmlGenerado, 'utf8', (err) => {
    if (err) return res.status(500).json({ error: 'Error al crear el archivo.' });
    res.json({ ok: true, archivo: nombreArchivo });
  });
});

/**
 * GET /listar-html
 * Devuelve la lista de archivos .html en /data
 */
app.get('/listar-html', (req, res) => {
  fs.readdir(dataDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Error al leer directorio.' });
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    res.json({ archivos: htmlFiles });
  });
});

/**
 * GET /ver-html/:nombre
 * Sirve directamente el archivo HTML generado en /data
 * Esto demuestra el uso de fs.readFile + res.send para "mostrar HTML en el navegador"
 */
app.get('/ver-html/:nombre', (req, res) => {
  const nombreArchivo = req.params.nombre.replace(/[^a-zA-Z0-9-_.]/g, '');
  const filePath = path.join(dataDir, nombreArchivo);

  if (!filePath.startsWith(dataDir)) {
    return res.status(400).send('Ruta inválida.');
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('<h2>Archivo no encontrado.</h2>');
  }

  // Leer el archivo con fs y enviarlo como respuesta HTML
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error al leer el archivo.');
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
});

/**
 * DELETE /eliminar-html/:nombre
 * Elimina un archivo .html de /data usando fs.unlink
 */
app.delete('/eliminar-html/:nombre', (req, res) => {
  const nombreArchivo = req.params.nombre.replace(/[^a-zA-Z0-9-_.]/g, '');
  const filePath = path.join(dataDir, nombreArchivo);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado.' });
  }

  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar.' });
    res.json({ ok: true });
  });
});

/**
 * GET /contenido-html/:nombre
 * Devuelve el contenido de un archivo .html como texto para editarlo
 */
app.get('/contenido-html/:nombre', (req, res) => {
  const nombreArchivo = req.params.nombre.replace(/[^a-zA-Z0-9-_.]/g, '');
  const filePath = path.join(dataDir, nombreArchivo);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'No encontrado.' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error de lectura.' });
    res.json({ contenido: data });
  });
});

app.listen(PORT, () => {
  console.log(`Proyecto 2 en http://localhost:${PORT}`);
});