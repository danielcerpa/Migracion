class PrestamoModel {
    constructor() {
        this.apiBase = '../api';
        this.items = [];
    }

    async fetchPrestamos() {
        try {
            const response = await fetch(`${this.apiBase}/prestamos.php`);
            if (!response.ok) throw new Error('Error al obtener préstamos');
            const data = await response.json();
            this.items = Array.isArray(data) ? data : [];
            return this.items;
        } catch (err) {
            console.error('fetchPrestamos error:', err);
            this.items = [];
            return [];
        }
    }

    prestamoId(item) {
        if (!item) return null;
        return item.idPrestamo ?? item.idprestamo ?? null;
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
        const pid = id == null ? '' : String(id);
        const response = await fetch(`${this.apiBase}/prestamos.php?id=${pid}`, {
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
