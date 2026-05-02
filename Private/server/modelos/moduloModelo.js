// ============================================================
// moduloModelo.js — Modelo de módulos
// ============================================================
// Contiene las consultas SQL para obtener los módulos del
// sistema. Filtra por usuario y por estado activo (status=1).
// ============================================================

const db = require('../configuracion/db');

class ModuloModelo {

    // Devuelve los módulos activos a los que un usuario tiene acceso.
    // Si no se pasa userId, devuelve un array vacío (sin acceso).
    static async getActiveModules(userId) {
        if (userId) {
            const query = `
                SELECT m.*, pr.key_add, pr.key_edit, pr.key_delete, pr.key_export
                FROM module m
                JOIN permissions p ON m.idModule = p.idModule
                JOIN profile pr ON p.idProfile = pr.idProfile
                WHERE m.status = 1 AND p.idUser = ? AND pr.nickname != 'Sin Acceso'
            `;
            const [rows] = await db.query(query, [userId]);
            return rows;
        } else {
             return []; // Sin userId no se devuelve nada
        }
    }

    // Devuelve todos los módulos activos del sistema
    static async getAllModules() {
        const query = `
            SELECT * 
            FROM module
            WHERE status = 1
            ORDER BY idModule ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    }
}

module.exports = ModuloModelo;
