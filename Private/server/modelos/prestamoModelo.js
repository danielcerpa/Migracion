const db = require('../configuracion/db');

class PrestamoModelo {
    // Obtener todos los prestamos activos (status = 1)
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM prestamo WHERE status = 1');
        return rows;
    }

    // Obtener un prestamo por ID
    static async getById(idPrestamo) {
        const [rows] = await db.query('SELECT * FROM prestamo WHERE idPrestamo = ? AND status = 1', [idPrestamo]);
        return rows[0];
    }

    // Crear un nuevo prestamo
    static async create(prestamo) {
        const { 
            idEjemplar, nombre_cientifico, nombre_comun, prestatario, institucion, fecha_prestamo, 
            fecha_devolucion_estimada, fecha_devolucion_real, 
            estado_prestamo, proposito, condicion_al_prestar, observaciones 
        } = prestamo;

        const [result] = await db.query(
            `INSERT INTO prestamo 
            (idEjemplar, nombre_cientifico, nombre_comun, prestatario, institucion, fecha_prestamo, fecha_devolucion_estimada, fecha_devolucion_real, estado_prestamo, proposito, condicion_al_prestar, observaciones) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [idEjemplar, nombre_cientifico, nombre_comun, prestatario, institucion, fecha_prestamo, fecha_devolucion_estimada, fecha_devolucion_real, estado_prestamo, proposito, condicion_al_prestar, observaciones]
        );
        return result.insertId;
    }

    // Actualizar un prestamo existente
    static async update(idPrestamo, prestamo) {
        const { 
            idEjemplar, nombre_cientifico, nombre_comun, prestatario, institucion, fecha_prestamo, 
            fecha_devolucion_estimada, fecha_devolucion_real, 
            estado_prestamo, proposito, condicion_al_prestar, observaciones 
        } = prestamo;

        const [result] = await db.query(
            `UPDATE prestamo SET 
            idEjemplar = ?, nombre_cientifico = ?, nombre_comun = ?, prestatario = ?, institucion = ?, fecha_prestamo = ?, 
            fecha_devolucion_estimada = ?, fecha_devolucion_real = ?, 
            estado_prestamo = ?, proposito = ?, condicion_al_prestar = ?, observaciones = ? 
            WHERE idPrestamo = ?`,
            [idEjemplar, nombre_cientifico, nombre_comun, prestatario, institucion, fecha_prestamo, fecha_devolucion_estimada, fecha_devolucion_real, estado_prestamo, proposito, condicion_al_prestar, observaciones, idPrestamo]
        );
        return result.affectedRows;
    }

    // "Eliminar" un prestamo (baja lógica)
    static async delete(idPrestamo) {
        const [result] = await db.query('UPDATE prestamo SET status = 0 WHERE idPrestamo = ?', [idPrestamo]);
        return result.affectedRows;
    }
}

module.exports = PrestamoModelo;
