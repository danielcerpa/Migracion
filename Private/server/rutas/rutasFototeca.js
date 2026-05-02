const express = require('express');
const router = express.Router();
const fototecaControlador = require('../controladores/fototecaControlador');

router.get('/', fototecaControlador.getAll);
router.get('/:id', fototecaControlador.getById);
router.post('/', fototecaControlador.create);
router.put('/:id', fototecaControlador.update);
router.delete('/:id', fototecaControlador.delete);

module.exports = router;
