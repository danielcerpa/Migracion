class FototecaModel {
    constructor() {
        this.apiBase = '../api';
        this.items = [];
    }

    async fetchFotos() {
        try {
            const response = await fetch(`${this.apiBase}/fototeca.php`);
            if (!response.ok) throw new Error('Error al obtener fototeca');
            const data = await response.json();
            this.items = Array.isArray(data) ? data : [];
            return this.items;
        } catch (err) {
            console.error('fetchFotos error:', err);
            this.items = [];
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
