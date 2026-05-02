const db = require('../configuracion/db');

class AprobacionModelo {
  static async getAllPendientes() {
    const query = `
      SELECT 
        s.*, 
        u.name as usuario_nombre,
        u.last_name as usuario_apellido
      FROM solicitud_especimen s
      JOIN user u ON s.id_usuario = u.idUser
      WHERE s.estado = 'PENDIENTE'
      ORDER BY s.fecha_creacion DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  }

  static async updateEstado(idSolicitud, idRevisor, accion, comentarios = null) {
      const connection = await db.getConnection();
      try {
          await connection.beginTransaction();

          // 1. Actualizar estado de la solicitud
          const queryUpdate = 'UPDATE solicitud_especimen SET estado = ? WHERE id_solicitud = ?';
          await connection.query(queryUpdate, [accion, idSolicitud]);

          // 2. Insertar en el historial de revisiones
          const queryRevision = `
              INSERT INTO revision_solicitud (id_solicitud, id_revisor, accion, comentarios)
              VALUES (?, ?, ?, ?)
          `;
          await connection.query(queryRevision, [idSolicitud, idRevisor, accion, comentarios]);

          await connection.commit();
          return true;
      } catch (error) {
          await connection.rollback();
          throw error;
      } finally {
          connection.release();
      }
  }

  /**
   * Cuando se aprueba, se crea el espécimen real y se marca la solicitud.
   */
  static async aprobarSolicitud(idSolicitud, idRevisor, data, comentarios = null) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Crear el espécimen
        const fields = Object.keys(data);
        const placeholders = fields.map(() => '?').join(', ');
        const values = Object.values(data);
        const queryInsertEsp = `INSERT INTO especimenes (${fields.join(', ')}) VALUES (${placeholders})`;
        const [resultEsp] = await connection.query(queryInsertEsp, values);
        const idEspecimen = resultEsp.insertId;

        // 2. Actualizar la solicitud a APROBADA y vincular el espécimen creado
        const queryUpdateSol = 'UPDATE solicitud_especimen SET estado = "APROBADA", id_especimen = ? WHERE id_solicitud = ?';
        await connection.query(queryUpdateSol, [idEspecimen, idSolicitud]);

        // 3. Insertar en historial de revisiones
        const queryRevision = `
            INSERT INTO revision_solicitud (id_solicitud, id_revisor, accion, comentarios)
            VALUES (?, ?, 'APROBADA', ?)
        `;
        await connection.query(queryRevision, [idSolicitud, idRevisor, comentarios]);

        await connection.commit();
        return idEspecimen;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
  }
}

module.exports = AprobacionModelo;
