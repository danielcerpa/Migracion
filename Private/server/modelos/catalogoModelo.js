// ============================================================
// catalogoModelo.js — Modelo del módulo Catálogos
// ============================================================
// Consultas SQL mapeando fielmente a v2.sql:
// Categorías: Geografía, Taxonomía, Personas, Bio/Biblio
// ============================================================

const db = require('../configuracion/db');

class CatalogoModelo {

  // ── 1. GEOGRAFÍA ──────────────────────────────────────────
  static async getAllPaises()              { const [r] = await db.query('SELECT * FROM pais ORDER BY nombre'); return r; }
  static async createPais(data)           { const [r] = await db.query('INSERT INTO pais SET ?', [data]); return r; }
  static async updatePais(id, data)       { const [r] = await db.query('UPDATE pais SET ? WHERE idPais = ?', [data, id]); return r; }
  static async deletePais(id)             { const [r] = await db.query('UPDATE pais SET status = 0 WHERE idPais = ?', [id]); return r; }

  static async getAllEstados()            { const [r] = await db.query('SELECT e.*, p.nombre AS nombrePais FROM estado e LEFT JOIN pais p ON e.idPais = p.idPais ORDER BY e.nombre'); return r; }
  static async createEstado(data)         { const [r] = await db.query('INSERT INTO estado SET ?', [data]); return r; }
  static async updateEstado(id, data)     { const [r] = await db.query('UPDATE estado SET ? WHERE idEstado = ?', [data, id]); return r; }
  static async deleteEstado(id)           { const [r] = await db.query('UPDATE estado SET status = 0 WHERE idEstado = ?', [id]); return r; }

  static async getAllMunicipios()         { const [r] = await db.query('SELECT m.*, e.nombre AS nombreEstado FROM municipio m LEFT JOIN estado e ON m.idEstado = e.idEstado ORDER BY m.nombre'); return r; }
  static async createMunicipio(data)      { const [r] = await db.query('INSERT INTO municipio SET ?', [data]); return r; }
  static async updateMunicipio(id, data)  { const [r] = await db.query('UPDATE municipio SET ? WHERE idMunicipio = ?', [data, id]); return r; }
  static async deleteMunicipio(id)        { const [r] = await db.query('UPDATE municipio SET status = 0 WHERE idMunicipio = ?', [id]); return r; }

  static async getAllLocalidades()        { const [r] = await db.query('SELECT l.*, m.nombre AS nombreMunicipio FROM localidad l LEFT JOIN municipio m ON l.idMunicipio = m.idMunicipio ORDER BY l.nombre'); return r; }
  static async createLocalidad(data)      { const [r] = await db.query('INSERT INTO localidad SET ?', [data]); return r; }
  static async updateLocalidad(id, data)  { const [r] = await db.query('UPDATE localidad SET ? WHERE idLocalidad = ?', [data, id]); return r; }
  static async deleteLocalidad(id)        { const [r] = await db.query('UPDATE localidad SET status = 0 WHERE idLocalidad = ?', [id]); return r; }

  // ── 2. TAXONOMÍA ──────────────────────────────────────────
  static async getAllOrdenes()            { const [r] = await db.query('SELECT * FROM orden ORDER BY nombre'); return r; }
  static async createOrden(data)          { const [r] = await db.query('INSERT INTO orden SET ?', [data]); return r; }
  static async updateOrden(id, data)      { const [r] = await db.query('UPDATE orden SET ? WHERE idOrden = ?', [data, id]); return r; }
  static async deleteOrden(id)            { const [r] = await db.query('UPDATE orden SET status = 0 WHERE idOrden = ?', [id]); return r; }

  static async getAllFamilias()           { const [r] = await db.query('SELECT f.*, o.nombre AS nombreOrden FROM familia f LEFT JOIN orden o ON f.idOrden = o.idOrden ORDER BY f.nombre'); return r; }
  static async createFamilia(data)        { const [r] = await db.query('INSERT INTO familia SET ?', [data]); return r; }
  static async updateFamilia(id, data)    { const [r] = await db.query('UPDATE familia SET ? WHERE idFamilia = ?', [data, id]); return r; }
  static async deleteFamilia(id)          { const [r] = await db.query('UPDATE familia SET status = 0 WHERE idFamilia = ?', [id]); return r; }

