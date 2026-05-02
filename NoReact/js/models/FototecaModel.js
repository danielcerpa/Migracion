class FototecaModel {
    constructor() {
        this.apiBase = '../api';
        this.items = [];
    }

    async fetchFotos() {
        try {
            const response = await fetch(`${this.apiBase}/fototeca.php`);
            if (!response.ok) throw new Error('Error al obtener fototeca');
            this.items = await response.json();
            
            // Mock if empty
            if (this.items.length === 0) {
                this.items = [
                    {
                        id_foto: 1,
                        id_colector: null,
                        id_determinador: null,
                        id_especimen: 101,
                        ruta_archivo: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop',
                        descripcion_foto: 'Imagen de prueba 1',
                        fecha_subida: '2025-03-15 10:00:00',
                        status: 1,
                    },
                    {
                        id_foto: 2,
                        id_colector: 1,
                        id_determinador: null,
                        id_especimen: 101,
                        ruta_archivo: 'https://images.unsplash.com/photo-1470093851219-69951fcbb533?w=200&h=200&fit=crop',
                        descripcion_foto: null,
                        fecha_subida: '2025-03-16 09:30:00',
                        status: 1,
                    }
                ];
            }
            return this.items;
        } catch (err) {
            console.error('fetchFotos error:', err);
            return [];
        }
    }

    async createFoto(data) {
        const response = await fetch(`${this.apiBase}/fototeca.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error creando imagen');
        return await response.json();
    }

    async updateFoto(id, data) {
        const response = await fetch(`${this.apiBase}/fototeca.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error actualizando imagen');
        return await response.json();
    }

    async deleteFoto(id) {
        const response = await fetch(`${this.apiBase}/fototeca.php?id=${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error eliminando imagen');
        return await response.json();
    }
}

window.FototecaModel = new FototecaModel();
