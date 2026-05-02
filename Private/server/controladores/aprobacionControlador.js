const AprobacionModelo = require('../modelos/aprobacionModelo');

class AprobacionControlador {
  static async getPendientes(req, res) {
    try {
      const data = await AprobacionModelo.getAllPendientes();
      res.json(data);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      res.status(500).json({ error: 'Error al obtener solicitudes pendientes' });
    }
  }

  static async aprobar(req, res) {
    const { idSolicitud } = req.params;
    const { idRevisor, data, comentarios } = req.body;
    try {
      const idEspecimen = await AprobacionModelo.aprobarSolicitud(idSolicitud, idRevisor, data, comentarios);
      res.json({ success: true, idEspecimen });
    } catch (error) {
      console.error('Error approving request:', error);
      res.status(500).json({ error: 'Error al aprobar la solicitud' });
    }
  }

  static async rechazar(req, res) {
    const { idSolicitud } = req.params;
    const { idRevisor, comentarios } = req.body;
    try {
      await AprobacionModelo.updateEstado(idSolicitud, idRevisor, 'RECHAZADA', comentarios);
      res.json({ success: true });
    } catch (error) {
      console.error('Error rejecting request:', error);
      res.status(500).json({ error: 'Error al rechazar la solicitud' });
    }
  }

  static async regresar(req, res) {
    const { idSolicitud } = req.params;
    const { idRevisor, comentarios } = req.body;
    try {
      await AprobacionModelo.updateEstado(idSolicitud, idRevisor, 'REGRESADA', comentarios);
      res.json({ success: true });
    } catch (error) {
      console.error('Error returning request:', error);
      res.status(500).json({ error: 'Error al regresar la solicitud' });
    }
  }
}

module.exports = AprobacionControlador;
