// ============================================================
// rutasUsuario.js — Rutas de usuarios
// ============================================================
// Define los endpoints para consultar usuarios del sistema.
// Todas estas rutas se montan bajo el prefijo /api/users
// en index.js.
// ============================================================

const express = require('express');
const router = express.Router();
const usuarioControlador = require('../controladores/usuarioControlador');

// GET /api/users → Devuelve la lista completa de usuarios registrados
router.get('/', usuarioControlador.getUsers);

// POST /api/users
router.post('/', usuarioControlador.createUser);

// PUT /api/users/:id
router.put('/:id', usuarioControlador.updateUser);

// DELETE /api/users/:id
router.delete('/:id', usuarioControlador.deleteUser);

module.exports = router;
