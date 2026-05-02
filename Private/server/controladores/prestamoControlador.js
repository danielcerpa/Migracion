const PrestamoModelo = require('../modelos/prestamoModelo');

class PrestamoControlador {
    // GET /api/prestamos
    static async getAll(req, res) {
        try {
            const prestamos = await PrestamoModelo.getAll();
            res.json(prestamos);
        } catch (error) {
            console.error('Error fetching prestamos:', error);
            res.status(500).json({ error: 'Error fetching prestamos', details: error.message });
        }
    }

    // GET /api/prestamos/:id
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const prestamo = await PrestamoModelo.getById(id);
            if (!prestamo) {
                return res.status(404).json({ error: 'Prestamo not found' });
            }
            res.json(prestamo);
        } catch (error) {
            console.error('Error fetching prestamo by id:', error);
            res.status(500).json({ error: 'Error fetching prestamo', details: error.message });
        }
    }

    // POST /api/prestamos
    static async create(req, res) {
        try {
            const newId = await PrestamoModelo.create(req.body);
            res.status(201).json({ id: newId, message: 'Prestamo created successfully' });
        } catch (error) {
            console.error('Error creating prestamo:', error);
            res.status(500).json({ error: 'Error creating prestamo', details: error.message });
        }
    }

    // PUT /api/prestamos/:id
    static async update(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await PrestamoModelo.update(id, req.body);
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Prestamo not found' });
            }
            res.json({ message: 'Prestamo updated successfully' });
        } catch (error) {
            console.error('Error updating prestamo:', error);
            res.status(500).json({ error: 'Error updating prestamo', details: error.message });
        }
    }

    // DELETE /api/prestamos/:id
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const affectedRows = await PrestamoModelo.delete(id);
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Prestamo not found' });
            }
            res.json({ message: 'Prestamo deleted successfully' });
        } catch (error) {
            console.error('Error deleting prestamo:', error);
            res.status(500).json({ error: 'Error deleting prestamo', details: error.message });
        }
    }
}

module.exports = PrestamoControlador;
