class EspecimenModel {
    constructor() {
        this.apiBase = '../api';
        this.items = [];
    }

    async fetchEspecimenes() {
        try {
            const response = await fetch(`${this.apiBase}/especimenes.php`);
            if (!response.ok) throw new Error('Error al obtener especímenes');
            this.items = await response.json();
            
            // Mock if empty
            if (this.items.length === 0) {
                this.items = [{
                    id_especimen: 9999,
                    nombre_comun: 'Mariposa Monarca (Mock)',
                    nombre_cientifico: 'Danaus plexippus',
                    orden_nombre: 'Lepidoptera',
                    familia_nombre: 'Nymphalidae',
                    genero_nombre: 'Danaus',
                    especie_nombre: 'Danaus plexippus',
                    pais_nombre: 'México',
                    estado_nombre: 'Michoacán',
                    latitud_n: 19.567,
                    longitud_o: -100.283,
                    fecha_colecta: '2023-11-15T00:00:00Z',
                    colector_nombre: 'Dr. López',
                    status: 1
                }];
            }
            return this.items;
        } catch (err) {
            console.error('fetchEspecimenes error:', err);
            return [];
        }
    }

    async createEspecimen(data) {
        const response = await fetch(`${this.apiBase}/especimenes.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error creando espécimen');
        return await response.json();
    }

    async updateEspecimen(id, data) {
        const response = await fetch(`${this.apiBase}/especimenes.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error actualizando espécimen');
        return await response.json();
    }

    async deleteEspecimen(id) {
        const response = await fetch(`${this.apiBase}/especimenes.php?id=${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error eliminando espécimen');
        return await response.json();
    }
}

window.EspecimenModel = new EspecimenModel();
