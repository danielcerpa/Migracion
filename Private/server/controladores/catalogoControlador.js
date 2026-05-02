// ============================================================
// catalogoControlador.js — Controlador del módulo Catálogos
// ============================================================
// CRUD para las 7 entidades: País, Estado, Ciudad, Localidad,
// Colector, Planta, Cita Bibliográfica.
// ============================================================

const CatalogoModelo = require('../modelos/catalogoModelo');

// Fábrica de controladores genérico para reducir código repetido
const crud = (getAll, create, update, remove) => ({
  async getAll(req, res) {
    try { res.json(await getAll()); }
    catch (e) { res.status(500).json({ error: e.message }); }
  },
  async create(req, res) {
    try { res.status(201).json(await create(req.body)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  },
  async update(req, res) {
    try { res.json(await update(req.params.id, req.body)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  },
  async delete(req, res) {
    try { res.json(await remove(req.params.id)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  },
});

const CatalogoControlador = {
  // Geografía
  pais:      crud(CatalogoModelo.getAllPaises,      CatalogoModelo.createPais,      CatalogoModelo.updatePais,      CatalogoModelo.deletePais),
  estado:    crud(CatalogoModelo.getAllEstados,     CatalogoModelo.createEstado,    CatalogoModelo.updateEstado,    CatalogoModelo.deleteEstado),
  municipio: crud(CatalogoModelo.getAllMunicipios,  CatalogoModelo.createMunicipio, CatalogoModelo.updateMunicipio, CatalogoModelo.deleteMunicipio),
  localidad: crud(CatalogoModelo.getAllLocalidades, CatalogoModelo.createLocalidad, CatalogoModelo.updateLocalidad, CatalogoModelo.deleteLocalidad),
  
  // Taxonomía
  orden:      crud(CatalogoModelo.getAllOrdenes,     CatalogoModelo.createOrden,     CatalogoModelo.updateOrden,     CatalogoModelo.deleteOrden),
  familia:    crud(CatalogoModelo.getAllFamilias,    CatalogoModelo.createFamilia,   CatalogoModelo.updateFamilia,   CatalogoModelo.deleteFamilia),
  subfamilia: crud(CatalogoModelo.getAllSubfamilias, CatalogoModelo.createSubfamilia, CatalogoModelo.updateSubfamilia, CatalogoModelo.deleteSubfamilia),
  tribu:      crud(CatalogoModelo.getAllTribus,      CatalogoModelo.createTribu,      CatalogoModelo.updateTribu,      CatalogoModelo.deleteTribu),
  genero:     crud(CatalogoModelo.getAllGeneros,     CatalogoModelo.createGenero,     CatalogoModelo.updateGenero,     CatalogoModelo.deleteGenero),
  especie:    crud(CatalogoModelo.getAllEspecies,    CatalogoModelo.createEspecie,    CatalogoModelo.updateEspecie,    CatalogoModelo.deleteEspecie),
  tipo:       crud(CatalogoModelo.getAllTipos,       CatalogoModelo.createTipo,       CatalogoModelo.updateTipo,       CatalogoModelo.deleteTipo),

  // Personas
  colector:     crud(CatalogoModelo.getAllColectores,     CatalogoModelo.createColector,     CatalogoModelo.updateColector,     CatalogoModelo.deleteColector),
  determinador: crud(CatalogoModelo.getAllDeterminadores, CatalogoModelo.createDeterminador, CatalogoModelo.updateDeterminador, CatalogoModelo.deleteDeterminador),

  // Bio / Biblio
  planta:    crud(CatalogoModelo.getAllPlantas,     CatalogoModelo.createPlanta,    CatalogoModelo.updatePlanta,    CatalogoModelo.deletePlanta),
  organismo: crud(CatalogoModelo.getAllOrganismos,    CatalogoModelo.createOrganismo,   CatalogoModelo.updateOrganismo,   CatalogoModelo.deleteOrganismo),
  coleccion: crud(CatalogoModelo.getAllColecciones,   CatalogoModelo.createColeccion,   CatalogoModelo.updateColeccion,   CatalogoModelo.deleteColeccion),
  cita:      crud(CatalogoModelo.getAllCitas,       CatalogoModelo.createCita,      CatalogoModelo.updateCita,      CatalogoModelo.deleteCita),
  taxonomia: crud(CatalogoModelo.getAllTaxonomia,   CatalogoModelo.createTaxonomia,  CatalogoModelo.updateTaxonomia,  CatalogoModelo.deleteTaxonomia),
};

module.exports = CatalogoControlador;

