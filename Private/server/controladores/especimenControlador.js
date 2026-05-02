const EspecimenModelo = require('../modelos/especimenModelo');

class EspecimenControlador {
  static async getEspecimenes(req, res) {
    try {
      const data = await EspecimenModelo.getAllEspecimenes();
      res.json(data);
    } catch (error) {
      console.error('Error fetching especimenes:', error);
      res.status(500).json({ error: 'Error al obtener los especímenes', details: error.message });
    }
  }

  static async createEspecimen(req, res) {
    try {
      const id = await EspecimenModelo.createEspecimen(req.body);
      res.status(201).json({ success: true, id });
    } catch (error) {
      console.error('Error creating especimen:', error);
      res.status(500).json({ error: 'Error al registrar el espécimen', details: error.message });
    }
  }

  static async getEspecimenById(req, res) {
    try {
      const id = req.params.id;
      const data = await EspecimenModelo.getEspecimenById(id);
      if (!data) return res.status(404).json({ error: 'Espécimen no encontrado' });
      res.json(data);
    } catch (error) {
      console.error('Error fetching especimen by ID:', error);
      res.status(500).json({ error: 'Error al obtener el detalle', details: error.message });
    }
  }

  static async updateEspecimen(req, res) {
    try {
      const id = req.params.id;
      const updated = await EspecimenModelo.updateEspecimen(id, req.body);
      res.json({ success: updated });
    } catch (error) {
      console.error('Error updating especimen:', error);
      res.status(500).json({ error: 'Error al actualizar el espécimen', details: error.message });
    }
  }

  static async deleteEspecimen(req, res) {
    try {
      const id = req.params.id;
      const deleted = await EspecimenModelo.deleteEspecimen(id);
      res.json({ success: deleted });
    } catch (error) {
      console.error('Error deleting especimen:', error);
      res.status(500).json({ error: 'Error al eliminar el espécimen', details: error.message });
    }
  }
}

module.exports = EspecimenControlador;