  static async getAllSubfamilias()        { const [r] = await db.query('SELECT s.*, f.nombre AS nombreFamilia FROM subfamilia s LEFT JOIN familia f ON s.idFamilia = f.idFamilia ORDER BY s.nombre'); return r; }
  static async createSubfamilia(data)     { const [r] = await db.query('INSERT INTO subfamilia SET ?', [data]); return r; }
  static async updateSubfamilia(id, data) { const [r] = await db.query('UPDATE subfamilia SET ? WHERE idSubfamilia = ?', [data, id]); return r; }
  static async deleteSubfamilia(id)       { const [r] = await db.query('UPDATE subfamilia SET status = 0 WHERE idSubfamilia = ?', [id]); return r; }

  static async getAllTribus()              { const [r] = await db.query('SELECT t.*, s.nombre AS nombreSubfamilia FROM tribu t LEFT JOIN subfamilia s ON t.idSubfamilia = s.idSubfamilia ORDER BY t.nombre'); return r; }
  static async createTribu(data)           { const [r] = await db.query('INSERT INTO tribu SET ?', [data]); return r; }
  static async updateTribu(id, data)       { const [r] = await db.query('UPDATE tribu SET ? WHERE idTribu = ?', [data, id]); return r; }
  static async deleteTribu(id)             { const [r] = await db.query('UPDATE tribu SET status = 0 WHERE idTribu = ?', [id]); return r; }

  static async getAllGeneros()            { const [r] = await db.query('SELECT g.*, t.nombre AS nombreTribu FROM genero g LEFT JOIN tribu t ON g.idTribu = t.idTribu ORDER BY g.nombre'); return r; }
  static async createGenero(data)         { const [r] = await db.query('INSERT INTO genero SET ?', [data]); return r; }
  static async updateGenero(id, data)     { const [r] = await db.query('UPDATE genero SET ? WHERE idGenero = ?', [data, id]); return r; }
  static async deleteGenero(id)           { const [r] = await db.query('UPDATE genero SET status = 0 WHERE idGenero = ?', [id]); return r; }

  static async getAllEspecies()           { const [r] = await db.query('SELECT e.*, g.nombre AS nombreGenero FROM especie e LEFT JOIN genero g ON e.idGenero = g.idGenero ORDER BY e.nombre'); return r; }
  static async createEspecie(data)        { const [r] = await db.query('INSERT INTO especie SET ?', [data]); return r; }
  static async updateEspecie(id, data)    { const [r] = await db.query('UPDATE especie SET ? WHERE idEspecie = ?', [data, id]); return r; }
  static async deleteEspecie(id)          { const [r] = await db.query('UPDATE especie SET status = 0 WHERE idEspecie = ?', [id]); return r; }

  static async getAllTipos()              { const [r] = await db.query('SELECT * FROM tipo ORDER BY nombre'); return r; }
  static async createTipo(data)           { const [r] = await db.query('INSERT INTO tipo SET ?', [data]); return r; }
  static async updateTipo(id, data)       { const [r] = await db.query('UPDATE tipo SET ? WHERE idTipo = ?', [data, id]); return r; }
  static async deleteTipo(id)             { const [r] = await db.query('UPDATE tipo SET status = 0 WHERE idTipo = ?', [id]); return r; }

  // ── 3. PERSONAS ───────────────────────────────────────────
  static async getAllColectores()         { const [r] = await db.query('SELECT * FROM colector ORDER BY nombre'); return r; }
  static async createColector(data)       { const [r] = await db.query('INSERT INTO colector SET ?', [data]); return r; }
  static async updateColector(id, data)   { const [r] = await db.query('UPDATE colector SET ? WHERE idColector = ?', [data, id]); return r; }
  static async deleteColector(id)         { const [r] = await db.query('UPDATE colector SET status = 0 WHERE idColector = ?', [id]); return r; }

