class CatalogoModel {
    constructor() {
        this.apiBase = '../api';
        this.items = [];
        this.parentItems = [];
        
        this.PARENT_SECTION = {
            estado: 'pais',
            municipio: 'estado',
            localidad: 'municipio',
            familia: 'orden',
            subfamilia: 'familia',
            tribu: 'subfamilia',
            genero: 'tribu',
            especie: 'genero',
        };
    }

    async fetchData(section, loadParent = false) {
        try {
            // Admin table gets all records (active + inactive); parent selects only get active
            const promises = [fetch(`${this.apiBase}/catalogos.php?section=${section}&all=1`).then(r => r.json())];
            
            const parentSec = this.PARENT_SECTION[section];
            if (loadParent && parentSec) {
                // Parent items populate form selects → only active
                promises.push(fetch(`${this.apiBase}/catalogos.php?section=${parentSec}`).then(r => r.json()));
            }

            const results = await Promise.all(promises);
            this.items = results[0];
            if (results[1]) {
                this.parentItems = results[1]; // API already filters status=1
            } else {
                this.parentItems = [];
            }
            return { items: this.items, parentItems: this.parentItems };
        } catch (err) {
            console.error('fetchData error:', err);
            return { items: [], parentItems: [] };
        }
    }

    async createItem(section, data) {
        const response = await fetch(`${this.apiBase}/catalogos.php?section=${section}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`Error creando en ${section}`);
        return await response.json();
    }

    async updateItem(section, id, data) {
        const response = await fetch(`${this.apiBase}/catalogos.php?section=${section}&id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`Error actualizando en ${section}`);
        return await response.json();
    }

    async deleteItem(section, id) {
        const response = await fetch(`${this.apiBase}/catalogos.php?section=${section}&id=${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`Error eliminando en ${section}`);
        return await response.json();
    }
}

// Expose globally
window.CatalogoModel = new CatalogoModel();
