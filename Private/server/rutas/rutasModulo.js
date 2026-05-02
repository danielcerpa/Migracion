// ============================================================
// rutasModulo.js — Rutas de módulos del sistema
// ============================================================
// Define los endpoints para consultar los módulos disponibles.
// Todas estas rutas se montan bajo el prefijo /api/modules
// en index.js.
// ============================================================

const express = require('express');
const router = express.Router();
const moduloControlador = require('../controladores/moduloControlador');

// GET /api/modules/all → Devuelve todos los módulos activos (para los formularios)
router.get('/all', moduloControlador.getAllModules);

// GET /api/modules?userId=X → Devuelve los módulos activos a los que el usuario tiene acceso
router.get('/', moduloControlador.getModules);

module.exports = router;
