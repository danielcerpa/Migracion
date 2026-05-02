class AprobacionModel {
    constructor() {
        this.apiBase = '../api';
        this.items = [];
    }

    async fetchAprobaciones() {
        try {
            // Intento consultar la DB
            const response = await fetch(`${this.apiBase}/aprobaciones.php`);
            if (!response.ok) throw new Error('No api');
            this.items = await response.json();
            
            if (this.items.length === 0) throw new Error('Empty');
            
            return this.items;
        } catch (err) {
            // MOCK DATA si falla o no existe la tabla
            this.items = [
                {
                    id_solicitud: 1,
                    id_usuario: 2,
                    usuario_nombre: 'Carlos',
                    usuario_apellido: 'Mendoza Ruiz',
                    estado: 'PENDIENTE',
                    fecha_creacion: '2026-04-24 10:30:00',
                    datos_propuestos: {
                        nombre_cientifico: 'Dynastes hercules',
                        nombre_comun: 'Escarabajo Hércules',
                        orden: 'Coleoptera',
                        familia: 'Dynastidae',
                        municipio: 'Xalapa',
                        localidad: 'Briones',
                        coleccion: 'CP-UV',
                        fecha_colecta: '2026-03-15'
                    }
                },
                {
                    id_solicitud: 2,
                    id_usuario: 3,
                    usuario_nombre: 'Sofía',
                    usuario_apellido: 'López García',
                    estado: 'PENDIENTE',
                    fecha_creacion: '2026-04-23 14:15:00',
                    datos_propuestos: {
                        nombre_cientifico: 'Morpho menelaus',
                        nombre_comun: 'Mariposa Morpho Azul',
                        orden: 'Lepidoptera',
                        familia: 'Morphidae',
                        municipio: 'Coatepec',
                        localidad: 'El Lencero',
                        coleccion: 'LEPI-UV',
                        fecha_colecta: '2026-04-01'
                    }
                }
            ];
            return this.items;
        }
    }

    async approve(id) {
        // MOCK API call
        // const response = await fetch(`${this.apiBase}/aprobaciones.php?action=approve&id=${id}`, { method: 'POST' });
        this.items = this.items.filter(i => i.id_solicitud !== id);
        return true;
    }

    async reject(id, comentario) {
        // MOCK API call
        this.items = this.items.filter(i => i.id_solicitud !== id);
        return true;
    }

    async returnRequest(id, comentario) {
        // MOCK API call
        this.items = this.items.filter(i => i.id_solicitud !== id);
        return true;
    }
}

window.AprobacionModel = new AprobacionModel();
