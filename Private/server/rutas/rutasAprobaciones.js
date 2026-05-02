const express = require('express');
const router = express.Router();
const AprobacionControlador = require('../controladores/aprobacionControlador');

// Obtener todas las pendientes
router.get('/pendientes', AprobacionControlador.getPendientes);

// Acciones sobre una solicitud
router.post('/:idSolicitud/aprobar', AprobacionControlador.aprobar);
router.post('/:idSolicitud/rechazar', AprobacionControlador.rechazar);
router.post('/:idSolicitud/regresar', AprobacionControlador.regresar);

module.exports = router;
