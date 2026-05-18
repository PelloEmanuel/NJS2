/**
 * server.js — Proyecto 4
 * Demuestra el uso del gestor de paquetes NPM instalando
 * y usando módulos de terceros como upper-case, lower-case y title-case.
 * También usa fs para persistir transformaciones.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { upperCase } from 'upper-case';
import { lowerCase } from 'lower-case';
import { titleCase } from 'title-case';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3004;

app.use(express.json());
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/style', express.static(path.join(__dirname, 'style')));
app.use('/modules', express.static(path.join(__dirname, 'modules')));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

app.get('/', (req, res) => res.redirect('/pages/index.html'));

/**
 * POST /transformar
 * Aplica una transformación de texto usando un paquete NPM instalado.
 * Body: { texto: string, transformacion: 'upper' | 'lower' | 'title' }
 * Retorna el texto transformado y lo guarda en /data/transformaciones.txt
 */
app.post('/transformar', (req, res) => {
  const { texto, transformacion } = req.body;

  if (!texto || !transformacion) {
    return res.status(400).json({ error: 'Texto y transformación son obligatorios.' });
  }

  let resultado;
  let paqueteUsado;

  // Aplicar la transformación con el paquete NPM correspondiente
  switch (transformacion) {
    case 'upper':
      resultado = upperCase(texto);
      paqueteUsado = 'upper-case';
      break;
    case 'lower':
      resultado = lowerCase(texto);
      paqueteUsado = 'lower-case';
      break;
    case 'title':
      resultado = titleCase(texto);
      paqueteUsado = 'title-case';
      break;
    default:
      return res.status(400).json({ error: 'Transformación no válida.' });
  }

  const id = Date.now().toString();
  const linea = `[${id}] [${paqueteUsado}] "${texto}" → "${resultado}"\n`;

  // Guardar en /data/transformaciones.txt
  fs.appendFile(path.join(dataDir, 'transformaciones.txt'), linea, () => {});

  res.json({ ok: true, resultado, paqueteUsado, id, linea: linea.trim() });
});

/**
 * GET /leer-transformaciones
 * Devuelve el contenido de /data/transformaciones.txt
 */
app.get('/leer-transformaciones', (req, res) => {
  const filePath = path.join(dataDir, 'transformaciones.txt');
  if (!fs.existsSync(filePath)) return res.json({ contenido: '' });
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error de lectura.' });
    res.json({ contenido: data });
  });
});

/**
 * DELETE /eliminar-transformacion/:id
 * Elimina una línea específica del archivo .txt por su ID de timestamp.
 * Lee el archivo, filtra la línea con el ID dado y reescribe el archivo.
 */
app.delete('/eliminar-transformacion/:id', (req, res) => {
  const id = req.params.id;
  const filePath = path.join(dataDir, 'transformaciones.txt');

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado.' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error de lectura.' });

    // Filtrar la línea que contiene el ID
    const lineas = data.split('\n').filter(l => !l.startsWith(`[${id}]`));
    const nuevoContenido = lineas.join('\n');

    fs.writeFile(filePath, nuevoContenido, 'utf8', writeErr => {
      if (writeErr) return res.status(500).json({ error: 'Error al escribir.' });
      res.json({ ok: true });
    });
  });
});

/**
 * DELETE /limpiar-transformaciones
 * Vacía el archivo de transformaciones.
 */
app.delete('/limpiar-transformaciones', (req, res) => {
  fs.writeFile(path.join(dataDir, 'transformaciones.txt'), '', err => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Proyecto 4 en http://localhost:${PORT}`);
  console.log('Paquetes NPM usados: upper-case, lower-case, title-case');
});