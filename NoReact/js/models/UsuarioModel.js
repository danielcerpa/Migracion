class UsuarioModel {
    constructor() {
        this.apiBase = '../api';
        this.users = [];
        this.modules = [];
        this.profiles = [];
    }

    async fetchUsers() {
        try {
            const response = await fetch(`${this.apiBase}/users.php`);
            if (!response.ok) throw new Error('Error al obtener usuarios');
            this.users = await response.json();
            return this.users;
        } catch (err) {
            console.error('fetchUsers error:', err);
            return [];
        }
    }

    async getModulesAll() {
        try {
            const response = await fetch(`${this.apiBase}/modules.php`);
            if (!response.ok) throw new Error('Error al obtener módulos');
            this.modules = await response.json();
            return this.modules;
        } catch (err) {
            console.error('getModulesAll error:', err);
            return [];
        }
    }

    async getProfilesAll() {
        try {
            const response = await fetch(`${this.apiBase}/profiles.php`);
            if (!response.ok) throw new Error('Error al obtener perfiles');
            this.profiles = await response.json();
            return this.profiles;
        } catch (err) {
            console.error('getProfilesAll error:', err);
            return [];
        }
    }

    async createUser(data) {
        const response = await fetch(`${this.apiBase}/users.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error creando usuario');
        return await response.json();
    }

    async updateUser(id, data) {
        const response = await fetch(`${this.apiBase}/users.php?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error actualizando usuario');
        return await response.json();
    }

    async deleteUser(id) {
        const response = await fetch(`${this.apiBase}/users.php?id=${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error eliminando usuario');
        return await response.json();
    }
}

// Expose globally
window.UsuarioModel = new UsuarioModel();
