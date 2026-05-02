// ============================================================
// rutasAuth.js — Rutas de autenticación
// ============================================================
// Define los endpoints relacionados al login de usuarios.
// Todas estas rutas se montan bajo el prefijo /api/login
// en index.js.
// ============================================================

const express = require('express');
const router = express.Router();
const authControlador = require('../controladores/authControlador');

// POST /api/login → Recibe email y password, valida credenciales y devuelve los datos del usuario
router.post('/', authControlador.login);

module.exports = router;