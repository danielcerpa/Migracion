// ============================================================
// rutasPerfil.js — Rutas de perfiles
// ============================================================
// Define los endpoints para consultar perfiles del sistema.
// Todas estas rutas se montan bajo el prefijo /api/profiles
// en index.js.
// ============================================================

const express = require('express');
const router = express.Router();
const perfilControlador = require('../controladores/perfilControlador');

// GET /api/profiles → Devuelve la lista completa de perfiles registrados
router.get('/', perfilControlador.getProfiles);

// POST /api/profiles → Crea un nuevo perfil
router.post('/', perfilControlador.createProfile);

// PUT /api/profiles/:id → Actualiza un perfil existente
router.put('/:id', perfilControlador.updateProfile);

// DELETE /api/profiles/:id → Elimina un perfil
router.delete('/:id', perfilControlador.deleteProfile);

module.exports = router;
