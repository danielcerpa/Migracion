const FototecaModelo = require('../modelos/fototecaModelo');

class FototecaControlador {
    static async getAll(req, res) {
        try {
            const fotos = await FototecaModelo.getAll();
            res.json(fotos);
        } catch (error) {
            console.error('Error fetching fototeca:', error);
            res.status(500).json({ error: 'Error fetching fototeca', details: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const foto = await FototecaModelo.getById(id);
            if (!foto) {
                return res.status(404).json({ error: 'Foto not found' });
            }
            res.json(foto);
        } catch (error) {
            console.error('Error fetching foto by id:', error);
            res.status(500).json({ error: 'Error fetching foto', details: error.message });
        }
    }

    static async create(req, res) {
        try {
            const newId = await FototecaModelo.create(req.body);
            res.status(201).json({ id_foto: newId, message: 'Foto created successfully' });
        } catch (error) {
            console.error('Error creating foto:', error);
            res.status(500).json({ error: 'Error creating foto', details: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await FototecaModelo.update(id, req.body);
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Foto not found' });
            }
            res.json({ message: 'Foto updated successfully' });
        } catch (error) {
            console.error('Error updating foto:', error);
            res.status(500).json({ error: 'Error updating foto', details: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await FototecaModelo.delete(id);
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Foto not found' });
            }
            res.json({ message: 'Foto deleted successfully' });
        } catch (error) {
            console.error('Error deleting foto:', error);
            res.status(500).json({ error: 'Error deleting foto', details: error.message });
        }
    }
}

module.exports = FototecaControlador;
