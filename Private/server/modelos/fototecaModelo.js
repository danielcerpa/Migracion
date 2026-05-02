const db = require('../configuracion/db');

class FototecaModelo {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM fototeca WHERE status = 1');
        return rows;
    }

    static async getById(idFoto) {
        const [rows] = await db.query(
            'SELECT * FROM fototeca WHERE id_foto = ? AND status = 1',
            [idFoto]
        );
        return rows[0];
    }

    static async create(foto) {
        const { id_colector, id_determinador, id_especimen, ruta_archivo, descripcion_foto } = foto;

        const [result] = await db.query(
            `INSERT INTO fototeca (id_colector, id_determinador, id_especimen, ruta_archivo, descripcion_foto)
            VALUES (?, ?, ?, ?, ?)`,
            [
                id_colector ?? null,
                id_determinador ?? null,
                id_especimen,
                ruta_archivo,
                descripcion_foto ?? null
            ]
        );
        return result.insertId;
    }

    static async update(idFoto, foto) {
        const { id_colector, id_determinador, id_especimen, ruta_archivo, descripcion_foto } = foto;

        const [result] = await db.query(
            `UPDATE fototeca SET
            id_colector = ?, id_determinador = ?, id_especimen = ?, ruta_archivo = ?, descripcion_foto = ?
            WHERE id_foto = ? AND status = 1`,
            [
                id_colector ?? null,
                id_determinador ?? null,
                id_especimen,
                ruta_archivo,
                descripcion_foto ?? null,
                idFoto
            ]
        );
        return result.affectedRows;
    }

    static async delete(idFoto) {
        const [result] = await db.query(
            'UPDATE fototeca SET status = 0 WHERE id_foto = ? AND status = 1',
            [idFoto]
        );
        return result.affectedRows;
    }
}

module.exports = FototecaModelo;
