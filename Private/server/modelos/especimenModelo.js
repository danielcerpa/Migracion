const db = require('../configuracion/db');

class EspecimenModelo {
  static async getAllEspecimenes() {
    const query = `
      SELECT 
        e.*,
        sp.nombre as especie_nombre,
        loc.nombre as localidad_nombre,
        col.nombre as colector_nombre,
        det.nombre as determinador_nombre
      FROM especimenes e
      LEFT JOIN especie sp ON e.id_especie = sp.idEspecie
      LEFT JOIN localidad loc ON e.id_localidad = loc.idLocalidad
      LEFT JOIN colector col ON e.id_colector = col.idColector
      LEFT JOIN determinador det ON e.id_determinador = det.idDeterminador
      WHERE e.status = 1
      ORDER BY e.id_especimen DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  }

  static async createEspecimen(data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const values = Object.values(data);

    const query = `INSERT INTO especimenes (${fields.join(', ')}) VALUES (${placeholders})`;
    const [result] = await db.query(query, values);
    return result.insertId;
  }

  static async getEspecimenById(id) {
    const query = `
      SELECT e.*, 
             sp.nombre as especie_nombre, 
             loc.nombre as localidad_nombre
      FROM especimenes e
      LEFT JOIN especie sp ON e.id_especie = sp.idEspecie
      LEFT JOIN localidad loc ON e.id_localidad = loc.idLocalidad
      WHERE e.id_especimen = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  }

  static async updateEspecimen(id, data) {
    const fields = Object.keys(data);
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const query = `UPDATE especimenes SET ${setClause} WHERE id_especimen = ?`;
    const [result] = await db.query(query, values);
    return result.affectedRows > 0;
  }

  static async deleteEspecimen(id) {
    const query = 'UPDATE especimenes SET status = 0 WHERE id_especimen = ?';
    const [result] = await db.query(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = EspecimenModelo;
