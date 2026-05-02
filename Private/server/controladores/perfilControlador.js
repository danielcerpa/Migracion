// ============================================================
// perfilControlador.js — Controlador de perfiles
// ============================================================
// Maneja la lógica para obtener la lista de perfiles
// registrados en el sistema.
// ============================================================

const PerfilModelo = require('../modelos/perfilModelo');

class PerfilControlador {

    // Maneja GET /api/profiles
    static async getProfiles(req, res) {
        try {
            const profiles = await PerfilModelo.getAllProfiles();
            res.json(profiles);
        } catch (error) {
            console.error('Error fetching profiles:', error);
            res.status(500).json({ error: 'Error fetching profiles', details: error.message });
        }
    }

    // Maneja POST /api/profiles
    static async createProfile(req, res) {
        try {
            const newProfileId = await PerfilModelo.createProfile(req.body);
            res.status(201).json({ idProfile: newProfileId, message: 'Perfil creado exitosamente' });
        } catch (error) {
            console.error('Error creating profile:', error);
            res.status(500).json({ error: 'Error creating profile', details: error.message });
        }
    }

    // Maneja PUT /api/profiles/:id
    static async updateProfile(req, res) {
        try {
            const { id } = req.params;
            const success = await PerfilModelo.updateProfile(id, req.body);
            if (success) {
                res.json({ message: 'Perfil actualizado exitosamente' });
            } else {
                res.status(404).json({ error: 'Perfil no encontrado' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ error: 'Error updating profile', details: error.message });
        }
    }

    // Maneja DELETE /api/profiles/:id
    static async deleteProfile(req, res) {
        try {
            const { id } = req.params;
            const success = await PerfilModelo.deleteProfile(id);
            if (success) {
                res.json({ message: 'Perfil eliminado exitosamente' });
            } else {
                res.status(404).json({ error: 'Perfil no encontrado' });
            }
        } catch (error) {
            console.error('Error deleting profile:', error);
            res.status(500).json({ error: 'Error deleting profile', details: error.message });
        }
    }
}

module.exports = PerfilControlador;
