// ============================================================
// perfilModelo.js — Modelo de perfiles
// ============================================================
// Contiene todas las consultas SQL relacionadas a perfiles.
// ============================================================

const db = require('../configuracion/db');

class PerfilModelo {

    // Devuelve todos los perfiles registrados en el sistema
    static async getAllProfiles() {
        const [rows] = await db.query('SELECT * FROM profile');
        return rows;
    }

    // Crea un nuevo perfil
    static async createProfile(profileData) {
        const { nickname, description, key_add, key_delete, key_edit, key_export } = profileData;
        const [result] = await db.query(
            'INSERT INTO profile (nickname, description, key_add, key_delete, key_edit, key_export) VALUES (?, ?, ?, ?, ?, ?)',
            [nickname, description, key_add, key_delete, key_edit, key_export]
        );
        return result.insertId;
    }

    // Actualiza un perfil existente
    static async updateProfile(idProfile, profileData) {
        const { nickname, description, key_add, key_delete, key_edit, key_export } = profileData;
        const [result] = await db.query(
            'UPDATE profile SET nickname = ?, description = ?, key_add = ?, key_delete = ?, key_edit = ?, key_export = ? WHERE idProfile = ?',
            [nickname, description, key_add, key_delete, key_edit, key_export, idProfile]
        );
        return result.affectedRows > 0;
    }

    // Elimina un perfil (borrado físico según la tabla actual)
    static async deleteProfile(idProfile) {
        const [result] = await db.query('DELETE FROM profile WHERE idProfile = ?', [idProfile]);
        return result.affectedRows > 0;
    }
}

module.exports = PerfilModelo;
