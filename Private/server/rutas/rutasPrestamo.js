const express = require('express');
const router = express.Router();
const prestamoControlador = require('../controladores/prestamoControlador');

router.get('/', prestamoControlador.getAll);
router.get('/:id', prestamoControlador.getById);
router.post('/', prestamoControlador.create);
router.put('/:id', prestamoControlador.update);
router.delete('/:id', prestamoControlador.delete);

module.exports = router;
