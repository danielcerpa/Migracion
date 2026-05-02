class PerfilModel {
    constructor() {
        this.apiBase = '../api';
        this.profiles = [];
    }

    async fetchProfiles() {
        try {
            const response = await fetch(`${this.apiBase}/profiles.php`);
            if (!response.ok) throw new Error('Error al obtener perfiles');
            this.profiles = await response.json();
            return this.profiles;
        } catch (err) {
            console.error('fetchProfiles error:', err);
            return [];
        }
    }

    async createProfile(data) {
        const response = await fetch(`${this.apiBase}/profiles.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error creando perfil');
        return await response.json();
    }

    async updateProfile(id, data) {
        const response = await fetch(`${this.apiBase}/profiles.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error actualizando perfil');
        return await response.json();
    }

    async deleteProfile(id) {
        const response = await fetch(`${this.apiBase}/profiles.php?id=${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error eliminando perfil');
        return await response.json();
    }
}

// Expose globally
window.PerfilModel = new PerfilModel();
