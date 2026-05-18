/**
 * server.js - Servidor principal del Proyecto 1
 * Utiliza Express para servir las páginas HTML y manejar
 * rutas internas para guardar/leer datos con fs.
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = 3001;

app.use(express.json());
app.use('/pages',   express.static(path.join(__dirname, 'pages')));
app.use('/style',   express.static(path.join(__dirname, 'style')));
app.use('/modules', express.static(path.join(__dirname, 'modules')));

/* Crear carpeta /data si no existe */
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

/* ── Página principal ─────────────────────────────── */
app.get('/', (req, res) => {
  res.redirect('/pages/index.html');
});

/* ════════════════════════════════════════════════════
   MÓDULO CÁLCULO
   ════════════════════════════════════════════════════ */

/**
 * POST /guardar-calculo
 * Recibe un resultado y lo persiste en /data/calculos.txt
 * Body: { operacion: string, resultado: number }
 */
app.post('/guardar-calculo', (req, res) => {
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
 * GET /leer-calculos
 * Devuelve el contenido de /data/calculos.txt
 */
app.get('/leer-calculos', (req, res) => {
  const fp = path.join(dataDir, 'calculos.txt');
  if (!fs.existsSync(fp)) return res.json({ contenido: '' });
  fs.readFile(fp, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ contenido: data });
  });
});

/**
 * DELETE /eliminar-calculos
 * Vacía el archivo /data/calculos.txt
 */
app.delete('/eliminar-calculos', (req, res) => {
  fs.writeFile(path.join(dataDir, 'calculos.txt'), '', err => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ ok: true });
  });
});

/* ════════════════════════════════════════════════════
   MÓDULO CLIMA
   ════════════════════════════════════════════════════ */

/**
 * POST /guardar-clima
 * Persiste una consulta de clima en /data/clima.txt
 * Body: { ciudad: string, temperatura: number, estado: string }
 */
app.post('/guardar-clima', (req, res) => {
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
 * GET /leer-clima
 * Devuelve el contenido de /data/clima.txt
 */
app.get('/leer-clima', (req, res) => {
  const fp = path.join(dataDir, 'clima.txt');
  if (!fs.existsSync(fp)) return res.json({ contenido: '' });
  fs.readFile(fp, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ contenido: data });
  });
});

/**
 * DELETE /eliminar-clima
 * Vacía el archivo /data/clima.txt
 */
app.delete('/eliminar-clima', (req, res) => {
  fs.writeFile(path.join(dataDir, 'clima.txt'), '', err => {
    if (err) return res.status(500).json({ error: 'Error.' });
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Proyecto 1 corriendo en http://localhost:${PORT}`);
});