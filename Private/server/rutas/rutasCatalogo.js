// ============================================================
// rutasCatalogo.js — Rutas del módulo Catálogos
// ============================================================
// Monta CRUD para las 7 entidades bajo /api/catalogos/
//   /api/catalogos/paises
//   /api/catalogos/estados
//   /api/catalogos/ciudades
//   /api/catalogos/localidades
//   /api/catalogos/colectores
//   /api/catalogos/plantas
//   /api/catalogos/citas
// ============================================================

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controladores/catalogoControlador');

// Registra las 4 rutas CRUD para una entidad
const mount = (path, handler) => {
  router.get   (path,       handler.getAll);
  router.post  (path,       handler.create);
  router.put   (`${path}/:id`, handler.update);
  router.delete(`${path}/:id`, handler.delete);
};

mount('/paises',      ctrl.pais);
mount('/estados',     ctrl.estado);
mount('/municipios',  ctrl.municipio);
mount('/localidades', ctrl.localidad);

// Taxonomía
mount('/ordenes',     ctrl.orden);
mount('/familias',    ctrl.familia);
mount('/subfamilias', ctrl.subfamilia);
mount('/tribus',      ctrl.tribu);
mount('/generos',     ctrl.genero);
mount('/especies',    ctrl.especie);
mount('/tipos',       ctrl.tipo);

// Personas
mount('/colectores',    ctrl.colector);
mount('/determinadores', ctrl.determinador);

// Bio / Biblio
mount('/plantas',     ctrl.planta);
mount('/organismos',  ctrl.organismo);
mount('/colecciones', ctrl.coleccion);
mount('/citas',       ctrl.cita);
mount('/taxonomia',   ctrl.taxonomia);

module.exports = router;
