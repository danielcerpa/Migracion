const express = require('express');
const router = express.Router();
const controladorEspecimen = require('../controladores/especimenControlador');


// Listar especímenes
router.get('/', controladorEspecimen.getEspecimenes);

// Crear espécimen
router.post('/', controladorEspecimen.createEspecimen);

// Obtener un espécimen por ID
router.get('/:id', controladorEspecimen.getEspecimenById);

// Actualizar espécimen
router.put('/:id', controladorEspecimen.updateEspecimen);

// Eliminar (cambiar status)
router.delete('/:id', controladorEspecimen.deleteEspecimen);

module.exports = router;
