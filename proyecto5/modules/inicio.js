/**
 * inicio.js — Proyecto 5
 * Inicializa el menú y el tema en la página de inicio.
 */
import { generarMenu, iniciarTema } from './menu.js';

document.addEventListener('DOMContentLoaded', () => {
  generarMenu();
  iniciarTema();
});