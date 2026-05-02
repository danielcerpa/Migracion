// ============================================================
// moduloControlador.js — Controlador de módulos
// ============================================================
// Maneja la lógica para obtener los módulos del sistema a los
// que un usuario tiene acceso según sus permisos.
// ============================================================

const ModuloModelo = require('../modelos/moduloModelo');

class ModuloControlador {

    // Maneja GET /api/modules?userId=X
    static async getModules(req, res) {
        try {
            const { userId } = req.query; // Lee el userId de los parámetros de la URL
            const modules = await ModuloModelo.getActiveModules(userId); // Consulta la BD
            res.json(modules); // Devuelve la lista de módulos al frontend
        } catch (error) {
            console.error('Error fetching modules:', error);
            res.status(500).json({ error: 'Error fetching modules', details: error.message });
        }
    }

    // Maneja GET /api/modules/all
    static async getAllModules(req, res) {
        try {
            const modules = await ModuloModelo.getAllModules();
            res.json(modules);
        } catch (error) {
            console.error('Error fetching all modules:', error);
            res.status(500).json({ error: 'Error fetching all modules', details: error.message });
        }
    }
}

module.exports = ModuloControlador;
