class PrestamoModel {
    constructor() {
        this.apiBase = '../api';
        this.items = [];
    }

    async fetchPrestamos() {
        try {
            const response = await fetch(`${this.apiBase}/prestamos.php`);
            if (!response.ok) throw new Error('Error al obtener préstamos');
            this.items = await response.json();
            
            // Mock if empty
            if (this.items.length === 0) {
                this.items = [
                    {
                        idPrestamo: 1001,
                        idEjemplar: 9999,
                        prestatario: 'Dr. Alejandro Fernández',
                        institucion: 'Universidad Autónoma',
                        fecha_prestamo: '2025-01-15T00:00:00Z',
                        fecha_devolucion_estimada: '2025-06-15T00:00:00Z',
                        fecha_devolucion_real: '',
                        estado_prestamo: 'Activo',
                        proposito: 'Investigación taxonómica',
                        condicion_al_prestar: 'Buen estado, ala derecha ligeramente rasgada',
                        observaciones: 'Requiere cuidado especial de humedad',
                        status: 1
                    },
                    {
                        idPrestamo: 1002,
                        idEjemplar: 9998,
                        prestatario: 'Dra. María González',
                        institucion: 'Instituto de Biología',
                        fecha_prestamo: '2024-09-10T00:00:00Z',
                        fecha_devolucion_estimada: '2024-12-10T00:00:00Z',
                        fecha_devolucion_real: '2024-12-05T00:00:00Z',
                        estado_prestamo: 'Devuelto',
                        proposito: 'Exposición temporal',
                        condicion_al_prestar: 'Perfecto estado',
                        observaciones: 'Devuelto sin novedades',
                        status: 1
                    }
                ];
            }
            return this.items;
        } catch (err) {
            console.error('fetchPrestamos error:', err);
            return [];
        }
    }

    async createPrestamo(data) {
        const response = await fetch(`${this.apiBase}/prestamos.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error creando préstamo');
        return await response.json();
    }

    async updatePrestamo(id, data) {
        const response = await fetch(`${this.apiBase}/prestamos.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error actualizando préstamo');
        return await response.json();
    }

    async deletePrestamo(id) {
        const response = await fetch(`${this.apiBase}/prestamos.php?id=${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error eliminando préstamo');
        return await response.json();
    }
}

window.PrestamoModel = new PrestamoModel();