  static async getAllDeterminadores()     { const [r] = await db.query('SELECT * FROM determinador ORDER BY nombre'); return r; }
  static async createDeterminador(data)   { const [r] = await db.query('INSERT INTO determinador SET ?', [data]); return r; }
  static async updateDeterminador(id, data) { const [r] = await db.query('UPDATE determinador SET ? WHERE idDeterminador = ?', [data, id]); return r; }
  static async deleteDeterminador(id)     { const [r] = await db.query('UPDATE determinador SET status = 0 WHERE idDeterminador = ?', [id]); return r; }

  // ── 4. BIO / BIBLIO ───────────────────────────────────────
  static async getAllPlantas()            { const [r] = await db.query('SELECT * FROM planta_hospedera ORDER BY nombre_cientifico'); return r; }
  static async createPlanta(data)         { const [r] = await db.query('INSERT INTO planta_hospedera SET ?', [data]); return r; }
  static async updatePlanta(id, data)     { const [r] = await db.query('UPDATE planta_hospedera SET ? WHERE idPlanta = ?', [data, id]); return r; }
  static async deletePlanta(id)           { const [r] = await db.query('UPDATE planta_hospedera SET status = 0 WHERE idPlanta = ?', [id]); return r; }

  static async getAllOrganismos()         { const [r] = await db.query('SELECT * FROM organismo_hospedero ORDER BY nombre_organismo'); return r; }
  static async createOrganismo(data)      { const [r] = await db.query('INSERT INTO organismo_hospedero SET ?', [data]); return r; }
  static async updateOrganismo(id, data)  { const [r] = await db.query('UPDATE organismo_hospedero SET ? WHERE idOrganismo = ?', [data, id]); return r; }
  static async deleteOrganismo(id)        { const [r] = await db.query('UPDATE organismo_hospedero SET status = 0 WHERE idOrganismo = ?', [id]); return r; }

  static async getAllColecciones()        { const [r] = await db.query('SELECT * FROM coleccion ORDER BY acronimo'); return r; }
  static async createColeccion(data)      { const [r] = await db.query('INSERT INTO coleccion SET ?', [data]); return r; }
  static async updateColeccion(id, data)  { const [r] = await db.query('UPDATE coleccion SET ? WHERE idColeccion = ?', [data, id]); return r; }
  static async deleteColeccion(id)        { const [r] = await db.query('UPDATE coleccion SET status = 0 WHERE idColeccion = ?', [id]); return r; }

  static async getAllCitas()              { const [r] = await db.query('SELECT * FROM cita ORDER BY anio DESC, titulo'); return r; }
  static async createCita(data)           { const [r] = await db.query('INSERT INTO cita SET ?', [data]); return r; }
  static async updateCita(id, data)       { const [r] = await db.query('UPDATE cita SET ? WHERE idCita = ?', [data, id]); return r; }
  static async deleteCita(id)             { const [r] = await db.query('UPDATE cita SET status = 0 WHERE idCita = ?', [id]); return r; }

  static async getAllTaxonomia()          { const [r] = await db.query('SELECT t.*, p.nombre AS nombrePadre FROM taxonomia t LEFT JOIN taxonomia p ON t.idPadre = p.idTaxon ORDER BY t.rango, t.nombre'); return r; }
  static async createTaxonomia(data)      { const [r] = await db.query('INSERT INTO taxonomia SET ?', [data]); return r; }
  static async updateTaxonomia(id, data)  { const [r] = await db.query('UPDATE taxonomia SET ? WHERE idTaxon = ?', [data, id]); return r; }
  static async deleteTaxonomia(id)        { const [r] = await db.query('UPDATE taxonomia SET status = 0 WHERE idTaxon = ?', [id]); return r; }
}

module.exports = CatalogoModelo;

