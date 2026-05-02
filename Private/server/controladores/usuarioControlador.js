// ============================================================
// usuarioControlador.js — Controlador de usuarios
// ============================================================
// Maneja la lógica para obtener la lista de usuarios
// registrados en el sistema.
// ============================================================

const UsuarioModelo = require('../modelos/usuarioModelo');

class UsuarioControlador {

    // Maneja GET /api/users
    static async getUsers(req, res) {
        try {
            const users = await UsuarioModelo.getAllUsers();
            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Error fetching users', details: error.message });
        }
    }

    // Maneja POST /api/users
    static async createUser(req, res) {
        try {
            const { name, last_name, second_last_name, email, password, permisos } = req.body;
            
            if (!name || !last_name || !email || !password) {
                return res.status(400).json({ error: 'Faltan campos obligatorios' });
            }

            const newUserId = await UsuarioModelo.createUser(
                { name, last_name, second_last_name, email, password },
                permisos
            );

            res.status(201).json({ success: true, id: newUserId });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Error creating user', details: error.message });
        }
    }

    // Maneja PUT /api/users/:id
    static async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const { name, last_name, second_last_name, password, status, permisos } = req.body;

            const updated = await UsuarioModelo.updateUser(
                userId,
                { name, last_name, second_last_name, password, status },
                permisos
            );

            res.json({ success: updated });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Error updating user', details: error.message });
        }
    }

    // Maneja DELETE /api/users/:id
    static async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            const deleted = await UsuarioModelo.deleteUser(userId);
            if (!deleted) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Error deleting user', details: error.message });
        }
    }
}

module.exports = UsuarioControlador;
